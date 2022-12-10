export interface TimeData {
	items: Array<TimeState>;
	timeStep: number;
	timerSpeedUp: number;
	timerTimeDataUpdatePause: boolean;
}

interface TimeState {
	doors: Array<DoorTimeState>;
	rooms: Array<RoomTimeState>;
	time: number;
}

interface DoorTimeState {
	uuid: string;
	from: string;
	nfrom: number;
}

interface RoomTimeState {
	uuid: string;
	density: number;
}
