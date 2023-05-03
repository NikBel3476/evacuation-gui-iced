import buildingTest from '../../res/building_test.json';
import oneZoneOneExit from '../../res/one_zone_one_exit.json';
import twoLevels from '../../res/two_levels.json';
import threeZonesThreeTransits from '../../res/three_zone_three_transit.json';
import testSchool from '../../res/test_school.json';
import udsu from '../../res/udsu_b1_L4_v2_190701.json';
import { BimJson } from '../interfaces/BimJson';

export const bimFiles: Record<string, BimJson> = {
	'../res/two_levels.json': twoLevels as BimJson,
	'../res/one_zone_one_exit.json': oneZoneOneExit as BimJson,
	'../res/three_zone_three_transit.json': threeZonesThreeTransits as BimJson,
	'../res/building_test.json': buildingTest as BimJson,
	'../res/udsu_b1_L4_v2_190701.json': udsu as BimJson,
	'../res/test_school': testSchool as BimJson
};
