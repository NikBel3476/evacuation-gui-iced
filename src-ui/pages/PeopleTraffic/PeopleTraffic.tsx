import React, { FC, MouseEventHandler, WheelEventHandler } from 'react';
import cn from 'classnames';
import styles from './PeopleTraffic.module.css';
import FloorInfo from '../../components/modeling/FloorInfo';
import BuildingView from '../../components/modeling/BuildingView';
import ControlPanel from '../../components/modeling/ControlPanel';
import { App } from '../../BuildingView2D/application/app';
import { setBuildingElement } from '../../store/slices/BuildingViewSlice';
import { useAppDispatch } from '../../hooks/redux';

const PeopleTraffic: FC = () => {
	let app: App | null = null;
	const dispatch = useAppDispatch();

	const onBuildingViewMount = () => {
		app = new App();
		app.startRendering();
		document.addEventListener('keydown', handleDocumentKeydown);
	};

	const onBuildingViewUnmount = () => {
		document.removeEventListener('keydown', handleDocumentKeydown);
		app?.stopRendering();
	};

	const handleDocumentKeydown = (event: KeyboardEvent) => {
		if (app) {
			switch (event.key) {
				// Повысить этаж
				case 'ArrowUp':
					app.data.level += app.data.level + 1 < app.data.struct.Level.length ? 1 : 0;
					break;
				// Понизить этаж
				case 'ArrowDown':
					app.data.level -= app.data.level - 1 >= 0 ? 1 : 0;
					break;
				// Увеличить zoom
				case '=':
				case '+':
					app.data.scale++;
					break;
				// Уменьшить zoom
				case '-':
				case '_':
					app.data.scale--;
					break;
			}
			app.logic.updateBuildsInCamera();
			app.logic.updatePeopleInCamera();
		}
	};

	const handleCanvasDoubleClick: MouseEventHandler<HTMLCanvasElement> = event => {
		app?.logic.toChoiceBuild(event);
		if (app?.data.choiceBuild) {
			dispatch(
				setBuildingElement({
					id: app.data.choiceBuild.Id,
					area: Math.floor(app.mathem.calculateBuildArea(app.data.choiceBuild)),
					name: app.data.choiceBuild.Name,
					type: app.data.choiceBuild.Sign,
					level: app.data.struct.Level[app.data.level].ZLevel,
					numberOfPeople: app.ui.getPeopleCountInChoiceRoom()
				})
			);
		}
	};

	const handleCanvasWheel: WheelEventHandler<HTMLCanvasElement> = event => {
		if (app) {
			switch (Math.sign(event.deltaY)) {
				case -1: // Увеличить zoom
					app.data.scale += 0.5;
					break;
				case +1: // Уменьшить zoom
					app.data.scale -= 0.5;
					break;
			}
			app.logic.updateBuildsInCamera();
			app.logic.updatePeopleInCamera();
		}
	};

	const handleCanvasMouseDown: MouseEventHandler<HTMLCanvasElement> = _ => {
		if (app) {
			app.data.canMove = true;
		}
	};

	const handleCanvasMouseUp: MouseEventHandler<HTMLCanvasElement> = _ => {
		if (app) {
			app.data.canMove = false;
		}
	};

	const handleCanvasMouseOut: MouseEventHandler<HTMLCanvasElement> = _ => {
		if (app) {
			app.data.canMove = false;
		}
	};

	const handleCanvasMouseMove: MouseEventHandler<HTMLCanvasElement> = event => {
		if (app?.data.canMove === true) {
			app.logic.mouseMove(event);
		}
	};

	const handlePlayButtonClick: MouseEventHandler = _ => {
		if (app?.ui.data.timerTimeDataUpdatePause === true) {
			app.startModeling();
			app.ui.data.timerTimeDataUpdatePause = false;
		}
		switch (app?.ui.videoRecorder.recordingState) {
			case 'inactive':
				app.ui.videoRecorder.startRecording();
				break;
			case 'paused':
				app.ui.videoRecorder.resume();
				break;
			case 'recording':
				app.ui.videoRecorder.stopRecording();
				app.ui.videoRecorder.download();
				break;
			default:
				break;
		}
	};

	const handlePauseButtonClick: MouseEventHandler = _ => {
		if (app?.ui.data.timerTimeDataUpdatePause === false) {
			app.ui.data.timerTimeDataUpdatePause = true;
			app.ui.data.isGifStop = true;
		}
		if (app?.ui.videoRecorder.recordingState === 'recording') {
			app.ui.videoRecorder.pause();
		}
	};
	const handleSpeedUpButtonClick: MouseEventHandler = _ => {};
	const handleSpeedDownButtonClick: MouseEventHandler = _ => {};

	return (
		<main className={cn(styles.container, 'text-sm font-medium text-white')}>
			<FloorInfo />
			<BuildingView
				onMount={onBuildingViewMount}
				onUnmount={onBuildingViewUnmount}
				onCanvasDoubleClick={handleCanvasDoubleClick}
				onCanvasWheel={handleCanvasWheel}
				onCanvasMouseDown={handleCanvasMouseDown}
				onCanvasMouseUp={handleCanvasMouseUp}
				onCanvasMouseOut={handleCanvasMouseOut}
				onCanvasMouseMove={handleCanvasMouseMove}
			/>
			<ControlPanel
				onPlayButtonClick={handlePlayButtonClick}
				onPauseButtonClick={handlePauseButtonClick}
				onSpeedUpButtonClick={handleSpeedUpButtonClick}
				onSpeedDownButtonClick={handleSpeedDownButtonClick}
			/>
		</main>
	);
};

export default PeopleTraffic;
