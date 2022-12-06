import { View } from '../view/View';
import { UI } from '../ui/UI';
import { Mathem } from '../mathem/Mathem';

type LogicConstructorParams = {
	view: View;
	ui: UI;
	data: any;
	mathem: Mathem;
};

export class Logic {
	view: View;
	ui: UI;
	data;
	struct;
	level;
	choiceBuild;
	scale;
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
	isInCamera(XY: Array<{ x: number; y: number }>): boolean {
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
		const label = Math.floor(
			this.data.timeData.items
				.find(dateTime => this.data.time === Math.floor(dateTime.time))
				.rooms.reduce((totalDensity, room) => totalDensity + room.density, 0)
		);

		if (this.data.label !== 0) this.data.exitedLabel += this.data.label - label;

		this.data.label = label;
	}

	updatePeopleInCamera(): void {
		this.data.activeBuilds.forEach(building => {
			const coordinates = this.data.peopleCoordinate.find(
				coordinate => building.Id === coordinate.uuid
			);
			if (coordinates) this.data.activePeople.push(coordinates);
		});
	}

	updatePeopleInBuilds(): void {
		const rooms = this.data.timeData.items.find(
			dateTime => this.data.time === Math.floor(dateTime.time)
		).rooms;

		this.data.peopleCoordinate = [];
		if (rooms)
			rooms.forEach(room => {
				this.struct.Level.forEach(level => {
					const buildingElement = level.BuildElement.find(
						building => room.uuid === building.Id
					);

					if (buildingElement) {
						this.data.peopleCoordinate.push({
							uuid: room.uuid,
							XY: this.genPeopleCoordinate(buildingElement, room.density)
						});
					}
				});
			});
	}

	// TODO: add type for build parameter
	genPeopleCoordinate(build, density: number) {
		const XY = build.XY[0].points;
		let arrayX = Array(XY.length - 1);
		let arrayY = Array(XY.length - 1);
		// TODO: understand why length - 1 is needed
		XY.slice(0, -1).forEach((point, i) => {
			arrayX[i] = point.x;
			arrayY[i] = point.y;
		});

		const minXY = this.mathem.findMinCoordinates(XY);
		const maxXY = this.mathem.findMaxCoordinates(XY);
		const diagonalXY = { x: maxXY.x - minXY.x, y: maxXY.y - minXY.y };
		const centerXY = { x: diagonalXY.x / 2, y: diagonalXY.y / 2 };

		const peopleCount = Math.floor(density);
		let peopleXY = Array(peopleCount);
		let intersection;
		for (let i = 0; i <= peopleCount; i++) {
			let randX = this.mathem.getRandomArbitrary(
				centerXY.x - centerXY.x / 2 + minXY.x,
				centerXY.x + centerXY.x / 2 + minXY.x
			);
			let randY = this.mathem.getRandomArbitrary(
				centerXY.y - centerXY.y / 2 + minXY.y,
				centerXY.y + centerXY.y / 2 + minXY.y
			);

			intersection = this.mathem.inPoly(randX, randY, arrayX, arrayY);
			while (!Boolean(intersection & 1)) {
				randX = this.mathem.getRandomArbitrary(
					centerXY.x - centerXY.x / 2 + minXY.x,
					centerXY.x + centerXY.x / 2 + minXY.x
				);
				randY = this.mathem.getRandomArbitrary(
					centerXY.y - centerXY.y / 2 + minXY.y,
					centerXY.y + centerXY.y / 2 + minXY.y
				);
				intersection = this.mathem.inPoly(randX, randY, arrayX, arrayY);
			}
			peopleXY[i] = { x: randX, y: randY };
		}
		return peopleXY;
	}

	// Движение камеры
	moveCamera(value: number, key: 'x' | 'y'): void {
		this.updateBuildsInCamera();
		this.updatePeopleInCamera();
		if (key === 'x') {
			if (value > 0) {
				this.data.cameraXY.x -= 0.2 * this.data.scale;
			} else if (value < 0) {
				this.data.cameraXY.x += 0.2 * this.data.scale;
			}
		} else if (key === 'y') {
			if (value > 0) {
				this.data.cameraXY.y -= 0.2 * this.data.scale;
			} else if (value < 0) {
				this.data.cameraXY.y += 0.2 * this.data.scale;
			}
		}
	}

	// Движение мышки
	mouseMove(event: MouseEvent): void {
		if (this.data.canMove) {
			if (event.movementX) {
				this.moveCamera(event.movementX, 'x');
			} else if (event.movementY) {
				this.moveCamera(event.movementY, 'y');
			}
		}
	}

	// Выбрать объект
	toChoiceBuild(event: MouseEvent): void {
		const mouseX = event.offsetX + this.data.cameraXY.x;
		const mouseY = event.offsetY + this.data.cameraXY.y;

		this.data.choiceBuild = this.data.activeBuilds.find(building => {
			let arrayX = Array(building.XY[0].points.length - 1);
			let arrayY = Array(building.XY[0].points.length - 1);
			building.XY[0].points.slice(0, -1).forEach((point, i) => {
				arrayX[i] = point.x * this.data.scale;
				arrayY[i] = point.y * this.data.scale;
			});

			const intersection = this.mathem.inPoly(mouseX, mouseY, arrayX, arrayY);
			return (
				Boolean(intersection & 1) &&
				(building.sign == 'DoorWayInt' || building.sign == 'DoorWay')
			);
		});
	}

	toInitialCoordination(): void {
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
	}

	toScreenAdjustment(): void {
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
	}
	/****************************************************************************************************/

	// Обновить экран
	updateField(): void {
		this.view.render();
		this.ui.updateUI();
	}
}
