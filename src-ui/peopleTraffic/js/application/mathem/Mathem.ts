import { BuildingElement } from '../Interfaces/Building';

export class Mathem {
	constructor() {}

	calculateBuildArea(build: BuildingElement): number {
		const points = build.XY[0].points;
		// TODO: understand why length - 1 is needed
		return points
			.slice(0, -1)
			.reduce(
				(area, point, i) =>
					area + Math.abs((point.x - points[i + 1].x) * (point.y - points[i + 1].y)),
				0
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
			x: XY.reduce((min, point) => Math.min(min, point.x), 0),
			y: XY.reduce((min, point) => Math.min(min, point.y), 0)
		};
	}

	findMaxCoordinates(XY: Array<{ x: number; y: number }>): { x: number; y: number } {
		return {
			x: Math.max(...XY.map(point => point.x)),
			y: Math.max(...XY.map(point => point.y))
		};
	}

	getRandomArbitrary(min: number, max: number): number {
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
}
