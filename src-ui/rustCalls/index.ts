import { invoke } from '@tauri-apps/api';
import { ScenarioConfiguration } from '../types/ScenarioConfiguration';
import { EvacuationModelingResult } from '../types/ModelingResult';

export const loadScenarioConfig = async () =>
	await invoke<ScenarioConfiguration>('read_config');

export const runEvacuationModeling = async (filePath: string) =>
	await invoke<EvacuationModelingResult>('run_modeling', {
		filePath
	});
