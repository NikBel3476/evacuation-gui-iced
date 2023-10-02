import { Building } from '../Interfaces/Building';

export class Server {
	data: Building;

	constructor(buildingData: Building) {
		this.data = buildingData;
	}
}
