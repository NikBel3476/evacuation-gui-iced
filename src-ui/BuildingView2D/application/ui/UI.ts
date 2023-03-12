import { Mathem } from '../mathem/Mathem';
import { Building, BuildingElement, Point } from '../Interfaces/Building';
import { TimeData } from '../Interfaces/TimeData';
import { VideoRecorder } from '../../VideoRecorder/VideoRecorder';

interface UIConstructorParams {
	data: {
		struct: Building;
		timerTimeDataUpdatePause: boolean;
		timerSpeedUp: number;
		timeData: TimeData;
		time: number;
		timeStep: number;

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
		maxNumPeople: number;
		peopleDen: number;
		peopleR: number;
		label: number;
		exitedLabel: number;
	};
	mathem: Mathem;
	videoRecorder: VideoRecorder;
}

export class UI {
	readonly data: UIConstructorParams['data'];
	private readonly struct: Building;
	private readonly mathem: Mathem;
	readonly videoRecorder: VideoRecorder;
	private readonly levelHTML: HTMLElement;
	private readonly buildingTypeHTML: HTMLElement;
	private readonly buildingIdHTML: HTMLElement;
	private readonly totalNumberOfPeopleHTML: HTMLElement;
	private readonly buildingNameHTML: HTMLElement;
	private readonly areaHTML: HTMLElement;
	private readonly movingTimeHTML: HTMLElement;
	private readonly numberOfPeopleInsideHTML: HTMLElement;
	private readonly numberOfPeopleOutsideHTML: HTMLElement;
	private readonly pauseButton: HTMLElement;
	private readonly playButton: HTMLElement;

	constructor({ data, mathem, videoRecorder }: UIConstructorParams) {
		this.data = data;
		this.struct = this.data.struct;
		this.mathem = mathem;
		this.videoRecorder = videoRecorder;

		this.levelHTML = document.getElementById('level')!;
		this.buildingTypeHTML = document.getElementById('sign')!;
		this.buildingIdHTML = document.getElementById('id')!;
		this.totalNumberOfPeopleHTML = document.getElementById('numPeople')!;
		this.buildingNameHTML = document.getElementById('name')!;
		this.areaHTML = document.getElementById('area')!;
		this.movingTimeHTML = document.getElementById('movingTime')!;
		this.numberOfPeopleInsideHTML = document.getElementById('personCount')!;
		this.numberOfPeopleOutsideHTML = document.getElementById('personExited')!;
		this.pauseButton = document.getElementById('pause')!;
		this.playButton = document.getElementById('play')!;

		this.init();
	}

	updateUI() {
		/* if (this.data.choiceBuild) {
			this.levelHTML.textContent = `Уровень этажа (метры): ${
				this.struct.Level[this.data.level].ZLevel
			}`;
			this.buildingTypeHTML.textContent = 'Тип: ' + this.data.choiceBuild.Sign;
			this.buildingIdHTML.textContent = 'ID: ' + this.data.choiceBuild.Id;
			this.totalNumberOfPeopleHTML.textContent = `Количество людей: ' ${this.getPeopleCountInChoiceRoom()}`;
			this.buildingNameHTML.textContent = 'Название: ' + this.data.choiceBuild.Name;
			this.areaHTML.textContent = `Площадь: ${Math.floor(
				this.mathem.calculateBuildArea(this.data.choiceBuild)
			)} м^2`;
		}

		this.movingTimeHTML.textContent = `Длительность движения, сек: ${this.data.time}`;
		this.numberOfPeopleInsideHTML.textContent = `Количество людей в здании, чел: ${this.data.label}`;
		this.numberOfPeopleOutsideHTML.textContent = `Человек вышло: ${this.data.exitedLabel}`; */
	}

	getPeopleCountInChoiceRoom(): number {
		const coordinates = this.data.peopleCoordinate.find(
			coordinate => this.data.choiceBuild?.Id === coordinate.uuid
		);

		return coordinates?.XY.length ?? 0;
	}

	init() {
		/* this.levelHTML.textContent = 'Уровень этажа: ';
		this.buildingTypeHTML.textContent = 'Тип: ';
		this.buildingIdHTML.textContent = 'ID: ';
		this.totalNumberOfPeopleHTML.textContent = 'Количество людей:';
		this.buildingNameHTML.textContent = 'Название: ';
		this.areaHTML.textContent = 'Площадь: ';
		this.numberOfPeopleInsideHTML.textContent = `Количество людей в здании, чел: ${this.data.label}`;
		this.movingTimeHTML.textContent = `Длительность движения, сек: ${this.data.time}`;

		this.pauseButton.addEventListener('click', _ => {
			if (!this.data.timerTimeDataUpdatePause) {
				this.data.timerTimeDataUpdatePause = true;
				this.data.isGifStop = true;
			}
			if (this.videoRecorder.recordingState === 'recording') {
				this.videoRecorder.pause();
			}
		});
		this.playButton.addEventListener('click', _ => {
			if (this.data.timerTimeDataUpdatePause) {
				this.data.timerTimeDataUpdatePause = false;
			}
			switch (this.videoRecorder.recordingState) {
				case 'inactive':
					this.videoRecorder.startRecording();
					break;
				case 'paused':
					this.videoRecorder.resume();
					break;
				case 'recording':
					this.videoRecorder.stopRecording();
					this.videoRecorder.download();
					break;
			}
		}); */
	}
}
