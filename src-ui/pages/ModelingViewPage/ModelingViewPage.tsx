import type { MouseEventHandler, WheelEventHandler } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { Container, Graphics, Stage } from '@pixi/react';
import type { Graphics as PixiGraphics } from '@pixi/graphics';
import { View } from '../../BuildingView2D/application/view/View';
import { Point as PixiPoint } from 'pixi.js';
import { Logic } from '../../BuildingView2D/application/logic/Logic';
import {
	decrementCurrentLevel,
	decrementScale,
	incrementCurrentLevel,
	incrementModelingStep,
	incrementScale,
	setAnchorCoordinates,
	setBim,
	setBuildingElement,
	setCurrentLevel,
	setEvacuationTimeInSec,
	setModelingStep,
	setModelingTimerId,
	setPeopleInsideBuilding,
	setPeopleOutsideBuilding,
	setScale,
	setTimeData
} from '../../store/slices/BuildingViewSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { store } from '../../store';
import cn from 'classnames';
import styles from './ModelingViewPage.module.css';
import FloorInfo from '../../components/modeling/FloorInfo';
import ControlPanel from '../../components/modeling/ControlPanel';
import { getConfig } from '../../store/actionCreators/getConfig';
import type { BimJson } from '../../interfaces/BimJson';
import { open } from '@tauri-apps/api/dialog';
import { readTextFile } from '@tauri-apps/api/fs';
import { runEvacuationModeling } from '../../rustCalls';
import type { BuildElementJson } from '../../interfaces/BuildElementJson';
import { Mathem } from '../../BuildingView2D/application/mathem/Mathem';

const ModelingViewPage = () => {
	const dispatch = useAppDispatch();
	const {
		currentLevel,
		scale,
		timeData,
		bim,
		anchorCoordinates,
		evacuationTimeStep,
		evacuationTimeInSec
	} = useAppSelector(state => state.buildingViewReducer);
	const [buildingDataIsLoading, setBuildingDataIsLoading] = useState<boolean>(false);
	const [canMove, setCanMove] = useState<boolean>(false);

	useEffect(() => {
		dispatch(setScale(8));
		void dispatch(getConfig());
		if (!bim) {
			void openFileDialog();
		}
		window.addEventListener('keydown', handleWindowKeydown);
		return () => {
			window.removeEventListener('keydown', handleWindowKeydown);
		};
	}, []);

	const openFileDialog = async () => {
		const filePaths = await open({
			directory: false,
			multiple: false,
			title: 'Open BIM file',
			filters: [{ name: 'BIM json', extensions: ['json'] }]
		});
		setBuildingDataIsLoading(true);
		const filePath = filePaths instanceof Array ? filePaths[0] : filePaths;
		if (filePath !== null) {
			const buildingData = JSON.parse(await readTextFile(filePath)) as BimJson;
			try {
				const modelingResult = await runEvacuationModeling(filePath);
				dispatch(setModelingStep(0));
				dispatch(setBim(buildingData));
				dispatch(setTimeData(modelingResult.distribution_by_time_steps));
				dispatch(setCurrentLevel(0));
				dispatch(setPeopleOutsideBuilding(0));
				dispatch(
					setPeopleInsideBuilding(
						Math.floor(
							Logic.totalNumberOfPeople(modelingResult.distribution_by_time_steps)
						)
					)
				);
			} catch (e) {
				console.error(e);
			}
		}
		setBuildingDataIsLoading(false);
	};

	const drawPeople = useCallback(
		(g: PixiGraphics) => {
			const rooms = timeData?.items[evacuationTimeStep].rooms ?? [];
			const peopleCoordinates = Logic.generatePeopleCoordinates(
				bim.Level[currentLevel],
				rooms
			);
			g.clear();
			View.drawPeople(g, peopleCoordinates);
		},
		[bim, timeData, currentLevel, evacuationTimeInSec]
	);

	const drawBuildingElement = useCallback(
		(g: PixiGraphics, buildingElement: BuildElementJson) => {
			let color = 'rgb(255, 255, 255)';
			switch (buildingElement.Sign) {
				case 'Staircase':
					color = 'rgb(49, 152, 0)';
					break;
				case 'DoorWay':
				case 'DoorWayInt':
					color = 'rgb(227, 237, 31)';
					break;
				case 'DoorWayOut':
					color = 'rgb(40, 0, 255)';
					break;
			}
			g.clear();
			View.drawBuildingRoomPixi(g, buildingElement.XY[0].points, color);
			g.endFill();
		},
		[]
	);

	const handleOpenFile = async () => {
		await openFileDialog();
	};

	const handleCanvasWheel: WheelEventHandler<HTMLCanvasElement> = event => {
		switch (Math.sign(event.deltaY)) {
			case -1:
				dispatch(incrementScale());
				break;
			case +1:
				dispatch(decrementScale());
				break;
		}
	};

	const handleCanvasMouseDown: MouseEventHandler<HTMLCanvasElement> = (
		e: React.MouseEvent<HTMLCanvasElement>
	) => {
		e.preventDefault();
		setCanMove(true);
	};

	const handleCanvasMouseUp: MouseEventHandler<HTMLCanvasElement> = _ => {
		setCanMove(false);
	};

	const handleCanvasMouseOut: MouseEventHandler<HTMLCanvasElement> = _ => {
		setCanMove(false);
	};

	const handleCanvasMouseMove: MouseEventHandler<HTMLCanvasElement> = event => {
		if (canMove) {
			dispatch(
				setAnchorCoordinates(
					new PixiPoint(
						anchorCoordinates.x + event.movementX,
						anchorCoordinates.y + event.movementY
					)
				)
			);
		}
	};

	const handleWindowKeydown = (event: KeyboardEvent) => {
		const {
			buildingViewReducer: { currentLevel, bim }
		} = store.getState();
		switch (event.key) {
			case 'ArrowUp':
				if (bim && currentLevel < bim.Level.length - 1) {
					dispatch(incrementCurrentLevel());
				}
				break;
			case 'ArrowDown':
				if (bim && currentLevel > 0) {
					dispatch(decrementCurrentLevel());
				}
				break;
			case '=':
			case '+':
				dispatch(incrementScale());
				break;
			case '-':
			case '_':
				dispatch(decrementScale());
				break;
		}
	};

	const handleBuildingElementClick = (buildingElement: BuildElementJson) => {
		const length = Math.abs(
			buildingElement.XY[0].points[0].x - buildingElement.XY[0].points[2].x
		);
		const width = Math.abs(
			buildingElement.XY[0].points[0].y - buildingElement.XY[0].points[2].y
		);
		const peopleDensity = timeData?.items[evacuationTimeStep].rooms.find(
			room => room.uuid === buildingElement.Id
		)?.density;
		dispatch(
			setBuildingElement({
				area: Number(Mathem.calculateBuildArea(buildingElement).toFixed(1)),
				level: currentLevel,
				type: buildingElement.Sign,
				name: buildingElement.Name,
				id: buildingElement.Id,
				numberOfPeople: Math.round(peopleDensity ?? 0),
				length,
				width
			})
		);
	};

	const handlePlayButtonClick = () => {
		const {
			buildingViewReducer: { modelingTimerId }
		} = store.getState();
		if (!Boolean(modelingTimerId)) {
			const timerId = window.setInterval(() => {
				dispatch(incrementModelingStep());
				const {
					buildingViewReducer: { evacuationTimeStep, timeData, evacuationTimeInSec }
				} = store.getState();
				const numberOfPeopleInsideBuilding =
					timeData?.items[evacuationTimeStep].rooms
						.filter(room => room.uuid !== '00000000-0000-0000-0000-000000000000')
						.reduce((totalDensity, room) => totalDensity + room.density, 0) ?? 0;
				const numberOfPeopleOutsideBuilding =
					Logic.totalNumberOfPeople(timeData) - numberOfPeopleInsideBuilding;

				dispatch(setPeopleInsideBuilding(Math.floor(numberOfPeopleInsideBuilding)));
				dispatch(setPeopleOutsideBuilding(Math.floor(numberOfPeopleOutsideBuilding)));
				dispatch(
					setEvacuationTimeInSec(
						timeData?.items[evacuationTimeStep].time ?? evacuationTimeInSec
					)
				);
				if (evacuationTimeStep >= (timeData?.items.length ?? 0) - 1) {
					stopModelingLoop();
				}
			}, 100);
			dispatch(setModelingTimerId(timerId));
		}
	};

	const handlePauseButtonClick = () => {
		stopModelingLoop();
	};

	const stopModelingLoop = () => {
		const {
			buildingViewReducer: { modelingTimerId }
		} = store.getState();
		if (Boolean(modelingTimerId)) {
			window.clearInterval(modelingTimerId);
			dispatch(setModelingTimerId(undefined));
		}
	};

	return (
		<main className={cn(styles.container, 'text-sm font-medium text-white')}>
			<FloorInfo onOpenFile={handleOpenFile} />
			{bim && !buildingDataIsLoading ? (
				<div className="w-full h-full overflow-hidden">
					<Stage
						id="canvas"
						width={window.innerWidth}
						height={window.innerHeight}
						options={{
							backgroundColor: 0xffffff,
							antialias: true
						}}
						onWheel={handleCanvasWheel}
						onMouseMove={handleCanvasMouseMove}
						onMouseDown={handleCanvasMouseDown}
						onMouseUp={handleCanvasMouseUp}
						onMouseOut={handleCanvasMouseOut}
					>
						{/*<Stats />*/}
						<Container scale={scale} x={anchorCoordinates.x} y={anchorCoordinates.y}>
							{bim.Level[currentLevel].BuildElement.map(buildingElement => (
								<Graphics
									key={buildingElement.Id}
									draw={g => drawBuildingElement(g, buildingElement)}
									eventMode="static"
									cursor="pointer"
									onclick={() => handleBuildingElementClick(buildingElement)}
								/>
							))}
							<Graphics draw={drawPeople} />
						</Container>
					</Stage>
				</div>
			) : (
				<div className="flex justify-center items-center">
					<span className="text-black text-3xl">Загрузка...</span>
				</div>
			)}
			<ControlPanel
				onPlayButtonClick={handlePlayButtonClick}
				onPauseButtonClick={handlePauseButtonClick}
				onIncrementLevelButtonClick={() => {}}
				onDecrementLevelButtonClick={() => {}}
			/>
		</main>
	);
};

export default ModelingViewPage;
