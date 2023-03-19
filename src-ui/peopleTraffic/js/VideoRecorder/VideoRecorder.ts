export class VideoRecorder {
	private recordedChunks: Blob[] = [];
	private blob?: Blob;
	private readonly stream: MediaStream;
	private readonly mediaRecorder: MediaRecorder;
	private _recordingState: RecordingState = 'inactive';

	get recordingState(): RecordingState {
		return this._recordingState;
	}

	constructor(
		private readonly canvas: HTMLCanvasElement,
		frameRate = 24,
		mimeType = 'video/webm'
	) {
		this.stream = this.canvas.captureStream(frameRate);
		this.mediaRecorder = new MediaRecorder(this.stream, {
			mimeType
		});
		this.mediaRecorder.ondataavailable = event => {
			this.recordedChunks.push(event.data);
		};
	}

	startRecording(timeSlice = 1000): void {
		this.mediaRecorder.start(timeSlice);
		this._recordingState = 'recording';
	}

	stopRecording(): void {
		if (this.mediaRecorder.state === 'recording') {
			this.mediaRecorder.stop();
			this.blob = new Blob(this.recordedChunks, { type: 'video/webm' });
			this._recordingState = 'inactive';
		}
	}

	pause(): void {
		if (this.mediaRecorder.state === 'recording') {
			this.mediaRecorder.pause();
			this._recordingState = 'paused';
		}
	}

	resume(): void {
		if (this.mediaRecorder.state === 'paused') {
			this.mediaRecorder.resume();
			this._recordingState = 'recording';
		}
	}

	download(): void {
		if (this.blob) {
			const tempLink = document.createElement('a');
			tempLink.setAttribute('download', 'recordingVideo');
			const url = URL.createObjectURL(this.blob);
			tempLink.setAttribute('href', url);
			tempLink.click();
			this.recordedChunks = [];
		}
	}
}
