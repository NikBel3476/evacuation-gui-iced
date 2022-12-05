export class Mathem {
	constructor() {}

	toCalculateBuildArea(build) {
		const XY = build.XY[0].points;
		let s = 0;
		for (let i = 0; i < XY.length - 1; i++) {
			s += XY[i].x * XY[i + 1].y - XY[i].y * XY[i + 1].x;
		}
		s /= 2;
		s = Math.abs(s);
		return s;
	}

	toCalculateDensity(build) {
		const s = this.toCalculateBuildArea(build);
		const density = build.NumPeople / s;
		return density;
	}

	toCalculateRGB(build) {
		let R = 0;
		let B = 255;
		const s = this.toCalculateBuildArea(build);
		let val = Math.floor(((build.NumPeople / s) * 255) / 5);
		if (val > 255) {
			val = 255;
		}
		R += val;
		B -= val;
		return 'rgb(' + R + ',0,' + B + ')';
	}

	toCalculateMinXY(XY: Array<{ x: number; y: number }>) {
		let minX = XY[0].x;
		let minY = XY[0].y;
		for (let i = 1; i < XY.length; i++) {
			if (minX > XY[i].x) {
				minX = XY[i].x;
			}
			if (minY > XY[i].y) {
				minY = XY[i].y;
			}
		}
		return { x: minX, y: minY };
	}

	toCalculateMaxXY(XY: Array<{ x: number; y: number }>) {
		let maxX = XY[0].x;
		let maxY = XY[0].y;
		for (let i = 1; i < XY.length; i++) {
			if (maxX < XY[i].x) {
				maxX = XY[i].x;
			}
			if (maxY < XY[i].y) {
				maxY = XY[i].y;
			}
		}
		return { x: maxX, y: maxY };
	}

	getRandomArbitrary(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}

	// Проверка на пересечение
	inPoly(x: number, y: number, xp: number[], yp: number[]) {
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
