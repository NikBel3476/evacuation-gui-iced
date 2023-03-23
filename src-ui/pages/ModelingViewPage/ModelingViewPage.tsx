import React, {
	KeyboardEventHandler,
	MouseEventHandler,
	useCallback,
	useEffect,
	useState,
	WheelEventHandler
} from 'react';
import { Container, Graphics, Stage } from '@pixi/react';
import { Graphics as PixiGraphics } from '@pixi/graphics';
import buildingData from '../../peopleTraffic/udsu_b1_L4_v2_190701.json';
import evacuationTimeData from '../../peopleTraffic/udsu_b1_L4_v2_190701_mv_csv.json';
import { View } from '../../BuildingView2D/application/view/View';
import { Point as PixiPoint } from 'pixi.js';
import { Point } from '../../BuildingView2D/application/Interfaces/Building';
import { Logic } from '../../BuildingView2D/application/logic/Logic';
import {
	decrementCurrentLevel,
	decrementScale,
	incrementCurrentLevel,
	incrementScale,
	setScale
} from '../../store/slices/BuildingViewSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { store } from '../../store';

const ModelingViewPage = () => {
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
		dispatch(setScale(5));
		window.addEventListener('keydown', handleWindowKeydown);
		return () => {
			window.removeEventListener('keydown', handleWindowKeydown);
		};
	}, [dispatch]);

	const draw = useCallback(
		(g: PixiGraphics) => {
			g.clear();
			// g.beginFill(0xff3300);
			// g.lineStyle(4, 0xffd900, 1);
			// g.moveTo(50, 50);
			// g.lineTo(250, 50);
			// g.lineTo(100, 100);
			// g.lineTo(50, 50);
			// g.endFill();
			// g.lineStyle(2, 0x0000ff, 1);
			// g.beginFill(0xff700b, 1);
			// g.drawRect(50, 150, 120, 120);
			// g.lineStyle(2, 0xff00ff, 1);
			// g.beginFill(0xff00bb, 0.25);
			// g.drawRoundedRect(150, 100, 300, 100, 15);
			// g.endFill();
			// g.lineStyle(0);
			// g.beginFill(0xffff0b, 0.5);
			// g.drawCircle(470, 90, 60);
			// g.endFill();
			View.drawBuildingRoomsPixi(g, buildingData.Level[currentLevel].BuildElement);
			View.drawPeople(g, peopleCoordinates);
		},
		[peopleCoordinates]
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

	return (
		<Stage
			id="canvas"
			options={{ backgroundColor: 0xffffff }}
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
	);
};

export default ModelingViewPage;
