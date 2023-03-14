export interface Building {
	NameBuilding: string;
	Level: Level[];
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
	BuildElement: BuildingElement[];
}

export interface BuildingElement {
	'@': string;
	Name: string;
	SizeZ: number;
	Sign: string;
	Up?: string;
	Down?: string;
	XY: BuildingElementPoints[];
	Output: string[];
	Id: string;
}

export interface BuildingElementPoints {
	points: Point[];
}

export interface Point {
	x: number;
	y: number;
}
