import * as data from '../../../../../res/udsu_b1_L4_v2_190701.json';
import { Building } from '../Interfaces/Building';

export class Server {
	data: Building;

	constructor() {
		this.data = data;
	}
}
