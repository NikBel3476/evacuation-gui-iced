import { Canvas } from '../canvas/Canvas';
import { Mathem } from '../mathem/Mathem';
import { Building, BuildingElement, Point } from '../Interfaces/Building';
import { TimeData } from '../Interfaces/TimeData';

interface ViewConstructorParams {
	canvas: Canvas;
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
		label: number;
		exitedLabel: number;
	};
	mathem: Mathem;
}

export class View {
	canvas: Canvas;
	data: ViewConstructorParams['data'];
	struct: Building;
	mathem: Mathem;

	constructor({ canvas, data, mathem }: ViewConstructorParams) {
		this.canvas = canvas;
		this.data = data;
		this.struct = this.data.struct;
		this.mathem = mathem;
	}

	// Отрисовка "коробочек" элементов
	drawBox(coordinates: Array<{ x: number; y: number }>) {
		this.canvas.moveTo(
			coordinates[0].x * this.data.scale - this.data.cameraXY.x,
			coordinates[0].y * this.data.scale - this.data.cameraXY.y
		);
		coordinates
			.slice(1)
			.forEach(point =>
				this.canvas.line_(
					point.x * this.data.scale - this.data.cameraXY.x,
					point.y * this.data.scale - this.data.cameraXY.y
				)
			);
	}

	// Отрисовка комнаты
	drawBuild(build: BuildingElement) {
		this.canvas.beginPath();
		this.drawBox(build.XY[0].points);
		const RGB = 'rgb(255,255,255)';
		this.canvas.fill(RGB);
		this.canvas.closePath();
	}

	drawPeople(people: { uuid: string; XY: Point[] }, buildings: BuildingElement[]) {
		this.canvas.beginPath();
		const building = buildings.find(building => building.Id === people.uuid);
		if (building) {
			people.XY.forEach(point =>
				this.canvas.circle(
					point.x * this.data.scale - this.data.cameraXY.x,
					point.y * this.data.scale - this.data.cameraXY.y,
					this.data.peopleR * this.data.scale,
					'red'
				)
			);
		}
		this.canvas.closePath();
	}

	// Отрисовка всего
	render() {
		this.canvas.clear();
		this.data.activeBuilds.forEach(build => this.drawBuild(build));
		this.data.activePeople.forEach(people =>
			this.drawPeople(people, this.data.activeBuilds)
		);
		this.canvas.print();
	}
}
