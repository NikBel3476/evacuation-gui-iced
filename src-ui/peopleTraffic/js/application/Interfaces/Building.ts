export interface Building {
	NameBuilding: string;
	Level: Array<Level>;
	Address: Address;
}

export interface Address {
	City: string;
	StreetAddress: string;
	AddInfo: string;
}

export interface Level {
	NameLevel: string;
	ZLevel: number;
	BuildElement: Array<BuildingElement>;
}

export interface BuildingElement {
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

export interface BuildingElementPoints {
	points: Array<Point>;
}

export interface Point {
	x: number;
	y: number;
}
