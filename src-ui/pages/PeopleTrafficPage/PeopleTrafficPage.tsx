import type { FC, MouseEventHandler, WheelEventHandler } from 'react';
import React, { useEffect, useState, useCallback } from 'react';
import cn from 'classnames';
import styles from './PeopleTrafficPage.module.css';
import FloorInfo from '../../components/modeling/FloorInfo';
import BuildingView from '../../components/modeling/BuildingView';
import ControlPanel from '../../components/modeling/ControlPanel';
import { App } from '../../BuildingView2D/application/app';
import {
	decrementCurrentLevel,
	incrementCurrentLevel,
	setBuildingElement,
	setCurrentLevel
} from '../../store/slices/BuildingViewSlice';
import { useAppDispatch } from '../../hooks/redux';
import type { FileEntry } from '@tauri-apps/api/fs';
import { readDir, BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import { bimFiles, timeDataFiles } from '../../consts/bimFiles';
import { Building } from '../../BuildingView2D/application/Interfaces/Building';
import { TimeData } from '../../peopleTraffic/js/application/Interfaces/TimeData';
import { open } from '@tauri-apps/api/dialog';
import { runEvacuationModeling } from '../../rustCalls';

let app: App | null = null;

const PeopleTrafficPage: FC = _ => {
	const [bimFileEntries, setBimFileEntries] = useState<FileEntry[]>([]);
	const dispatch = useAppDispatch();

	useEffect(() => {
		void load();
	}, []);

	const load = async () => {
		void (await loadBimFiles());
		void (await loadTimeData());
	};

	const loadBimFiles = async () => {};

	const loadTimeData = async () => {};

	const onBuildingViewMount = useCallback(async () => {
		const files = await readDir('resources', { dir: BaseDirectory.AppData });
		setBimFileEntries(files.filter(fileEntry => fileEntry.path.endsWith('.json')));
		const bimFile = files[2].path;
		const buildingData = await readTextFile(bimFile);
		// const timeData = await readTextFile(files[2].path);
		const modelingResult = await runEvacuationModeling(bimFile);
		app = new App(
			'field',
			'canvas_container',
			JSON.parse(buildingData),
			modelingResult.distribution_by_time_steps
		);
		app.startRendering();
		window.addEventListener('keydown', handleWindowKeydown);
	}, []);

	const onBuildingViewUnmount = useCallback(() => {
		app?.stopRendering();
		window.removeEventListener('keydown', handleWindowKeydown);
	}, []);

	const handleOpenFile = async () => {
		const filePaths = await open({
			directory: false,
			multiple: false,
			title: 'Open BIM file',
			filters: [{ name: 'BIM json', extensions: ['json'] }]
		});
		const filePath = filePaths instanceof Array ? filePaths[0] : filePaths ?? '';
		const buildingData = JSON.parse(await readTextFile(filePath));
		if (app && Boolean(buildingData)) {
			const modelingResult = await runEvacuationModeling(filePath);
			app.logic.level = 0;
			app.logic.timeData = modelingResult.distribution_by_time_steps;
			dispatch(setCurrentLevel(0));
			app.server.data = buildingData as Building;
			app.logic.struct = buildingData as Building;
			app.logic.updateBuildsInCamera();
			app.logic.updatePeopleInBuilds();
			app.logic.updatePeopleInCamera();
		}
	};

	const handleSelectFileChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		// const buildingData = bimFiles[`../res/${e.target.value}`];
		const fileEntry = bimFileEntries.find(fileEntry => fileEntry.name === e.target.value);
		const buildingData = JSON.parse(await readTextFile(fileEntry?.path ?? ''));
		if (app && Boolean(buildingData)) {
			// FIXME: handle state when timeData is undefined
			// const timeData = timeDataFiles[`../res/${e.target.value}`];
			// if (timeData) {
			// 	app.logic.timeData = JSON.parse(timeData) as TimeData;
			// }

			app.logic.level = 0;
			dispatch(setCurrentLevel(0));
			app.server.data = buildingData as Building;
			app.logic.struct = buildingData as Building;
			app.logic.updateBuildsInCamera();
			app.logic.updatePeopleInBuilds();
			app.logic.updatePeopleInCamera();
		}
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

	const handleCanvasDoubleClick: MouseEventHandler<HTMLCanvasElement> = useCallback(
		event => {
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
		},
		[]
	);

	const handleCanvasWheel: WheelEventHandler<HTMLCanvasElement> = useCallback(event => {
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
	}, []);

	const handleCanvasMouseDown: MouseEventHandler<HTMLCanvasElement> = useCallback(
		event => {
			event.preventDefault();
			if (app) {
				app.canMove = true;
			}
		},
		[]
	);

	const handleCanvasMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback(_ => {
		if (app) {
			app.canMove = false;
		}
	}, []);

	const handleCanvasMouseOut: MouseEventHandler<HTMLCanvasElement> = useCallback(_ => {
		if (app) {
			app.canMove = false;
		}
	}, []);

	const handleCanvasMouseMove: MouseEventHandler<HTMLCanvasElement> = useCallback(
		event => {
			if (app?.canMove === true) {
				app.logic.mouseMove(event);
			}
		},
		[]
	);

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
			<FloorInfo
				fileList={bimFileEntries.map(file => file.name ?? 'Undefined name')}
				onSelectChange={handleSelectFileChange}
				onOpenFile={handleOpenFile}
			/>
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
