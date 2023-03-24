export class BASE_SETTINGS {
	CANVAS: {
		ID: string;
		WIDTH: number;
		HEIGHT: number;
	};

	SERVER;
	GIFGENERATOR;

	constructor() {
		this.CANVAS = {
			ID: 'field',
			WIDTH: 900,
			HEIGHT: 900
		};
		this.SERVER = {};
		this.GIFGENERATOR = {};
	}
}
