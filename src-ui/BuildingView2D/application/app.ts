import { Server } from './server/Server.js';
import { TimeData } from './Interfaces/TimeData';
import * as timeData from '../../peopleTraffic/udsu_b1_L4_v2_190701_mv_csv.json';
import { View } from './view/View.js';
import { UI } from './ui/UI.js';
import { Mathem } from './mathem/Mathem.js';
import { Logic } from './logic/Logic.js';
import { Canvas } from './canvas/Canvas.js';
import { BASE_SETTINGS } from '../BASE_SETTINGS';
import { Building, BuildingElement, Point } from './Interfaces/Building';
import { GIFEncoder } from '../../peopleTraffic/js/vendor/toGif/GIFEncoder';
import { VideoRecorder } from '../VideoRecorder/VideoRecorder';

export class App {
	BASE_SETTINGS: BASE_SETTINGS;
	server: Server;
	canvas: Canvas;
	mathem: Mathem;
	videoRecorder: VideoRecorder;
	data: {
		struct: Building;
		timerTimeDataUpdatePause: boolean;
		timerSpeedUp: number;
		timeData: TimeData;

		gifFinish: boolean;
		isGifStop: boolean;
		passFrame: number;

		cameraXY: { x: number; y: number };
		canMove: boolean;
		scale: number;
		fieldWidth: number;
		fieldHeight: number;

		level: number;
		choiceBuild: BuildingElement | null;
		activeBuilds: BuildingElement[];

		activePeople: Array<{ uuid: string; XY: Point[] }>;
		peopleCoordinate: Array<{ uuid: string; XY: Point[] }>;
		peopleDen: number;
		peopleR: number;
	};

	view: View;
	ui: UI;
	logic: Logic;
	encoder;
	private renderLoopId: number | null = null;
	private timerTimeDataUpdateId: number | null = null;
	private fps: number = 0;
	private fpsOut: number = 0;
	private timestamp: number = performance.now();

	constructor() {
		// Инициализация настроек, сервера, инструментария канвас и модуля отрисовки
		this.BASE_SETTINGS = new BASE_SETTINGS();
		this.server = new Server();
		this.canvas = new Canvas(this.BASE_SETTINGS.CANVAS);
		this.mathem = new Mathem();
		this.videoRecorder = new VideoRecorder(this.canvas.canvas);
		this.data = {
			struct: this.server.data,
			timerTimeDataUpdatePause: true,
			timerSpeedUp: 1,
			timeData,

			gifFinish: false,
			isGifStop: false,
			passFrame: 0,

			cameraXY: { x: 0, y: 0 },
			canMove: false,
			scale: 20,
			fieldWidth: this.canvas.canvas.width,
			fieldHeight: this.canvas.canvas.height,

			level: 0,
			choiceBuild: null,
			activeBuilds: [],

			activePeople: [],
			peopleCoordinate: [],
			peopleDen: 1,
			peopleR: 0.25
		};
		this.view = new View({
			canvas: this.canvas,
			data: this.data,
			mathem: this.mathem
		});
		this.ui = new UI({
			data: this.data,
			mathem: this.mathem,
			videoRecorder: this.videoRecorder
		});
		this.logic = new Logic({
			view: this.view,
			ui: this.ui,
			data: this.data,
			mathem: this.mathem
		});
		// @ts-expect-error
		this.encoder = new GIFEncoder();

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
		if (!this.data.timerTimeDataUpdatePause) {
			this.ui.evacuationTimeInSec++;
			this.logic.updatePeopleInBuilds();
			this.logic.updatePeopleInCamera();
			this.logic.updateNumberOfPeopleInsideBuildingLabel();
			this.gifNewFrame();
		}

		if (this.data.isGifStop) {
			this.encoder.finish();
			this.encoder.download('newGif.gif');
			this.data.isGifStop = false;
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
