import { invoke } from '@tauri-apps/api';
import type { ScenarioConfiguration } from '../types/ScenarioConfiguration';
import type { EvacuationModelingResult } from '../types/ModelingResult';

export const loadScenarioConfig = async () =>
	await invoke<ScenarioConfiguration>('read_config');

export const runEvacuationModeling = async (
	filePath: string,
	scenarioConfiguration: ScenarioConfiguration
) =>
	await invoke<EvacuationModelingResult>('run_modeling', {
		filePath,
		scenarioConfiguration
	});
