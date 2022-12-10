export interface TimeData {
	items: Array<TimeState>;
}

export interface TimeState {
	doors: Array<DoorTimeState>;
	rooms: Array<RoomTimeState>;
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
