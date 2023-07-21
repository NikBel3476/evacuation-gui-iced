import { DistributionType } from '../enums/DistributionType';
import { SpecialDistribution } from './SpecialDistribution';
import { TransitionType } from '../enums/TransitionType';
import { SpecialTransition } from './SpecialTransition';

export interface ScenarioConfiguration {
	version: string;
	bimFiles: string[];
	loggerCfg: string;
	distribution: {
		type: DistributionType;
		density: number;
		special: SpecialDistribution[];
	};
	transitionParameters: {
		type: TransitionType;
		doorwayIn: number;
		doorwayOut: number;
		special: SpecialTransition[];
	};
	modelingParameters: {
		step: number;
		maxSpeed: number;
		maxDensity: number;
		minDensity: number;
	};
}
