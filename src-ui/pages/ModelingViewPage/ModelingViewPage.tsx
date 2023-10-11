import type { ChangeEvent, MouseEventHandler, WheelEventHandler } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Graphics, Sprite, Stage, Text } from '@pixi/react';
import type { Graphics as PixiGraphics } from '@pixi/graphics';
import timeData from '../../peopleTraffic/udsu_b1_L4_v2_190701_mv_csv.json';
import { View } from '../../BuildingView2D/application/view/View';
import { Point as PixiPoint, Polygon, Rectangle } from 'pixi.js';
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
import { runEvacuationModeling } from '../../rustCalls';
import type { EvacuationModelingResult } from '../../types/ModelingResult';
import { BuildElementJson } from '../../interfaces/BuildElementJson';
import { BlurFilter } from 'pixi.js';
import bunnyImg from './bunny.png';

// const app = new Application({
// 	view: document.getElementById('canvas-pixi'),
// 	width: window.innerWidth,
// 	height: window.innerHeight,
// 	backgroundColor: 0xffffff,
// 	antialias: true
// });
// const root = createRoot(app.stage);
// root.render(<Text text="Allo" x={150} y={100} />);

const ModelingViewPage = () => {
	useMemo(() => new BlurFilter(0), []);
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
		void dispatch(getConfig());
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
			// View.drawBuildingRoomsPixi(g, buildingData.Level[currentLevel].BuildElement);
			View.drawPeople(g, peopleCoordinates);
			g.interactive = true;
			g.onmouseenter = e => {
				console.log(e);
			};
		},
		[currentLevel, peopleCoordinates, buildingData]
	);

	const drawBuildingElement = useCallback(
		(g: PixiGraphics, buildingElement: BuildElementJson) => {
			// g.clear();
			// View.drawBuildingRoomsPixi(g, buildingData.Level[currentLevel].BuildElement);
			g.beginFill('0x000000');
			const polygon = new Polygon(buildingElement.XY[0].points.slice(1));
			g.drawShape(polygon);
			// g.hitArea = polygon;
			// g.interactive = true;
			// g.cursor = 'pointer';
			// g.eventMode = 'static';
			// g.onclick = () => {
			// 	console.log(buildingElement);
			// };
			// g.onmousedown = () => {
			// 	console.log(buildingElement);
			// };
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
		// e.preventDefault();
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

	const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		// console.log(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
		// console.log(anchorCoordinates);
		console.log(
			Logic.findBuildingElementByCoordinates(
				buildingData,
				new PixiPoint(e.nativeEvent.offsetX, e.nativeEvent.offsetY),
				scale
			)
		);
	};

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
					options={{
						backgroundColor: 0xffffff,
						antialias: true
						// eventMode: 'static'
						// eventFeatures: {
						// 	click: true,
						// 	move: true,
						// 	wheel: true
						// }
					}}
					// onWheel={handleCanvasWheel}
					// onMouseMove={handleCanvasMouseMove}
					// onMouseDown={handleCanvasMouseDown}
					// onMouseUp={handleCanvasMouseUp}
					// onMouseOut={handleCanvasMouseOut}
					// onDoubleClick={handleDoubleClick}
				>
					{/*<Stats />*/}
					{/*<Container scale={scale} x={anchorCoordinates.x} y={anchorCoordinates.y}>
						<Graphics draw={draw} />
						{buildingData.Level[currentLevel].BuildElement.map(buildingElement => (
							<Graphics
								key={buildingElement.Id}
								draw={g => drawBuildingElement(g, buildingElement)}
								onpointerdown={() => {
									console.log(buildingElement);
								}}
								interactive={true}
								eventMode={'passive'}
								on={'mousedown'}
							/>
						))}
					</Container>*/}
					{/*{buildingData.Level[currentLevel].BuildElement.map(buildingElement => (
						<Graphics
							scale={scale}
							key={buildingElement.Id}
							draw={g => drawBuildingElement(g, buildingElement)}
							interactive={true}
							eventMode="static"
							cursor="pointer"
						/>
					))}*/}
					<Sprite
						image={bunnyImg}
						x={200}
						y={200}
						width={100}
						height={100}
						interactive={true}
						eventMode={'static'}
						cursor={'pointer'}
						onpointerdown={() => console.log('allo')}
						pointerdown={() => console.log('allo')}
						onmousedown={() => console.log('hello')}
						mousedown={() => console.log('hello')}
					/>
					{/*<Graphics
						// cursor="pointer"
						interactive={true}
						// eventMode={'static'}
						// hitArea={new Rectangle(0, 0, 100, 100)}
						x={0}
						y={0}
						width={100}
						height={100}
						// onclick={() => {
						// 	console.log('ON CLICKING!!');
						// }}
						draw={g => {
							g.clear();
							g.lineStyle(4, 0x000000);
							g.beginFill(0xff0000);
							g.drawRect(0, 0, 100, 100);
							g.endFill();
						}}
						onmousemove={() => {
							console.log('onmousemove called');
						}}
						// draw={g => {
						// 	g.beginFill(0x000000);
						// 	g.drawRect(50, 50, 100, 100);
						// 	g.cursor = 'pointer';
						// }}
					/>*/}
					{/*<Text
						text="hello"
						x={150}
						y={150}
						cursor="pointer"
						// eventMode="static"
						interactive={true}
						onpointerdown={() => console.log('click')}
						pointerdown={() => console.log('click')}
					/>*/}
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
