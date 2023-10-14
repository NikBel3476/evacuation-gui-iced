import { Canvas } from '../canvas/Canvas';
import { Mathem } from '../mathem/Mathem';
import { BuildingElement, Point } from '../Interfaces/Building';
import { Graphics as PixiGraphics } from '@pixi/graphics';
import { ColorSource, Polygon } from 'pixi.js';

interface ViewConstructorParams {
	canvas: Canvas;
	data: {
		cameraXY: Point;
		scale: number;

		activeBuilds: BuildingElement[];
	};
	mathem: Mathem;
}

export class View {
	canvas: Canvas;
	data: ViewConstructorParams['data'];
	mathem: Mathem;
	activePeople: Array<{ uuid: string; XY: Point[] }> = [];
	private readonly peopleR: number = 0.25;

	constructor({ canvas, data, mathem }: ViewConstructorParams) {
		this.canvas = canvas;
		this.data = data;
		this.mathem = mathem;
	}

	// Отрисовка "коробочек" элементов
	drawBox(coordinates: Point[]) {
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
	drawBuild(build: BuildingElement, color?: { r: number; g: number; b: number }) {
		this.canvas.beginPath();
		this.drawBox(build.XY[0].points);
		const RGB = color ? `rgb(${color.r}, ${color.g}, ${color.b}` : 'rgb(255,255,255)';
		this.canvas.fill(RGB);
		this.canvas.closePath();
	}

	static drawBuildingRoomPixi(
		g: PixiGraphics,
		points: Point[],
		color: ColorSource = 0xffffff
	) {
		g.moveTo(points[0].x, points[0].y);
		g.beginFill(color);
		g.lineStyle(0.1, 0x000000, 1);
		const polygon = new Polygon(points.slice(1));
		g.drawShape(polygon);
		g.endFill();
	}

	static drawBuildingRoomsPixi(g: PixiGraphics, buildings: BuildingElement[]) {
		buildings.forEach(building => {
			let color = 'rgb(255, 255, 255)';
			switch (building.Sign) {
				case 'Staircase':
					color = 'rgb(49, 152, 0)';
					break;
				case 'DoorWay':
				case 'DoorWayInt':
					color = 'rgb(227, 237, 31)';
					break;
				case 'DoorWayOut':
					color = 'rgb(40, 0, 255)';
					break;
			}
			View.drawBuildingRoomPixi(g, building.XY[0].points, color);
		});
	}

	drawPeople(people: { uuid: string; XY: Point[] }, buildings: BuildingElement[]) {
		this.canvas.beginPath();
		const building = buildings.find(building => building.Id === people.uuid);
		if (building) {
			people.XY.forEach(point =>
				this.canvas.circle(
					point.x * this.data.scale - this.data.cameraXY.x,
					point.y * this.data.scale - this.data.cameraXY.y,
					this.peopleR * this.data.scale,
					'red'
				)
			);
		}
		this.canvas.closePath();
	}

	static drawPeople(g: PixiGraphics, peopleCoordinates: Point[]): void {
		g.beginFill(0xff0000);
		g.lineStyle(0.05, 0x000000, 1);
		peopleCoordinates.forEach(coordinates =>
			g.drawCircle(coordinates.x, coordinates.y, 0.5)
		);
		g.endFill();
	}

	// Отрисовка всего
	render() {
		this.canvas.clear();
		this.data.activeBuilds.forEach(build => {
			let color = { r: 255, g: 255, b: 255 };
			switch (build.Sign) {
				case 'Staircase':
					color = { r: 49, g: 152, b: 0 };
					break;
				case 'DoorWay':
				case 'DoorWayInt':
					color = { r: 227, g: 237, b: 31 };
					break;
				case 'DoorWayOut':
					color = { r: 40, g: 0, b: 255 };
					break;
			}
			this.drawBuild(build, color);
		});
		this.activePeople.forEach(people => this.drawPeople(people, this.data.activeBuilds));
		this.canvas.print();
	}
}
