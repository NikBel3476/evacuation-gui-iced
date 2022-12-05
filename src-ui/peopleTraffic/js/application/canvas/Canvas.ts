export class Canvas {
	canvasContainer;
	canvas;
	context;
	x0;
	y0;
	memCanvas;
	memContext;

	constructor({ ID }) {
		this.canvasContainer = document.getElementById('canvas_container'); //я на время добавил если что
		this.canvas = document.getElementById(ID);
		this.canvas.width = this.canvasContainer.offsetWidth;
		this.canvas.height = this.canvasContainer.clientHeight;
		this.context = this.canvas.getContext('2d');
		this.x0 = 0;
		this.y0 = 0;

		console.log(this.canvasContainer);

		this.memCanvas = document.createElement('canvas');
		console.log(this.memCanvas);
		this.memCanvas.width = this.canvasContainer.clientWidth;
		this.memCanvas.height = this.canvasContainer.clientHeight;
		this.memContext = this.memCanvas.getContext('2d');
	}

	fill(color) {
		this.memContext.fillStyle = color;
		this.memContext.fill();
	}

	beginPath() {
		this.memContext.beginPath();
	}

	closePath() {
		this.memContext.closePath();
	}

	moveTo(x, y) {
		this.memContext.moveTo(x, y);
	}

	fillRect(color) {
		this.context.fillStyle = color || 'white';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	line(x1, y1, x2, y2, color) {
		this.memContext.strokeStyle = color || 'black';
		this.memContext.moveTo(x1 + this.x0, y1 + this.y0);
		this.memContext.lineTo(x2 + this.x0, y2 + this.y0);
		this.memContext.stroke();
	}

	line_(x, y, color) {
		this.memContext.strokeStyle = color || 'black';
		this.memContext.lineTo(x, y);
		this.memContext.stroke();
	}

	circle(x, y, r, color) {
		this.memContext.beginPath();
		this.memContext.strokeStyle = color || 'black';
		this.memContext.arc(x, y, r, 0, 2 * Math.PI);
		this.memContext.stroke();
		this.fill(color);
	}

	rect(x, y, width, height, color) {
		this.context.beginPath();
		this.context.strokeStyle = color || 'black';
		this.context.rect(x, y, width, height);
		this.context.stroke();
	}

	fillSmallRect(x, y, width, height, color) {
		this.context.beginPath();
		this.context.strokeStyle = color || 'black';
		this.context.fillStyle = color || 'black';
		this.context.fillRect(x, y, width, height);
		this.context.stroke();
	}

	text(text, x, y, color, size) {
		this.context.fillStyle = color || 'black';
		this.context.font = (size || 50) + 'px Georgia';
		this.context.fillText(text, x, y);
	}

	sprite(img, sx, sy, swidth, sheight, x, y, width, height) {
		this.context.drawImage(
			img,
			sx,
			sy,
			swidth,
			sheight,
			x,
			y,
			width,
			height
		);
	}

	print() {
		this.context.drawImage(this.memCanvas, 0, 0);
	}

	clear(color) {
		this.memContext.fillStyle = color ? color : '#EAF0F1';
		this.memContext.fillRect(
			0,
			0,
			this.memCanvas.width,
			this.memCanvas.height
		);
	}

	rotate(val) {
		this.context.rotate(val);
	}

	restore() {
		this.context.restore();
	}

	save() {
		this.context.save();
	}

	translate(x, y) {
		this.context.translate(x, y);
	}
}
