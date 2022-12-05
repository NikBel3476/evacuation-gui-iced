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
	drawBuild(build) {
		this.canvas.beginPath();
		this.drawBox(build.XY[0].points);
		const RGB = 'rgb(255,255,255)';
		this.canvas.fill(RGB);
		this.canvas.closePath();
	}

	drawPeople(people, builds) {
		this.canvas.beginPath();
		const build = builds.find(build => build.Id === people.uuid);
		if (build) {
			people.XY.forEach(point =>
				this.canvas.circle(
					point.x * this.data.scale - this.data.cameraXY.x,
					point.y * this.data.scale - this.data.cameraXY.y,
					this.data.peopleR * this.data.scale,
					'red'
				)
			);
		} else {
			throw new Error('Necessary build was not found');
		}
		this.canvas.closePath();
	}

	// Отрисовка всего
	render() {
		this.canvas.clear();
		this.data.activeBuilds.forEach(build => this.drawBuild(build));
		this.data.activePeople.forEach(people => this.drawPeople(people, this.data.activeBuilds));
		this.canvas.print();
	}
}
