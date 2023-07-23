import { ScenarioConfiguration } from '../../types/ScenarioConfiguration';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getConfig } from '../actionCreators/getConfig';

interface ConfigState {
	config: ScenarioConfiguration | null;
	isLoading: boolean;
	error: string;
}

const initialState: ConfigState = {
	config: null,
	isLoading: false,
	error: ''
};

export const configSlice = createSlice({
	name: 'config',
	initialState,
	reducers: {
		changeLoggerFile: (state, action: PayloadAction<string>) => {
			if (state.config) {
				state.config.loggerCfg = action.payload;
			}
		}
	},
	extraReducers: builder => {
		builder
			.addCase(getConfig.pending.type, state => {
				state.isLoading = true;
			})
			.addCase(
				getConfig.fulfilled.type,
				(state, action: PayloadAction<ScenarioConfiguration>) => {
					state.isLoading = false;
					state.config = action.payload;
					state.error = '';
				}
			)
			.addCase(getConfig.rejected.type, (state, action: PayloadAction<string>) => {
				state.isLoading = false;
				state.error = action.payload;
			});
	}
});

export const { changeLoggerFile } = configSlice.actions;

export default configSlice.reducer;
