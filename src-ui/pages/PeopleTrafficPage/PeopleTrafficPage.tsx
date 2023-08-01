import type { FC, MouseEventHandler, WheelEventHandler } from 'react';
import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import styles from './PeopleTrafficPage.module.css';
import FloorInfo from '../../components/modeling/FloorInfo';
import BuildingView from '../../components/modeling/BuildingView';
import ControlPanel from '../../components/modeling/ControlPanel';
import { App } from '../../BuildingView2D/application/app';
import {
	decrementCurrentLevel,
	incrementCurrentLevel,
	setBuildingElement
} from '../../store/slices/BuildingViewSlice';
import { useAppDispatch } from '../../hooks/redux';
import type { FileEntry } from '@tauri-apps/api/fs';
import { readDir, BaseDirectory } from '@tauri-apps/api/fs';

const PeopleTrafficPage: FC = _ => {
	const [bimFiles, setBimFiles] = useState<FileEntry[]>([]);
	let app: App | null = null;
	const dispatch = useAppDispatch();

	useEffect(() => {
		void loadBimFiles();
	}, []);

	const loadBimFiles = async () => {
		const files = await readDir('resources', { dir: BaseDirectory.AppData });
		setBimFiles(files);
	};

	const onBuildingViewMount = () => {
		app = new App('field', 'canvas_container');
		app.startRendering();
		window.addEventListener('keydown', handleWindowKeydown);
	};

	const onBuildingViewUnmount = () => {
		app?.stopRendering();
		window.removeEventListener('keydown', handleWindowKeydown);
	};

	const handleWindowKeydown = (event: KeyboardEvent) => {
		if (app) {
			switch (event.key) {
				case 'ArrowUp':
					if (app.logic.level < app.logic.struct.Level.length - 1) {
						app.logic.level++;
						dispatch(incrementCurrentLevel());
					}
					break;
				case 'ArrowDown':
					if (app.logic.level > 0) {
						app.logic.level--;
						dispatch(decrementCurrentLevel());
					}
					break;
				case '=':
				case '+':
					app.data.scale++;
					break;
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
		if (app?.logic.choiceBuild) {
			dispatch(
				setBuildingElement({
					id: app.logic.choiceBuild.Id,
					area: Math.floor(app.mathem.calculateBuildArea(app.logic.choiceBuild)),
					name: app.logic.choiceBuild.Name,
					type: app.logic.choiceBuild.Sign,
					level: app.logic.struct.Level[app.logic.level].ZLevel,
					numberOfPeople: app.logic.getPeopleCountInChoiceRoom()
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

	const handleCanvasMouseDown: MouseEventHandler<HTMLCanvasElement> = event => {
		event.preventDefault();
		if (app) {
			app.canMove = true;
		}
	};

	const handleCanvasMouseUp: MouseEventHandler<HTMLCanvasElement> = _ => {
		if (app) {
			app.canMove = false;
		}
	};

	const handleCanvasMouseOut: MouseEventHandler<HTMLCanvasElement> = _ => {
		if (app) {
			app.canMove = false;
		}
	};

	const handleCanvasMouseMove: MouseEventHandler<HTMLCanvasElement> = event => {
		if (app?.canMove === true) {
			app.logic.mouseMove(event);
		}
	};

	const handlePlayButtonClick: MouseEventHandler = _ => {
		if (app?.timerTimeDataUpdatePause === true) {
			app.startModeling();
			app.timerTimeDataUpdatePause = false;
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
		if (app?.timerTimeDataUpdatePause === false) {
			app.timerTimeDataUpdatePause = true;
			app.isGifStop = true;
		}
		if (app?.ui.videoRecorder.recordingState === 'recording') {
			app.ui.videoRecorder.pause();
		}
	};
	const handleSpeedUpButtonClick: MouseEventHandler = _ => {};
	const handleSpeedDownButtonClick: MouseEventHandler = _ => {};

	return (
		<main className={cn(styles.container, 'text-sm font-medium text-white')}>
			<FloorInfo fileList={bimFiles.map(file => file.name ?? 'Undefined name')} />
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

export default PeopleTrafficPage;
