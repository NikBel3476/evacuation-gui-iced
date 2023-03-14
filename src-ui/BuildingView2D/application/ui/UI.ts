import { Mathem } from '../mathem/Mathem';
import { BuildingElement, Point } from '../Interfaces/Building';
import { VideoRecorder } from '../../VideoRecorder/VideoRecorder';

interface UIConstructorParams {
	data: {
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
	mathem: Mathem;
	videoRecorder: VideoRecorder;
}

export class UI {
	readonly data: UIConstructorParams['data'];
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

	private _numberOfPeopleOutsideBuilding: number = 0;

	get numberOfPeopleOutsideBuilding(): typeof this._numberOfPeopleOutsideBuilding {
		return this._numberOfPeopleOutsideBuilding;
	}

	set numberOfPeopleOutsideBuilding(
		numberOfPeople: typeof this._numberOfPeopleOutsideBuilding
	) {
		this._numberOfPeopleOutsideBuilding = numberOfPeople;
		this.numberOfPeopleOutsideHTML.textContent = String(
			this._numberOfPeopleOutsideBuilding
		);
	}

	constructor({ data, mathem, videoRecorder }: UIConstructorParams) {
		this.data = data;
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
		this.numberOfPeopleOutsideHTML.textContent = String(
			this._numberOfPeopleOutsideBuilding
		);
	}

	getPeopleCountInChoiceRoom(): number {
		const coordinates = this.data.peopleCoordinate.find(
			coordinate => this.data.choiceBuild?.Id === coordinate.uuid
		);

		return coordinates?.XY.length ?? 0;
	}
}
