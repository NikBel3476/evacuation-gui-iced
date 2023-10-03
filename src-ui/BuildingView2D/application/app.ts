import { Server } from './server/Server.js';
import { View } from './view/View.js';
import { UI } from './ui/UI.js';
import { Mathem } from './mathem/Mathem.js';
import { Logic } from './logic/Logic.js';
import { Canvas } from './canvas/Canvas.js';
import type { BuildingElement, Point, Building } from './Interfaces/Building';
import { GIFEncoder } from '../../peopleTraffic/js/vendor/toGif/GIFEncoder';
import { VideoRecorder } from '../VideoRecorder/VideoRecorder';
import type { TimeData, TimeState } from './Interfaces/TimeData';

function* timeDataGenerator(timeData: TimeData) {
	for (const timeState of timeData.items) {
		yield timeState;
	}
	return timeData.items[timeData.items.length - 1];
}

export class App {
	server: Server;
	canvas: Canvas;
	mathem: Mathem;
	videoRecorder: VideoRecorder;
	data: {
		cameraXY: Point;
		scale: number;

		activeBuilds: BuildingElement[];
	};

	view: View;
	ui: UI;
	logic: Logic;
	encoder;
	timerTimeDataUpdatePause = true;
	isGifStop = false;
	canMove = false;
	private renderLoopId: number | null = null;
	private timerTimeDataUpdateId: number | null = null;
	private fps = 0;
	private fpsOut = 0;
	private timestamp: number = performance.now();
	private nextTimeState: Generator;
	private currentTimeState: TimeState;

	constructor(
		public canvasId: string,
		public canvasContainerId: string,
		buildingData: Building,
		timeData: TimeData,
		onModelingTick?: (numberOfPeople: number, numberOfEvacuatedPeople: number) => void
	) {
		// Инициализация настроек, сервера, инструментария канвас и модуля отрисовки
		this.server = new Server(buildingData);
		this.canvas = new Canvas({ canvasId, canvasContainerId });
		this.mathem = new Mathem();
		this.videoRecorder = new VideoRecorder(this.canvas.canvas);
		this.data = {
			cameraXY: { x: 0, y: 0 },
			scale: 20,

			activeBuilds: []
		};
		this.view = new View({
			canvas: this.canvas,
			data: this.data,
			mathem: this.mathem
		});
		this.ui = new UI({
			mathem: this.mathem,
			videoRecorder: this.videoRecorder
		});
		this.logic = new Logic({
			view: this.view,
			ui: this.ui,
			data: this.data,
			mathem: this.mathem,
			server: this.server,
			timeData,
			onModelingTick
		});
		// @ts-expect-error written in js
		this.encoder = new GIFEncoder();
		this.nextTimeState = timeDataGenerator(timeData);
		this.currentTimeState = this.nextTimeState.next().value;

		// Инициализация первичных настроек
		this.init();
	}

	init() {
		this.logic.toInitialCoordination();
		this.logic.toScreenAdjustment();
		this.logic.updatePeopleInBuilds();
		this.logic.updatePeopleInCamera();
		this.logic.updateNumberOfPeopleInsideBuildingLabel();

		this.gifInit(1000); // Инициализация настроек
	}

	startRendering() {
		this.fps++;
		const currentTimestamp = performance.now();
		if (currentTimestamp - this.timestamp >= 1000) {
			this.timestamp = currentTimestamp;
			this.fpsOut = this.fps;
			this.fps = 0;
		}
		this.logic.updateField();
		this.canvas.text(String(this.fpsOut), 0, 30, 'black', 30);
		this.renderLoopId = window.requestAnimationFrame(() => {
			this.startRendering();
		});
	}

	stopRendering() {
		if (this.renderLoopId !== null) {
			window.cancelAnimationFrame(this.renderLoopId);
			this.renderLoopId = null;
		}
	}

	startModeling() {
		if (this.timerTimeDataUpdateId === null) {
			this.timerTimeDataUpdateId = window.setInterval(() => {
				this.updateTimeData();
			}, 500);
		}
	}

	stopModeling() {
		if (this.timerTimeDataUpdateId !== null) {
			window.clearInterval(this.timerTimeDataUpdateId);
			this.timerTimeDataUpdateId = null;
		}
	}

	updateTimeData() {
		// try {
		// 	this.currentTimeState = this.nextTimeState.next();
		// } catch (e) {
		// 	console.log(e);
		// }
		if (!this.timerTimeDataUpdatePause) {
			this.ui.evacuationTimeInSec++; // FIXME: modeling may haven't step equal 1 sec
			this.logic.updatePeopleInBuilds();
			this.logic.updatePeopleInCamera();
			this.logic.updateNumberOfPeopleInsideBuildingLabel();

			this.gifNewFrame();
		}

		if (this.isGifStop) {
			this.encoder.finish();
			this.encoder.download('newGif.gif');
			this.isGifStop = false;
		}
	}

	// Инициализация настроек
	gifInit(delayTimer: number) {
		this.encoder.start();
		this.encoder.setRepeat(0);
		this.encoder.setDelay(delayTimer);
		this.encoder.setSize(this.canvas.canvas.width, this.canvas.canvas.height);
	}

	// Добавить новый кадр
	gifNewFrame() {
		this.encoder.addFrame(this.canvas.context);
	}
}
