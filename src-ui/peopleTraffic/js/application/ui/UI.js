export class UI {
	constructor(options) {
		this.data = options.data;
		this.struct = this.data.struct;
		this.mathem = options.mathem;
		this.init();
	}

	updateUI() {
		if (this.data.choiceBuild) {
			document.getElementById('level').textContent =
				'Уровень этажа (метры): ' +
				this.struct.Level[this.data.level].ZLevel;
			document.getElementById('sign').textContent =
				'Тип: ' + this.data.choiceBuild.Sign;
			document.getElementById('id').textContent =
				'ID: ' + this.data.choiceBuild.Id;
			document.getElementById('numPeople').textContent =
				'Количество людей: ' + this.getPeopleCountInChoiceRoom();
			document.getElementById('name').textContent =
				'Название: ' + this.data.choiceBuild.Name;
			document.getElementById('area').textContent =
				'Площадь: ' +
				Math.floor(
					this.mathem.toСalculateBuildArea(this.data.choiceBuild)
				) +
				' м^2';
		}
		document.getElementById('movingTime').textContent =
			'Длительность движения, сек: ' + this.data.time;

		document.getElementById('personCount').textContent =
			'Количество людей в здании, чел: ' + this.data.label;
		document.getElementById('personExited').textContent =
			'Человек вышло: ' + this.data.exitedLabel;
	}

	getPeopleCountInChoiceRoom() {
		for (let i = 0; i < this.data.peopleCoordinate.length; i++) {
			if (
				this.data.choiceBuild.Id === this.data.peopleCoordinate[i].uuid
			) {
				return this.data.peopleCoordinate[i].XY.length;
			}
		}
		return 0;
	}

	init() {
		document.getElementById('level').textContent = 'Уровень этажа: ';
		document.getElementById('sign').textContent = 'Тип: ';
		document.getElementById('id').textContent = 'ID: ';
		document.getElementById('numPeople').textContent = 'Количество людей:';
		document.getElementById('name').textContent = 'Название: ';
		document.getElementById('area').textContent = 'Площадь: ';
		document.getElementById('personCount').textContent =
			'Количество людей в здании, чел: ' + this.data.label;
		document.getElementById('movingTime').textContent =
			'Длительность движения, сек: ' + this.data.time;

		document.getElementById('pause').addEventListener('click', () => {
			if (this.data.timerTimeDataUpdatePause == false) {
				this.data.timerTimeDataUpdatePause = true;
				this.data.isGifStop = true;
			}
		});
		document.getElementById('play').addEventListener('click', () => {
			if (this.data.timerTimeDataUpdatePause == true) {
				this.data.timerTimeDataUpdatePause = false;
			}
		});
	}
}
