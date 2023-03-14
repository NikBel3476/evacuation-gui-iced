import React from 'react';
import { View } from '../view/View';
import { UI } from '../ui/UI';
import { Mathem } from '../mathem/Mathem';
import { Building, BuildingElement, Point } from '../Interfaces/Building';
import { TimeData } from '../Interfaces/TimeData';
import timeData from '../../../peopleTraffic/udsu_b1_L4_v2_190701_mv_csv.json';
import { Server } from '../server/Server';

interface LogicConstructorParams {
	view: View;
	ui: UI;
	mathem: Mathem;
	server: Server;
	data: {
		cameraXY: Point;
		scale: number;

		activeBuilds: BuildingElement[];
	};
}

export class Logic {
	view: View;
	ui: UI;
	data: LogicConstructorParams['data'];
	struct: Building;
	level: number = 0;
	choiceBuild: BuildingElement | null = null;
	scale: number;
	mathem: Mathem;
	private peopleCoordinate: Array<{ uuid: string; XY: Point[] }> = [];
	private readonly server: Server;
	// @ts-expect-error
	private readonly timeData: TimeData = timeData;

	constructor({ view, ui, data, mathem, server }: LogicConstructorParams) {
		this.view = view;
		this.ui = ui;
		this.data = data;
		this.server = server;

		this.struct = this.server.data;
		this.scale = this.data.scale;

		this.mathem = mathem;
	}

	/** ЛОГИКА VIEW **/

	// Проверка объектов находятся ли они в камере
	isInCamera(XY: Point[]): boolean {
		return XY.some(point => {
			return (
				point.x * this.data.scale >= this.data.cameraXY.x &&
				point.x * this.data.scale <=
					this.data.cameraXY.x + this.view.canvas.canvas.width &&
				point.y * this.data.scale >= this.data.cameraXY.y &&
				point.y * this.data.scale <= this.data.cameraXY.y + this.view.canvas.canvas.height
			);
		});
	}

	// Обновить список объектов в поле камеры
	updateBuildsInCamera(): void {
		this.data.activeBuilds = this.struct.Level[this.level].BuildElement.filter(building =>
			this.isInCamera(building.XY[0].points)
		);
	}

	updateNumberOfPeopleInsideBuildingLabel(): void {
		const rooms = this.timeData.items.find(
			dateTime => this.ui.evacuationTimeInSec === Math.floor(dateTime.time)
		)?.rooms;

		if (rooms) {
			const numberOfPeopleInsideBuilding = Math.floor(
				rooms.reduce((totalDensity, room) => totalDensity + room.density, 0)
			);

			if (this.ui.numberOfPeopleInsideBuilding !== 0) {
				this.ui.numberOfPeopleOutsideBuilding +=
					this.ui.numberOfPeopleInsideBuilding - numberOfPeopleInsideBuilding;
			}

			this.ui.numberOfPeopleInsideBuilding = numberOfPeopleInsideBuilding;
		} else {
			this.ui.numberOfPeopleInsideBuilding = 0;
		}
	}

	updatePeopleInCamera(): void {
		this.view.activePeople = [];
		this.data.activeBuilds.forEach(building => {
			const coordinates = this.peopleCoordinate.find(
				coordinate => building.Id === coordinate.uuid
			);
			if (coordinates) {
				this.view.activePeople.push(coordinates);
			}
		});
	}

	updatePeopleInBuilds(): void {
		const rooms = this.timeData.items.find(
			dateTime => this.ui.evacuationTimeInSec === Math.floor(dateTime.time)
		)?.rooms;

		this.peopleCoordinate = [];
		if (rooms) {
			rooms.forEach(room => {
				this.struct.Level.forEach(level => {
					level.BuildElement.forEach(building => {
						if (room.uuid === building.Id) {
							this.peopleCoordinate.push({
								uuid: room.uuid,
								XY: this.genPeopleCoordinate(building, room.density)
							});
						}
					});
				});
			});
		}
	}

	getPeopleCountInChoiceRoom(): number {
		const coordinates = this.peopleCoordinate.find(
			coordinate => this.choiceBuild?.Id === coordinate.uuid
		);

		return coordinates?.XY.length ?? 0;
	}

	genPeopleCoordinate(build: BuildingElement, density: number): Point[] {
		const XY = build.XY[0].points;
		const arrayX = Array(XY.length - 1);
		const arrayY = Array(XY.length - 1);
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
		const peopleXY = Array<Point>(peopleCount + 1);
		for (let i = 0; i <= peopleCount; i++) {
			let randX = this.mathem.getRandomArbitrary(
				centerXY.x - centerXY.x / 2 + minXY.x,
				centerXY.x + centerXY.x / 2 + minXY.x
			);
			let randY = this.mathem.getRandomArbitrary(
				centerXY.y - centerXY.y / 2 + minXY.y,
				centerXY.y + centerXY.y / 2 + minXY.y
			);

			let intersection = this.mathem.inPoly(randX, randY, arrayX, arrayY);
			while (!(intersection & 1)) {
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
		switch (key) {
			case 'x':
				this.data.cameraXY.x = this.data.cameraXY.x - value;
				break;
			case 'y':
				this.data.cameraXY.y = this.data.cameraXY.y - value;
				break;
		}
	}

	// Движение мышки
	mouseMove(event: React.MouseEvent): void {
		if (event.movementX) {
			this.moveCamera(event.movementX, 'x');
		}
		if (event.movementY) {
			this.moveCamera(event.movementY, 'y');
		}
	}

	// Выбрать объект
	toChoiceBuild(event: React.MouseEvent): void {
		const mouseX = event.nativeEvent.offsetX + this.data.cameraXY.x;
		const mouseY = event.nativeEvent.offsetY + this.data.cameraXY.y;

		this.choiceBuild =
			this.data.activeBuilds.find(building => {
				const arrayX = Array(building.XY[0].points.length - 1);
				const arrayY = Array(building.XY[0].points.length - 1);
				building.XY[0].points.slice(0, -1).forEach((point, i) => {
					arrayX[i] = point.x * this.data.scale;
					arrayY[i] = point.y * this.data.scale;
				});

				const intersection = this.mathem.inPoly(mouseX, mouseY, arrayX, arrayY);
				return Boolean(intersection & 1);
			}) ?? null;
	}

	toInitialCoordination(): void {
		const rooms = this.struct.Level[this.level].BuildElement;
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
		const canvasWidth = this.view.canvas.canvas.width;
		const canvasHeight = this.view.canvas.canvas.height;
		const fieldDiagonal = Math.sqrt(Math.pow(canvasWidth, 2) + Math.pow(canvasHeight, 2));

		this.data.scale = fieldDiagonal / diagonal;
		this.data.cameraXY.x = leftX * this.data.scale;
		this.data.cameraXY.y = topY * this.data.scale;
	}

	toScreenAdjustment(): void {
		this.updateBuildsInCamera();
		while (true) {
			if (
				this.data.activeBuilds.length !==
				this.struct.Level[this.level].BuildElement.length
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
	}
}
