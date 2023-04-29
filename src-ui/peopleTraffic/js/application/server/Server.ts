// import * as data from '../../../udsu_b1_L4_v2_190701.json';
import * as data from '../../../../../res/test_school.json';
import { Building } from '../Interfaces/Building';

export class Server {
	data: Building;

	constructor() {
		this.data = data;
	}
}
