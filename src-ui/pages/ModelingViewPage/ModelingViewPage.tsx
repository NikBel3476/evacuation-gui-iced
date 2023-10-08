import type { ChangeEvent, MouseEventHandler, WheelEventHandler } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { Container, Graphics, Stage } from '@pixi/react';
import type { Graphics as PixiGraphics } from '@pixi/graphics';
import timeData from '../../peopleTraffic/udsu_b1_L4_v2_190701_mv_csv.json';
import { View } from '../../BuildingView2D/application/view/View';
import { Point as PixiPoint } from 'pixi.js';
import type { Point } from '../../BuildingView2D/application/Interfaces/Building';
import { Logic } from '../../BuildingView2D/application/logic/Logic';
import {
	decrementCurrentLevel,
	decrementScale,
	incrementCurrentLevel,
	incrementScale,
	setBim,
	setCurrentLevel,
	setPeopleInsideBuilding,
	setPeopleOutsideBuilding,
	setScale
} from '../../store/slices/BuildingViewSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { store } from '../../store';
import cn from 'classnames';
import styles from './ModelingViewPage.module.css';
import FloorInfo from '../../components/modeling/FloorInfo';
import ControlPanel from '../../components/modeling/ControlPanel';
import type { TimeData } from '../../BuildingView2D/application/Interfaces/TimeData';
import { getConfig } from '../../store/actionCreators/getConfig';
import { bimFiles } from '../../consts/bimFiles';
import type { BimJson } from '../../interfaces/BimJson';
import { open } from '@tauri-apps/api/dialog';
import { readTextFile } from '@tauri-apps/api/fs';
import Stats from '../../components/PIXI/Stats';
import { runEvacuationModeling } from '../../rustCalls';

const ModelingViewPage = () => {
	const [buildingDataIsLoading, setBuildingDataIsLoading] = useState<boolean>(false);
	const [buildingData, setBuildingData] = useState<BimJson /*| null*/>(
		bimFiles[Object.keys(bimFiles)[0]]
		// null
	);
	const [showStats, setShowStats] = useState<boolean>(true);
	const [evacuationTimeData, setEvacuationTimeData] = useState<TimeData>(
		timeData as TimeData
	);
	const { currentLevel, scale } = useAppSelector(state => state.buildingViewReducer);
	const dispatch = useAppDispatch();
	const [canMove, setCanMove] = useState<boolean>(false);
	const [anchorCoordinates, setAnchorCoordinates] = useState<PixiPoint>(
		new PixiPoint(0, 0)
	);
	const [peopleCoordinates, setPeopleCoordinates] = useState<Point[]>(
		/*Logic.generatePeopleCoordinates(
			buildingData.Level[currentLevel],
			evacuationTimeData.items
		)*/
		[]
	);
	const [modelingResult, setModelingResult] = useState<EvacuationModelingResult | null>(
		null
	);

	useEffect(() => {
		dispatch(setScale(8));
		dispatch(getConfig());
		// openFileDialog();
	}, []);

	// FIXME: resolve access to state in window events
	useEffect(() => {
		window.addEventListener('keydown', handleWindowKeydown);
		return () => {
			window.removeEventListener('keydown', handleWindowKeydown);
		};
	}, [buildingData]);

	const loadBuildingData = () => {};

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
				setModelingResult(modelingResult);
				const peopleCoordinates = Logic.generatePeopleCoordinates(
					buildingData.Level[currentLevel],
					modelingResult.distribution_by_time_steps.items
				);
				dispatch(setCurrentLevel(0));
				setBuildingData(buildingData); // TODO: use buildingData from redux
				dispatch(setBim(buildingData));
				setPeopleCoordinates(peopleCoordinates);
				dispatch(setPeopleOutsideBuilding(0));
				dispatch(
					setPeopleInsideBuilding(
						Logic.totalNumberOfPeople(modelingResult.distribution_by_time_steps)
					)
				);
			} catch (e) {
				console.error(e);
			}
		}
		setBuildingDataIsLoading(false);
	};

	const draw = useCallback(
		(g: PixiGraphics) => {
			g.clear();
			View.drawBuildingRoomsPixi(g, buildingData.Level[currentLevel].BuildElement);
			View.drawPeople(g, peopleCoordinates);
		},
		[currentLevel, peopleCoordinates, buildingData]
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
		e: React.MouseEvent<HTMLCanvaselement>
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
			setAnchorCoordinates(
				p => new PixiPoint(p.x + event.movementX, p.y + event.movementY)
			);
		}
	};

	const handleWindowKeydown = (event: KeyboardEvent) => {
		const {
			buildingViewReducer: { currentLevel }
		} = store.getState();
		switch (event.key) {
			case 'ArrowUp':
				if (currentLevel < buildingData.Level.length - 1 && modelingResult) {
					dispatch(incrementCurrentLevel());
					const {
						buildingViewReducer: { currentLevel: updatedLevel }
					} = store.getState();
					setPeopleCoordinates(
						Logic.generatePeopleCoordinates(
							buildingData.Level[updatedLevel],
							modelingResult.distribution_by_time_steps.items
						)
					);
				}
				break;
			case 'ArrowDown':
				if (currentLevel > 0 && modelingResult) {
					dispatch(decrementCurrentLevel());
					const {
						buildingViewReducer: { currentLevel: updatedLevel }
					} = store.getState();
					setPeopleCoordinates(
						Logic.generatePeopleCoordinates(
							buildingData.Level[updatedLevel],
							modelingResult.distribution_by_time_steps.items
						)
					);
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

	const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {};

	const handleSelectFileChange = (e: ChangeEvent<HTMLSelectElement>) => {
		dispatch(setCurrentLevel(0));
		setBuildingData(bimFiles[e.target.value]);
		dispatch(setBim(bimFiles[e.target.value]));
	};

	return (
		<main className={cn(styles.container, 'text-sm font-medium text-white')}>
			<FloorInfo onOpenFile={handleOpenFile} />
			<div className="w-full h-full overflow-hidden">
				<Stage
					id="canvas"
					width={window.innerWidth}
					height={window.innerHeight}
					options={{ backgroundColor: 0xffffff, antialias: true }}
					onWheel={handleCanvasWheel}
					onMouseMove={handleCanvasMouseMove}
					onMouseDown={handleCanvasMouseDown}
					onMouseUp={handleCanvasMouseUp}
					onMouseOut={handleCanvasMouseOut}
					onDoubleClick={handleDoubleClick}
				>
					<Stats />
					<Container scale={scale} x={anchorCoordinates.x} y={anchorCoordinates.y}>
						<Graphics draw={draw} />
					</Container>
				</Stage>
			</div>
			{/*{buildingData && !buildingDataIsLoading ? (
				<div className="w-full h-full overflow-hidden">
					<Stage
						id="canvas"
						width={window.innerWidth}
						height={window.innerHeight}
						options={{ backgroundColor: 0xffffff, antialias: true }}
						onWheel={handleCanvasWheel}
						onMouseMove={handleCanvasMouseMove}
						onMouseDown={handleCanvasMouseDown}
						onMouseUp={handleCanvasMouseUp}
						onMouseOut={handleCanvasMouseOut}
						onDoubleClick={handleDoubleClick}
					>
						<Stats />
						<Container scale={scale} x={anchorCoordinates.x} y={anchorCoordinates.y}>
							<Graphics draw={draw} />
						</Container>
					</Stage>
				</div>
			) : (
				<div className="flex justify-center items-center">
					<span className="text-black text-3xl">Загрузка...</span>
				</div>
			)}*/}
			<ControlPanel
				onPlayButtonClick={() => {}}
				onPauseButtonClick={() => {}}
				onSpeedUpButtonClick={() => {}}
				onSpeedDownButtonClick={() => {}}
			/>
		</main>
	);
};

export default ModelingViewPage;
