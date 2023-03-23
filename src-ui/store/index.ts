import { combineReducers, configureStore } from '@reduxjs/toolkit';
import configReducer from './slices/ConfigSlice';
import buildingViewReducer from './slices/BuildingViewSlice';
import { setupListeners } from '@reduxjs/toolkit/query';

const rootReducer = combineReducers({
	configReducer,
	buildingViewReducer
});

export const store = configureStore({
	reducer: rootReducer
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
