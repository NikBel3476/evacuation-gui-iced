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
	private readonly movingTimeHTML: HTMLElement;
	private readonly numberOfPeopleInsideHTML: HTMLElement;
	private readonly numberOfPeopleOutsideHTML: HTMLElement;

	constructor({ data, mathem, videoRecorder }: UIConstructorParams) {
		this.data = data;
		this.struct = this.data.struct;
		this.mathem = mathem;
		this.videoRecorder = videoRecorder;
	}

	updateUI() {
		/* this.movingTimeHTML.textContent = `Длительность движения, сек: ${this.data.time}`;
		this.numberOfPeopleInsideHTML.textContent = `Количество людей в здании, чел: ${this.data.label}`;
		this.numberOfPeopleOutsideHTML.textContent = `Человек вышло: ${this.data.exitedLabel}`; */
	}

	getPeopleCountInChoiceRoom(): number {
		const coordinates = this.data.peopleCoordinate.find(
			coordinate => this.data.choiceBuild?.Id === coordinate.uuid
		);

		return coordinates?.XY.length ?? 0;
	}
}
