import { invoke } from '@tauri-apps/api';
import { ScenarioConfiguration } from '../types/ScenarioConfiguration';

export const loadScenarioConfig = async () =>
	await invoke<ScenarioConfiguration>('read_config');
