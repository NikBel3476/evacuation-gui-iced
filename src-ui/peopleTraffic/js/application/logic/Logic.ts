import { View } from '../view/View';
import { UI } from '../ui/UI';
import { Mathem } from '../mathem/Mathem';
import { Building, BuildingElement, Level, Point } from '../Interfaces/Building';
import { TimeData } from '../Interfaces/TimeData';

type LogicConstructorParams = {
	view: View;
	ui: UI;
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

		activePeople: Array<{ uuid: string; XY: Array<Point> }>;
		peopleCoordinate: Array<{ uuid: string; XY: Array<Point> }>;
		maxNumPeople: number;
		peopleDen: number;
		peopleR: number;
		label: number;
		exitedLabel: number;
	};
	mathem: Mathem;
};

export class Logic {
	view: View;
	ui: UI;
	data: LogicConstructorParams['data'];
	struct: Building;
	level: number;
	choiceBuild: BuildingElement | null;
	scale: number;
	mathem: Mathem;

	constructor({ view, ui, data, mathem }: LogicConstructorParams) {
		this.view = view;
		this.ui = ui;
		this.data = data;

		this.struct = this.data.struct;
		this.level = this.data.level;
		this.choiceBuild = this.data.choiceBuild;
		this.scale = this.data.scale;

		this.mathem = mathem;
	}

	/**** ЛОГИКА VIEW ****/

	// Проверка объектов находятся ли они в камере
	isInCamera(XY: Array<Point>): boolean {
		return XY.some(point => {
			return (
				point.x * this.data.scale >= this.data.cameraXY.x &&
				point.x * this.data.scale <= this.data.cameraXY.x + this.view.canvas.canvas.width &&
				point.y * this.data.scale >= this.data.cameraXY.y &&
				point.y * this.data.scale <= this.data.cameraXY.y + this.view.canvas.canvas.height
			);
		});
	}

	// Обновить список объектов в поле камеры
	updateBuildsInCamera(): void {
		this.data.activeBuilds = this.struct.Level[this.data.level].BuildElement.filter(building =>
			this.isInCamera(building.XY[0].points)
		);
	}

	updateLabel(): void {
		let rooms = this.data.timeData.items.find(
			dateTime => this.data.time === Math.floor(dateTime.time)
		)?.rooms;

		if (rooms) {
			const label = Math.floor(
				rooms.reduce((totalDensity, room) => totalDensity + room.density, 0)
			);

			if (this.data.label !== 0) {
				this.data.exitedLabel += this.data.label - label;
			}

			this.data.label = label;
		} else {
			this.data.label = 0;
		}
	}

	updatePeopleInCamera(): void {
		this.data.activePeople = [];
		this.data.activeBuilds.forEach(building => {
			const coordinates = this.data.peopleCoordinate.find(
				coordinate => building.Id === coordinate.uuid
			);
			if (coordinates) {
				this.data.activePeople.push(coordinates);
			}
		});
	}

	updatePeopleInBuilds() {
		this.data.peopleCoordinate = [];
		const levels = this.struct.Level;
		const timeData = this.data.timeData.items;
		let rooms;
		for (let i = 0; i < timeData.length; i++) {
			if (this.data.time == Math.floor(timeData[i].time)) {
				rooms = timeData[i].rooms;
				break;
			}
		}
		if (rooms) {
			for (let i = 0; i < rooms.length; i++) {
				for (let j = 0; j < levels.length; j++) {
					let ok = false;
					for (let k = 0; k < levels[j].BuildElement.length; k++) {
						if (rooms[i].uuid == levels[j].BuildElement[k].Id) {
							const XY = this.genPeopleCoordinate(
								levels[j].BuildElement[k],
								rooms[i].density
							);
							this.data.peopleCoordinate.push({ uuid: rooms[i].uuid, XY: XY });
							ok = true;
							break;
						}
					}
					if (ok) {
						break;
					}
				}
			}
		}
	}
	/*updatePeopleInBuilds(): void {
		const rooms = this.data.timeData.items.find(
			dateTime => this.data.time === Math.floor(dateTime.time)
		)?.rooms;

		this.data.peopleCoordinate = [];
		if (rooms) {
			rooms.forEach(room => {
				this.struct.Level.forEach(level => {
					level.BuildElement.forEach(building => {
						if (room.uuid === building.Id) {
							this.data.peopleCoordinate.push({
								uuid: room.uuid,
								XY: this.genPeopleCoordinate(building, room.density)
							});
						}
					});
				});
			});
		}
	}*/

	genPeopleCoordinate(build, density) {
		const XY = build.XY[0].points;
		let arrayX = [];
		let arrayY = [];
		for (let i = 0; i < XY.length - 1; i++) {
			arrayX.push(XY[i].x);
			arrayY.push(XY[i].y);
		}
		const minXY = this.mathem.findMinCoordinates(XY);
		const maxXY = this.mathem.findMaxCoordinates(XY);
		const diagonalXY = { x: maxXY.x - minXY.x, y: maxXY.y - minXY.y };
		const centreXY = { x: diagonalXY.x / 2, y: diagonalXY.y / 2 };
		const peopleCount = Math.floor(density);
		let peopleXY = [];
		for (let i = 0; i <= peopleCount; i++) {
			let randX = this.mathem.getRandomArbitrary(
				centreXY.x - centreXY.x / 2 + minXY.x,
				centreXY.x + centreXY.x / 2 + minXY.x
			);
			let randY = this.mathem.getRandomArbitrary(
				centreXY.y - centreXY.y / 2 + minXY.y,
				centreXY.y + centreXY.y / 2 + minXY.y
			);
			let intersection;
			let ok = true;
			// while (ok) {
			// 	intersection = this.mathem.inPoly(randX, randY, arrayX, arrayY);
			// 	if (intersection != 0 && intersection % 2 != 0) {
			// 		ok = false;
			// 	} else {
			// 		randX = this.mathem.getRandomArbitrary(centreXY.x - centreXY.x / 2 + minXY.x, centreXY.x + centreXY.x / 2 + minXY.x);
			// 		randY = this.mathem.getRandomArbitrary(centreXY.y - centreXY.y / 2 + minXY.y, centreXY.y + centreXY.y / 2 + minXY.y);
			// 	}
			// }
			peopleXY.push({ x: randX, y: randY });
		}
		return peopleXY;
	}
	/*genPeopleCoordinate(build: BuildingElement, density: number): Array<Point> {
		const XY = build.XY[0].points;
		let arrayX = Array(XY.length - 1);
		let arrayY = Array(XY.length - 1);
		// TODO: understand why length - 1 is needed
		XY.slice(0, -1).forEach((point: { x: number; y: number }, i: number) => {
			arrayX[i] = point.x;
			arrayY[i] = point.y;
		});

		const minXY = this.mathem.findMinCoordinates(XY);
		const maxXY = this.mathem.findMaxCoordinates(XY);
		const diagonalXY = { x: maxXY.x - minXY.x, y: maxXY.y - minXY.y };
		const centerXY = { x: diagonalXY.x / 2, y: diagonalXY.y / 2 };
		let randX = this.mathem.getRandomArbitrary(
			centerXY.x - centerXY.x / 2 + minXY.x,
			centerXY.x + centerXY.x / 2 + minXY.x
		);
		let randY = this.mathem.getRandomArbitrary(
			centerXY.y - centerXY.y / 2 + minXY.y,
			centerXY.y + centerXY.y / 2 + minXY.y
		);

		const peopleCount = Math.floor(density);
		let peopleXY = Array<{ x: number; y: number }>(peopleCount + 1);
		for (let i = 0; i <= peopleCount; i++) {
			let intersection = this.mathem.inPoly(randX, randY, arrayX, arrayY);
			/!*while (!Boolean(intersection & 1)) {
				randX = this.mathem.getRandomArbitrary(
					centerXY.x - centerXY.x / 2 + minXY.x,
					centerXY.x + centerXY.x / 2 + minXY.x
				);
				randY = this.mathem.getRandomArbitrary(
					centerXY.y - centerXY.y / 2 + minXY.y,
					centerXY.y + centerXY.y / 2 + minXY.y
				);
				intersection = this.mathem.inPoly(randX, randY, arrayX, arrayY);
			}*!/
			peopleXY[i] = { x: randX, y: randY };
		}
		return peopleXY;
	}*/

	// Движение камеры
	moveCamera(value: number, key: 'x' | 'y'): void {
		this.updateBuildsInCamera();
		this.updatePeopleInCamera();
		switch (key) {
			case 'x':
				this.data.cameraXY.x =
					value > 0
						? this.data.cameraXY.x - 0.2 * this.data.scale
						: this.data.cameraXY.x + 0.2 * this.data.scale;
				break;
			case 'y':
				this.data.cameraXY.y =
					value > 0
						? this.data.cameraXY.y - 0.2 * this.data.scale
						: this.data.cameraXY.y + 0.2 * this.data.scale;
				break;
		}
	}

	// Движение мышки
	mouseMove(event: MouseEvent): void {
		if (event.movementX) {
			this.moveCamera(event.movementX, 'x');
		}
		if (event.movementY) {
			this.moveCamera(event.movementY, 'y');
		}
	}

	// Выбрать объект
	toChoiceBuild(event: MouseEvent): void {
		const mouseX = event.offsetX + this.data.cameraXY.x;
		const mouseY = event.offsetY + this.data.cameraXY.y;

		this.data.choiceBuild =
			this.data.activeBuilds.find(building => {
				let arrayX = Array(building.XY[0].points.length - 1);
				let arrayY = Array(building.XY[0].points.length - 1);
				building.XY[0].points.slice(0, -1).forEach((point, i) => {
					arrayX[i] = point.x * this.data.scale;
					arrayY[i] = point.y * this.data.scale;
				});

				const intersection = this.mathem.inPoly(mouseX, mouseY, arrayX, arrayY);
				return Boolean(intersection & 1);
			}) ?? null;
	}

	toInitialCoordination() {
		const rooms = this.struct.Level[this.data.level].BuildElement;
		let leftX = rooms[0].XY[0].points[0].x;
		let topY = rooms[0].XY[0].points[0].y;
		let rightX = rooms[0].XY[0].points[0].x;
		let botY = rooms[0].XY[0].points[0].y;
		for (let i = 0; i < rooms.length; i++) {
			for (let j = 0; j < rooms[i].XY[0].points.length; j++) {
				const point = rooms[i].XY[0].points[j];
				if (point.x < leftX) {
					leftX = point.x;
				}
				if (point.x > rightX) {
					rightX = point.x;
				}
				if (point.y < topY) {
					topY = point.y;
				}
				if (point.y > botY) {
					botY = point.y;
				}
			}
		}
		const xLength = Math.abs(rightX - leftX);
		const yLength = Math.abs(botY - topY);
		console.log(this.data.fieldWidth, this.data.fieldHeight);
		const diagonal = Math.sqrt(xLength * xLength + yLength * yLength);
		const fieldDiagonal = Math.sqrt(
			this.data.fieldWidth * this.data.fieldWidth +
				this.data.fieldHeight * this.data.fieldHeight
		);
		this.data.scale = fieldDiagonal / diagonal;
		this.data.cameraXY.x = leftX * this.data.scale;
		this.data.cameraXY.y = topY * this.data.scale;
		console.log(this.data.scale);
	}
	/*toInitialCoordination(): void {
		const rooms = this.struct.Level[this.data.level].BuildElement;
		let leftX = rooms[0].XY[0].points[0].x;
		let topY = rooms[0].XY[0].points[0].y;
		let rightX = rooms[0].XY[0].points[0].x;
		let botY = rooms[0].XY[0].points[0].y;

		rooms.forEach(room =>
			room.XY[0].points.forEach(point => {
				leftX = Math.min(point.x, leftX);
				rightX = Math.max(point.x, rightX);
				topY = Math.min(point.y, topY);
				botY = Math.max(point.y, botY);
			})
		);

		const xLength = Math.abs(rightX - leftX);
		const yLength = Math.abs(botY - topY);
		const diagonal = Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2));
		const fieldDiagonal = Math.sqrt(
			Math.pow(this.data.fieldWidth, 2) + Math.pow(this.data.fieldHeight, 2)
		);

		this.data.scale = fieldDiagonal / diagonal;
		this.data.cameraXY.x = leftX * this.data.scale;
		this.data.cameraXY.y = topY * this.data.scale;
	}*/

	toScreenAdjustment() {
		this.updateBuildsInCamera();
		let ok = true;
		while (ok) {
			if (
				this.data.activeBuilds.length !=
				this.struct.Level[this.data.level].BuildElement.length
			) {
				this.data.scale -= 1;
				this.updateBuildsInCamera();
			} else {
				ok = false;
			}
		}
	}
	/*toScreenAdjustment(): void {
		this.updateBuildsInCamera();
		while (true) {
			if (
				this.data.activeBuilds.length !==
				this.struct.Level[this.data.level].BuildElement.length
			) {
				this.data.scale -= 1;
				this.updateBuildsInCamera();
			} else {
				break;
			}
		}
	}*/
	/****************************************************************************************************/

	// Обновить экран
	updateField(): void {
		this.view.render();
		this.ui.updateUI();
	}
}
