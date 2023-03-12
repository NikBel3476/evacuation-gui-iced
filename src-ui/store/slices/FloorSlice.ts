import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FloorState {
	level: number;
	type: string;
	name: string;
	id: string;
	numberOfPeople: number;
	area: number;
}

const initialState: FloorState = {
	level: 0,
	type: '',
	name: '',
	id: '',
	numberOfPeople: 0,
	area: 0
};

export const floorSlice = createSlice({
	name: 'floor',
	initialState,
	reducers: {
		setLevel: (state, action: PayloadAction<number>) => {
			state.level = action.payload;
		},
		setType: (state, action: PayloadAction<string>) => {
			state.type = action.payload;
		},
		setName: (state, action: PayloadAction<string>) => {
			state.name = action.payload;
		},
		setId: (state, action: PayloadAction<string>) => {
			state.id = action.payload;
		},
		setNumberOfPeople: (state, action: PayloadAction<number>) => {
			state.numberOfPeople = action.payload;
		},
		setArea: (state, action: PayloadAction<number>) => {
			state.area = action.payload;
		}
	}
});

export const { setLevel, setType, setName, setId, setNumberOfPeople, setArea } =
	floorSlice.actions;

export default floorSlice.reducer;
