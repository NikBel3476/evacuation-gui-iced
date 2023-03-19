export interface TimeData {
	items: TimeState[];
}

export interface TimeState {
	doors: DoorTimeState[];
	rooms: RoomTimeState[];
	time: number;
}

export interface DoorTimeState {
	uuid: string;
	from: string;
	nfrom: number;
}

export interface RoomTimeState {
	uuid: string;
	density: number;
}
