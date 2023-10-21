import type { ScenarioConfiguration } from '../../types/ScenarioConfiguration';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { getConfig } from '../actionCreators/getConfig';
import { DistributionType } from '../../enums/DistributionType';
import { TransitionType } from '../../enums/TransitionType';

interface ConfigState {
	config: ScenarioConfiguration;
	isLoading: boolean;
	error: string;
}

const initialState: ConfigState = {
	config: {
		version: '0.1.0',
		loggerCfg: '',
		bimFiles: [],
		distribution: {
			type: DistributionType.Uniform,
			density: 1.0,
			special: [
				{
					uuid: ['87c49613-44a7-4f3f-82e0-fb4a9ca2f46d'],
					density: 1.0,
					comment: 'The uuid is Room_1 by three_zone_three_transit'
				}
			]
		},
		transitionParameters: {
			type: TransitionType.FromBim,
			doorwayIn: 0,
			doorwayOut: 0,
			special: [
				{
					uuid: ['dcbd8b6e-6dd0-4583-8aac-2492797f8032'],
					width: 1.5,
					comment: 'The uuid is output by three_zone_three_transit'
				}
			]
		},
		modelingParameters: {
			step: 0.01,
			maxSpeed: 100,
			maxDensity: 5,
			minDensity: 0.1
		}
	},
	isLoading: false,
	error: ''
};

export const configSlice = createSlice({
	name: 'config',
	initialState,
	reducers: {
		changeLoggerFile: (state, action: PayloadAction<string>) => {
			if (Boolean(state.config)) {
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
