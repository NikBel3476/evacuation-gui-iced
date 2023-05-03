import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BuildingElement } from '../../interfaces/BuildingElement';
import { BimJson } from '../../interfaces/BimJson';

interface BuildingViewState {
	buildingElement: BuildingElement | null;
	currentLevel: number;
	scale: number;
	evacuationTime: number;
	numberOfPeopleInsideBuilding: number;
	numberOfPeopleOutsideBuilding: number;
	bim?: BimJson;
}

const initialState: BuildingViewState = {
	buildingElement: null,
	currentLevel: 0,
	scale: 1,
	evacuationTime: 0,
	numberOfPeopleInsideBuilding: 0,
	numberOfPeopleOutsideBuilding: 0
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
		},
		incrementCurrentLevel: state => {
			state.currentLevel++;
		},
		decrementCurrentLevel: state => {
			state.currentLevel--;
		},
		setCurrentLevel: (state, action: PayloadAction<number>) => {
			state.currentLevel = action.payload;
		},
		setScale: (state, action: PayloadAction<number>) => {
			state.scale = action.payload;
		},
		incrementScale: state => {
			state.scale += 0.1;
		},
		incrementScaleBy: (state, action: PayloadAction<number>) => {
			state.scale += action.payload;
		},
		decrementScale: state => {
			state.scale -= 0.1;
		},
		decrementScaleBy: (state, action: PayloadAction<number>) => {
			state.scale -= action.payload;
		},
		incrementEvacuationTime: state => {
			state.evacuationTime++;
		},
		setPeopleInsideBuilding: (state, action: PayloadAction<number>) => {
			state.numberOfPeopleInsideBuilding = action.payload;
		},
		setPeopleOutsideBuilding: (state, action: PayloadAction<number>) => {
			state.numberOfPeopleOutsideBuilding = action.payload;
		},
		setBim: (state, action: PayloadAction<BimJson>) => {
			state.bim = action.payload;
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
	setElementArea,
	incrementCurrentLevel,
	decrementCurrentLevel,
	setCurrentLevel,
	setScale,
	incrementScale,
	incrementScaleBy,
	decrementScale,
	decrementScaleBy,
	incrementEvacuationTime,
	setPeopleInsideBuilding,
	setPeopleOutsideBuilding,
	setBim
} = buildingViewSlice.actions;

export default buildingViewSlice.reducer;
