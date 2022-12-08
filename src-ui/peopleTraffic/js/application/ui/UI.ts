import { Mathem } from '../mathem/Mathem';

type UIConstructorParams = {
	data: any;
	mathem: Mathem;
};

export class UI {
	private data;
	private struct;
	private mathem: Mathem;
	private levelHTML: HTMLElement;
	private buildingTypeHTML: HTMLElement;
	private buildingIdHTML: HTMLElement;
	private totalNumberOfPeopleHTML: HTMLElement;
	private buildingNameHTML: HTMLElement;
	private areaHTML: HTMLElement;
	private movingTimeHTML: HTMLElement;
	private numberOfPeopleInsideHTML: HTMLElement;
	private numberOfPeopleOutsideHTML: HTMLElement;
	private pauseButton: HTMLElement;
	private playButton: HTMLElement;

	constructor({ data, mathem }: UIConstructorParams) {
		this.data = data;
		this.struct = this.data.struct;
		this.mathem = mathem;

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
		if (this.data.choiceBuild) {
			this.levelHTML.textContent =
				'Уровень этажа (метры): ' + this.struct.Level[this.data.level].ZLevel;
			this.buildingTypeHTML.textContent = 'Тип: ' + this.data.choiceBuild.Sign;
			this.buildingIdHTML.textContent = 'ID: ' + this.data.choiceBuild.Id;
			this.totalNumberOfPeopleHTML.textContent =
				'Количество людей: ' + this.getPeopleCountInChoiceRoom();
			this.buildingNameHTML.textContent = 'Название: ' + this.data.choiceBuild.Name;
			this.areaHTML.textContent =
				'Площадь: ' +
				Math.floor(this.mathem.calculateBuildArea(this.data.choiceBuild)) +
				' м^2';
		}

		this.movingTimeHTML.textContent = 'Длительность движения, сек: ' + this.data.time;
		this.numberOfPeopleInsideHTML.textContent =
			'Количество людей в здании, чел: ' + this.data.label;
		this.numberOfPeopleOutsideHTML.textContent = 'Человек вышло: ' + this.data.exitedLabel;
	}

	getPeopleCountInChoiceRoom(): number {
		const coordinates = this.data.peopleCoordinate.find(
			coordinate => this.data.choiceBuild.Id === coordinate.uuid
		);

		return coordinates.length || 0;
	}

	init() {
		this.levelHTML.textContent = 'Уровень этажа: ';
		this.buildingTypeHTML.textContent = 'Тип: ';
		this.buildingIdHTML.textContent = 'ID: ';
		this.totalNumberOfPeopleHTML.textContent = 'Количество людей:';
		this.buildingNameHTML.textContent = 'Название: ';
		this.areaHTML.textContent = 'Площадь: ';
		this.numberOfPeopleInsideHTML.textContent =
			'Количество людей в здании, чел: ' + this.data.label;
		this.movingTimeHTML.textContent = 'Длительность движения, сек: ' + this.data.time;

		this.pauseButton.addEventListener('click', _ => {
			if (!this.data.timerTimeDataUpdatePause) {
				this.data.timerTimeDataUpdatePause = true;
				this.data.isGifStop = true;
			}
		});
		this.playButton.addEventListener('click', _ => {
			if (this.data.timerTimeDataUpdatePause) {
				this.data.timerTimeDataUpdatePause = false;
			}
		});
	}
}
