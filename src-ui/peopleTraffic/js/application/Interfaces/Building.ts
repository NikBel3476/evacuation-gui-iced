export interface Building {
	NameBuilding: string;
	Level: Array<Level>;
	Address: Address;
}

interface Address {
	City: string;
	StreetAddress: string;
	AddInfo: string;
}

interface Level {
	NameLevel: string;
	ZLevel: number;
	BuildElement: Array<BuildingElement>;
}

interface BuildingElement {
	'@': string;
	Name: string;
	SizeZ: number;
	Sign: string;
	Up?: string;
	Down?: string;
	XY: Array<BuildingElementPoints>;
	Output: Array<string>;
	Id: string;
}

interface BuildingElementPoints {
	points: Array<Point>;
}

interface Point {
	x: number;
	y: number;
}
