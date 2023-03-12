import { combineReducers, configureStore } from '@reduxjs/toolkit';
import configReducer from './slices/ConfigSlice';
import floorReducer from './slices/FloorSlice';
import { setupListeners } from '@reduxjs/toolkit/query';

const rootReducer = combineReducers({
	configReducer,
	floorReducer
});

export const store = configureStore({
	reducer: rootReducer
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
