import { createAsyncThunk } from '@reduxjs/toolkit';
import { loadScenarioConfig } from '../../rustCalls/config';

export const getConfig = createAsyncThunk('config', async (_, thunkAPI) => {
	try {
		return await loadScenarioConfig();
	} catch (e) {
		return thunkAPI.rejectWithValue('Configuration loading error');
	}
});
