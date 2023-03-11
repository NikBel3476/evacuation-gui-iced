import { DistributionType } from '../enums/DistributionType';
import { SpecialDistribution } from './SpecialDistribution';
import { TransitionType } from '../enums/TransitionType';
import { SpecialTransition } from './SpecialTransition';

export interface ScenarioConfiguration {
	files: string[];
	logger_config: string;
	distribution: {
		distribution_type: DistributionType;
		density: number;
		special: SpecialDistribution[];
	};
	transition: {
		transitions_type: TransitionType;
		doorway_in: number;
		doorway_out: number;
		special: SpecialTransition[];
	};
	modeling: {
		step: number;
		max_speed: number;
		max_density: number;
		min_density: number;
	};
}
