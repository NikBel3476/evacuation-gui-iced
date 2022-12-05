import { Mathem } from '../mathem/Mathem';

type UIConstructorParams = {
	data: any;
	mathem: Mathem;
};

export class UI {
	data;
	struct;
	mathem: Mathem;

	constructor({ data, mathem }: UIConstructorParams) {
		this.data = data;
		this.struct = this.data.struct;
		this.mathem = mathem;
		this.init();
	}

	updateUI() {
		if (this.data.choiceBuild) {
			document.getElementById('level')!.textContent =
				'Уровень этажа (метры): ' + this.struct.Level[this.data.level].ZLevel;
			document.getElementById('sign')!.textContent = 'Тип: ' + this.data.choiceBuild.Sign;
			document.getElementById('id')!.textContent = 'ID: ' + this.data.choiceBuild.Id;
			document.getElementById('numPeople')!.textContent =
				'Количество людей: ' + this.getPeopleCountInChoiceRoom();
			document.getElementById('name')!.textContent =
				'Название: ' + this.data.choiceBuild.Name;
			document.getElementById('area')!.textContent =
				'Площадь: ' +
				Math.floor(this.mathem.toCalculateBuildArea(this.data.choiceBuild)) +
				' м^2';
		}

		document.getElementById('movingTime')!.textContent =
			'Длительность движения, сек: ' + this.data.time;
		document.getElementById('personCount')!.textContent =
			'Количество людей в здании, чел: ' + this.data.label;
		document.getElementById('personExited')!.textContent =
			'Человек вышло: ' + this.data.exitedLabel;
	}

	getPeopleCountInChoiceRoom(): number {
		const coordinates = this.data.peopleCoordinate.find(
			coordinate => this.data.choiceBuild.Id === coordinate.uuid
		);

		return coordinates.length || 0;
	}

	init() {
		document.getElementById('level')!.textContent = 'Уровень этажа: ';
		document.getElementById('sign')!.textContent = 'Тип: ';
		document.getElementById('id')!.textContent = 'ID: ';
		document.getElementById('numPeople')!.textContent = 'Количество людей:';
		document.getElementById('name')!.textContent = 'Название: ';
		document.getElementById('area')!.textContent = 'Площадь: ';
		document.getElementById('personCount')!.textContent =
			'Количество людей в здании, чел: ' + this.data.label;
		document.getElementById('movingTime')!.textContent =
			'Длительность движения, сек: ' + this.data.time;

		document.getElementById('pause')!.addEventListener('click', _ => {
			if (!this.data.timerTimeDataUpdatePause) {
				this.data.timerTimeDataUpdatePause = true;
				this.data.isGifStop = true;
			}
		});
		document.getElementById('play')!.addEventListener('click', _ => {
			if (this.data.timerTimeDataUpdatePause) {
				this.data.timerTimeDataUpdatePause = false;
			}
		});
	}
}
