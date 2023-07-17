import { createAsyncThunk } from '@reduxjs/toolkit';
import { loadScenarioConfig } from '../../rustCalls';

export const getConfig = createAsyncThunk('config/getConfig', async (_, thunkAPI) => {
	try {
		return await loadScenarioConfig();
	} catch (e) {
		return thunkAPI.rejectWithValue('Configuration loading error');
	}
});
