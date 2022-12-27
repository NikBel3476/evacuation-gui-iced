export const startRecording = (canvas: HTMLCanvasElement) => {
	const chunks = [];
	const stream = canvas.captureStream();
	const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
};
