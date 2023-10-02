export interface EvacuationModelingResult {
	number_of_people_inside_building: number;
	number_of_evacuated_people: number;
	time_in_seconds: number;
	people_distribution_stats: any;
	distribution_by_time_steps: any;
}
