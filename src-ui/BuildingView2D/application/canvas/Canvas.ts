interface CanvasConstructorParams {
	canvasId: string;
}

export class Canvas {
	canvas: HTMLCanvasElement;
	canvasContainer: HTMLElement;
	context: CanvasRenderingContext2D;
	private readonly bindedHandleWindowResize: () => void;

	constructor({ canvasId }: CanvasConstructorParams) {
		this.canvasContainer = document.getElementById('canvas_container') as HTMLElement;
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		this.resizeCanvas();
		this.context = this.canvas.getContext('2d', {
			willReadFrequently: true
		}) as CanvasRenderingContext2D;
		this.bindedHandleWindowResize = this.handleWindowResize.bind(this);
		this.setupListeners();
	}

	setupListeners() {
		window.addEventListener('resize', this.bindedHandleWindowResize);
	}

	removeListeners() {
		window.removeEventListener('resize', this.bindedHandleWindowResize);
	}

	handleWindowResize() {
		this.resizeCanvas();
	}

	resizeCanvas() {
		this.canvas.width = this.canvasContainer.clientWidth;
		this.canvas.height = this.canvasContainer.clientHeight;
	}

	fill(color: CanvasFillStrokeStyles['fillStyle']) {
		this.context.fillStyle = color;
		this.context.fill();
	}

	beginPath() {
		this.context.beginPath();
	}

	closePath() {
		this.context.closePath();
	}

	moveTo(x: number, y: number) {
		this.context.moveTo(x, y);
	}

	fillRect(color: CanvasFillStrokeStyles['fillStyle'] = 'white') {
		this.context.fillStyle = color;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	line(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		color: CanvasFillStrokeStyles['strokeStyle'] = 'black'
	) {
		this.context.strokeStyle = color;
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
		this.context.stroke();
	}

	line_(x: number, y: number, color: CanvasFillStrokeStyles['strokeStyle'] = 'black') {
		this.context.strokeStyle = color;
		this.context.lineTo(x, y);
		this.context.stroke();
	}

	circle(
		x: number,
		y: number,
		r: number,
		color: CanvasFillStrokeStyles['strokeStyle'] = 'black'
	) {
		this.context.beginPath();
		this.context.strokeStyle = color;
		this.context.arc(x, y, r, 0, 2 * Math.PI);
		this.context.stroke();
		this.fill(color);
	}

	rect(
		x: number,
		y: number,
		width: number,
		height: number,
		color: CanvasFillStrokeStyles['strokeStyle'] = 'black'
	) {
		this.context.beginPath();
		this.context.strokeStyle = color;
		this.context.rect(x, y, width, height);
		this.context.stroke();
	}

	fillSmallRect(
		x: number,
		y: number,
		width: number,
		height: number,
		color:
			| CanvasFillStrokeStyles['fillStyle']
			| CanvasFillStrokeStyles['strokeStyle'] = 'black'
	) {
		this.context.beginPath();
		this.context.strokeStyle = color;
		this.context.fillStyle = color;
		this.context.fillRect(x, y, width, height);
		this.context.stroke();
	}

	text(
		text: string,
		x: number,
		y: number,
		color: CanvasFillStrokeStyles['fillStyle'] = 'black',
		size: number = 50
	) {
		this.context.fillStyle = color;
		this.context.font = `${size}px Georgia`;
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
		this.context.drawImage(this.canvas, 0, 0);
	}

	clear(color: CanvasFillStrokeStyles['fillStyle'] = '#EAF0F1') {
		this.context.fillStyle = color;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
