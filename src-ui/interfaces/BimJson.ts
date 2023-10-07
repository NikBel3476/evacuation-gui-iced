import type { AddressJson } from './AddressJson';
import type { LevelJson } from './LevelJson';

export interface BimJson {
	NameBuilding: string;
	Level: LevelJson[];
	Address: AddressJson;
	Devs: number[];
}
