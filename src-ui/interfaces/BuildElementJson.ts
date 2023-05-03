import { BimElementSign } from '../enums/BimElementSign';
import { CoordinatesJson } from './CoordinatesJson';

export interface BuildElementJson {
	'@': string;
	Name: string;
	SizeZ: number;
	Sign: BimElementSign;
	XY: CoordinatesJson[];
	Output: string[];
	Id: string;
}
