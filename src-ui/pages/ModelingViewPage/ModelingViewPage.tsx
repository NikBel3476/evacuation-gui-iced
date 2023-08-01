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

const ModelingViewPage = () => {
	const [buildingData, setBuildingData] = useState<BimJson>(
		bimFiles[Object.keys(bimFiles)[0]]
	);

	const evacuationTimeData = timeData as TimeData;
	const { currentLevel, scale } = useAppSelector(state => state.buildingViewReducer);
	const dispatch = useAppDispatch();
	const [canMove, setCanMove] = useState<boolean>(false);
	const [anchorCoordinates, setAnchorCoordinates] = useState<PixiPoint>(
		new PixiPoint(0, 0)
	);
	const [peopleCoordinates, setPeopleCoordinates] = useState<Point[]>(
		Logic.generatePeopleCoordinates(
			buildingData.Level[currentLevel],
			evacuationTimeData.items
		)
	);

	useEffect(() => {
		dispatch(setScale(8));
		void dispatch(getConfig());
	}, [dispatch]);

	// FIXME: resolve access to state in window events
	useEffect(() => {
		window.addEventListener('keydown', handleWindowKeydown);
		return () => {
			window.removeEventListener('keydown', handleWindowKeydown);
		};
	}, [buildingData]);

	const draw = useCallback(
		(g: PixiGraphics) => {
			g.clear();
			View.drawBuildingRoomsPixi(g, buildingData.Level[currentLevel].BuildElement);
			View.drawPeople(g, peopleCoordinates);
		},
		[currentLevel, peopleCoordinates, buildingData]
	);

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

	const handleCanvasMouseDown: MouseEventHandler<HTMLCanvasElement> = _ => {
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
				if (currentLevel < buildingData.Level.length - 1) {
					dispatch(incrementCurrentLevel());
					const {
						buildingViewReducer: { currentLevel: updatedLevel }
					} = store.getState();
					setPeopleCoordinates(
						Logic.generatePeopleCoordinates(
							buildingData.Level[updatedLevel],
							evacuationTimeData.items
						)
					);
				}
				break;
			case 'ArrowDown':
				if (currentLevel > 0) {
					dispatch(decrementCurrentLevel());
					const {
						buildingViewReducer: { currentLevel: updatedLevel }
					} = store.getState();
					setPeopleCoordinates(
						Logic.generatePeopleCoordinates(
							buildingData.Level[updatedLevel],
							evacuationTimeData.items
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

	const handleSelectFileChange = (e: ChangeEvent<HTMLSelectElement>) => {
		void dispatch(setCurrentLevel(0));
		setBuildingData(bimFiles[e.target.value]);
		void dispatch(setBim(bimFiles[e.target.value]));
	};

	return (
		<main className={cn(styles.container, 'text-sm font-medium text-white')}>
			<FloorInfo
				fileList={Object.keys(bimFiles)}
				onSelectChange={handleSelectFileChange}
			/>
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
				>
					<Container scale={scale} x={anchorCoordinates.x} y={anchorCoordinates.y}>
						<Graphics draw={draw} />
					</Container>
				</Stage>
			</div>
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
