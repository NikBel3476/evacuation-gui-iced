import buildingTest from '../../res/building_test.json';
import oneZoneOneExit from '../../res/one_zone_one_exit.json';
import twoLevels from '../../res/two_levels.json';
import threeZonesThreeTransits from '../../res/three_zone_three_transit.json';
import udsu from '../../res/udsu_b1_L4_v2_190701.json';

export const bimFiles: Record<string, any> = {
	'../res/two_levels.json': twoLevels,
	'../res/one_zone_one_exit.json': oneZoneOneExit,
	'../res/three_zone_three_transit.json': threeZonesThreeTransits,
	'../res/building_test.json': buildingTest,
	'../res/udsu_b1_L4_v2_190701.json': udsu
};
