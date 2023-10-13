import { BuildingElement } from '../Interfaces/Building';

export class Mathem {
	constructor() {}

	calculateBuildArea(build: BuildingElement): number {
		const topLeftPoint = build.XY[0].points[0];
		const downRightPoint = build.XY[0].points[2];
		return (
			Math.abs(topLeftPoint.x - downRightPoint.x) *
			Math.abs(topLeftPoint.y - downRightPoint.y)
		);
	}

	static calculateBuildArea(build: BuildingElement): number {
		const topLeftPoint = build.XY[0].points[0];
		const downRightPoint = build.XY[0].points[2];
		return (
			Math.abs(topLeftPoint.x - downRightPoint.x) *
			Math.abs(topLeftPoint.y - downRightPoint.y)
		);
	}

	calculateDensity(build: BuildingElement & { NumPeople: number }): number {
		return build.NumPeople / this.calculateBuildArea(build);
	}

	calculateRGB(build: BuildingElement & { NumPeople: number }): string {
		const area = this.calculateBuildArea(build);
		let val = Math.floor(((build.NumPeople / area) * 255) / 5);
		val = val > 255 ? 255 : val;

		return `rgb(${val},0,${val - 255})`;
	}

	findMinCoordinates(XY: Array<{ x: number; y: number }>): { x: number; y: number } {
		return {
			x: Math.min(...XY.map(point => point.x)),
			y: Math.min(...XY.map(point => point.y))
		};
	}

	static findMinCoordinates(XY: Array<{ x: number; y: number }>): {
		x: number;
		y: number;
	} {
		return {
			x: Math.min(...XY.map(point => point.x)),
			y: Math.min(...XY.map(point => point.y))
		};
	}

	findMaxCoordinates(XY: Array<{ x: number; y: number }>): { x: number; y: number } {
		return {
			x: Math.max(...XY.map(point => point.x)),
			y: Math.max(...XY.map(point => point.y))
		};
	}

	static findMaxCoordinates(XY: Array<{ x: number; y: number }>): {
		x: number;
		y: number;
	} {
		return {
			x: Math.max(...XY.map(point => point.x)),
			y: Math.max(...XY.map(point => point.y))
		};
	}

	getRandomArbitrary(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}

	static getRandomArbitrary(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}

	// Проверка на пересечение
	inPoly(x: number, y: number, xp: number[], yp: number[]): number {
		const npol = xp.length;
		let j = npol - 1;
		let c = 0;
		for (let i = 0; i < npol; i++) {
			if (
				((yp[i] <= y && y < yp[j]) || (yp[j] <= y && y < yp[i])) &&
				x > ((xp[j] - xp[i]) * (y - yp[i])) / (yp[j] - yp[i]) + xp[i]
			) {
				c++;
			}
			j = i;
		}
		return c;
	}

	// Проверка на пересечение
	static isInPoly(x: number, y: number, xp: number[], yp: number[]): number {
		const npol = xp.length;
		let j = npol - 1;
		let c = 0;
		for (let i = 0; i < npol; i++) {
			if (
				((yp[i] <= y && y < yp[j]) || (yp[j] <= y && y < yp[i])) &&
				x > ((xp[j] - xp[i]) * (y - yp[i])) / (yp[j] - yp[i]) + xp[i]
			) {
				c++;
			}
			j = i;
		}
		return c;
	}

	static inPolygon(x: number, y: number, xp: number[], yp: number[]): number {
		const npol = xp.length;
		let j = npol - 1;
		let c = 0;
		for (let i = 0; i < npol; i++) {
			if (
				((yp[i] <= y && y < yp[j]) || (yp[j] <= y && y < yp[i])) &&
				x > ((xp[j] - xp[i]) * (y - yp[i])) / (yp[j] - yp[i]) + xp[i]
			) {
				c++;
			}
			j = i;
		}
		return c;
	}
}
