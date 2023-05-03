import { AddressJson } from './AddressJson';
import { LevelJson } from './LevelJson';

export interface BimJson {
	NameBuilding: string;
	Level: LevelJson[];
	Address: AddressJson;
	Devs: number[];
}
