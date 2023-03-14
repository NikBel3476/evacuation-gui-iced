import { Mathem } from '../mathem/Mathem';
import { VideoRecorder } from '../../VideoRecorder/VideoRecorder';

interface UIConstructorParams {
	mathem: Mathem;
	videoRecorder: VideoRecorder;
}

export class UI {
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

	constructor({ mathem, videoRecorder }: UIConstructorParams) {
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

	private initLabels() {
		this.movingTimeHTML.textContent = String(this._evacuationTimeInSec);
		this.numberOfPeopleInsideHTML.textContent = String(
			this._numberOfPeopleInsideBuilding
		);
		this.numberOfPeopleOutsideHTML.textContent = String(
			this._numberOfPeopleOutsideBuilding
		);
	}
}
