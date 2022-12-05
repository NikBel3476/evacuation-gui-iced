import { Canvas } from '../canvas/Canvas';
import { Mathem } from '../mathem/Mathem';

type ViewConstructorParams = {
	canvas: Canvas;
	data: any;
	mathem: Mathem;
};

export class View {
	canvas: Canvas;
	data;
	struct;
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
		for (let i = 1; i < coordinates.length; i++) {
			this.canvas.line_(
				coordinates[i].x * this.data.scale - this.data.cameraXY.x,
				coordinates[i].y * this.data.scale - this.data.cameraXY.y
			);
		}
	}

	// Отрисовка комнаты
	drawBuild(build) {
		this.canvas.beginPath();
		this.drawBox(build.XY[0].points);
		const RGB = 'rgb(255,255,255)';
		this.canvas.fill(RGB);
		this.canvas.closePath();
	}

	drawPeople(people, builds) {
		this.canvas.beginPath();
		for (let i = 0; i < builds.length; i++) {
			if (builds[i].Id == people.uuid) {
				for (let j = 0; j < people.XY.length; j++) {
					this.canvas.circle(
						people.XY[j].x * this.data.scale - this.data.cameraXY.x,
						people.XY[j].y * this.data.scale - this.data.cameraXY.y,
						this.data.peopleR * this.data.scale,
						'red'
					);
				}
				break;
			}
		}
		this.canvas.closePath();
	}

	// Отрисовка всего
	render() {
		this.canvas.clear();
		for (let i = 0; i < this.data.activeBuilds.length; i++) {
			this.drawBuild(this.data.activeBuilds[i]);
		}
		for (let i = 0; i < this.data.activePeople.length; i++) {
			this.drawPeople(this.data.activePeople[i], this.data.activeBuilds);
		}
		this.canvas.print();
	}
}
