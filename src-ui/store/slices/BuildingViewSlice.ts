import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BuildingElement } from '../../interfaces/BuildingElement';

interface BuildingViewState {
	buildingElement: BuildingElement | null;
	currentLevel: number;
}

const initialState: BuildingViewState = {
	buildingElement: null,
	currentLevel: 0
};

export const buildingViewSlice = createSlice({
	name: 'floor',
	initialState,
	reducers: {
		setBuildingElement: (state, action: PayloadAction<BuildingElement>) => {
			state.buildingElement = {
				...action.payload
			};
		},
		setElementLevel: (state, action: PayloadAction<number>) => {
			if (state.buildingElement) {
				state.buildingElement.level = action.payload;
			}
		},
		setElementType: (state, action: PayloadAction<string>) => {
			if (state.buildingElement) {
				state.buildingElement.type = action.payload;
			}
		},
		setElementName: (state, action: PayloadAction<string>) => {
			if (state.buildingElement) {
				state.buildingElement.name = action.payload;
			}
		},
		setElementId: (state, action: PayloadAction<string>) => {
			if (state.buildingElement) {
				state.buildingElement.id = action.payload;
			}
		},
		setElementNumberOfPeople: (state, action: PayloadAction<number>) => {
			if (state.buildingElement) {
				state.buildingElement.numberOfPeople = action.payload;
			}
		},
		setElementArea: (state, action: PayloadAction<number>) => {
			if (state.buildingElement) {
				state.buildingElement.area = action.payload;
			}
		}
	}
});

export const {
	setBuildingElement,
	setElementLevel,
	setElementType,
	setElementName,
	setElementId,
	setElementNumberOfPeople,
	setElementArea
} = buildingViewSlice.actions;

export default buildingViewSlice.reducer;
