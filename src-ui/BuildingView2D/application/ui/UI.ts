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
		// time: number;
		// timeStep: number;

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
		// maxNumPeople: number;
		peopleDen: number;
		peopleR: number;
		// label: number;
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
	private _evacuationTimeInSec: number = 0;

	get evacuationTimeInSec(): typeof this._evacuationTimeInSec {
		return this._evacuationTimeInSec;
	}

	set evacuationTimeInSec(time: typeof this._evacuationTimeInSec) {
		this._evacuationTimeInSec = time;
		this.movingTimeHTML.textContent = String(this._evacuationTimeInSec);
	}

	private _numberOfPeopleInsideBuilding: number = 0;

	get numberOfPeopleInsideBuilding(): typeof this._numberOfPeopleInsideBuilding {
		return this._numberOfPeopleInsideBuilding;
	}

	set numberOfPeopleInsideBuilding(
		numberOfPeople: typeof this._numberOfPeopleInsideBuilding
	) {
		this._numberOfPeopleInsideBuilding = numberOfPeople;
		this.numberOfPeopleInsideHTML.textContent = String(
			this._numberOfPeopleInsideBuilding
		);
	}
	private numberOfPeopleOutsideBuilding: number = 0;

	constructor({ data, mathem, videoRecorder }: UIConstructorParams) {
		this.data = data;
		this.struct = this.data.struct;
		this.mathem = mathem;
		this.videoRecorder = videoRecorder;
		this.movingTimeHTML = document.getElementById(
			'evacuation_time_label'
		) as HTMLSpanElement;
		this.numberOfPeopleInsideHTML = document.getElementById(
			'people_inside_building'
		) as HTMLSpanElement;
		this.numberOfPeopleOutsideHTML = document.getElementById(
			'people_outside_building'
		) as HTMLSpanElement;
		this.initLabels();
	}

	initLabels() {
		this.movingTimeHTML.textContent = String(this._evacuationTimeInSec);
		this.numberOfPeopleInsideHTML.textContent = String(
			this._numberOfPeopleInsideBuilding
		);
	}

	updateUI() {
		// this.movingTimeHTML.textContent = String(this.data.time);
		// this.numberOfPeopleInsideHTML.textContent = String(this.data.label);
		this.numberOfPeopleOutsideHTML.textContent = String(this.data.exitedLabel);
	}

	getPeopleCountInChoiceRoom(): number {
		const coordinates = this.data.peopleCoordinate.find(
			coordinate => this.data.choiceBuild?.Id === coordinate.uuid
		);

		return coordinates?.XY.length ?? 0;
	}
}
