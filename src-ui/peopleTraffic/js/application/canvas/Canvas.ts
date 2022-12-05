type CanvasConstructorParams = {
	ID: string;
};

export class Canvas {
	canvasContainer: HTMLElement;
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	x0: number;
	y0: number;
	memCanvas: HTMLCanvasElement;
	memContext: CanvasRenderingContext2D;

	constructor({ ID }: CanvasConstructorParams) {
		this.canvasContainer = document.getElementById('canvas_container') as HTMLElement; //я на время добавил если что
		this.canvas = document.getElementById(ID) as HTMLCanvasElement;
		this.canvas.width = this.canvasContainer.offsetWidth;
		this.canvas.height = this.canvasContainer.clientHeight;
		this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		this.x0 = 0;
		this.y0 = 0;

		console.log(this.canvasContainer);

		this.memCanvas = document.createElement('canvas');
		console.log(this.memCanvas);
		this.memCanvas.width = this.canvasContainer.clientWidth;
		this.memCanvas.height = this.canvasContainer.clientHeight;
		this.memContext = this.memCanvas.getContext('2d') as CanvasRenderingContext2D;
	}

	fill(color: CanvasFillStrokeStyles['fillStyle']) {
		this.memContext.fillStyle = color;
		this.memContext.fill();
	}

	beginPath() {
		this.memContext.beginPath();
	}

	closePath() {
		this.memContext.closePath();
	}

	moveTo(x: number, y: number) {
		this.memContext.moveTo(x, y);
	}

	fillRect(color: CanvasFillStrokeStyles['fillStyle']) {
		this.context.fillStyle = color || 'white';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	line(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		color: CanvasFillStrokeStyles['strokeStyle']
	) {
		this.memContext.strokeStyle = color || 'black';
		this.memContext.moveTo(x1 + this.x0, y1 + this.y0);
		this.memContext.lineTo(x2 + this.x0, y2 + this.y0);
		this.memContext.stroke();
	}

	line_(x: number, y: number, color: CanvasFillStrokeStyles['strokeStyle']) {
		this.memContext.strokeStyle = color || 'black';
		this.memContext.lineTo(x, y);
		this.memContext.stroke();
	}

	circle(x: number, y: number, r: number, color: CanvasFillStrokeStyles['strokeStyle']) {
		this.memContext.beginPath();
		this.memContext.strokeStyle = color || 'black';
		this.memContext.arc(x, y, r, 0, 2 * Math.PI);
		this.memContext.stroke();
		this.fill(color);
	}

	rect(
		x: number,
		y: number,
		width: number,
		height: number,
		color: CanvasFillStrokeStyles['strokeStyle']
	) {
		this.context.beginPath();
		this.context.strokeStyle = color || 'black';
		this.context.rect(x, y, width, height);
		this.context.stroke();
	}

	fillSmallRect(
		x: number,
		y: number,
		width: number,
		height: number,
		color: CanvasFillStrokeStyles['fillStyle'] | CanvasFillStrokeStyles['strokeStyle']
	) {
		this.context.beginPath();
		this.context.strokeStyle = color || 'black';
		this.context.fillStyle = color || 'black';
		this.context.fillRect(x, y, width, height);
		this.context.stroke();
	}

	text(
		text: string,
		x: number,
		y: number,
		color: CanvasFillStrokeStyles['fillStyle'],
		size: number
	) {
		this.context.fillStyle = color || 'black';
		this.context.font = (size || 50) + 'px Georgia';
		this.context.fillText(text, x, y);
	}

	sprite(
		img: CanvasImageSource,
		sx: number,
		sy: number,
		sWidth: number,
		sHeight: number,
		x: number,
		y: number,
		width: number,
		height: number
	) {
		this.context.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height);
	}

	print() {
		this.context.drawImage(this.memCanvas, 0, 0);
	}

	clear(color: CanvasFillStrokeStyles['fillStyle']) {
		this.memContext.fillStyle = color || '#EAF0F1';
		this.memContext.fillRect(0, 0, this.memCanvas.width, this.memCanvas.height);
	}

	rotate(angle: number) {
		this.context.rotate(angle);
	}

	restore() {
		this.context.restore();
	}

	save() {
		this.context.save();
	}

	translate(x: number, y: number) {
		this.context.translate(x, y);
	}
}
