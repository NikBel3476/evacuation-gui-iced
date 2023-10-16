import { TimeData } from '../BuildingView2D/application/Interfaces/TimeData';

export interface EvacuationModelingResult {
	number_of_people_inside_building: number;
	number_of_evacuated_people: number;
	time_in_seconds: number;
	people_distribution_stats: DistributionState;
	distribution_by_time_steps: TimeData;
}

interface DistributionState {
	time_in_minutes: number;
	distribution: number[];
}
