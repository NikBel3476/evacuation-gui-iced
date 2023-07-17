import buildingTest from '../../res/building_test.json';
import oneZoneOneExit from '../../res/one_zone_one_exit.json';
import twoLevels from '../../res/two_levels.json';
import threeZonesThreeTransits from '../../res/three_zone_three_transit.json';
import testSchool from '../../res/test_school.json';
import udsu from '../../res/udsu_b1_L4_v2_190701.json';
import udsu_b1_L4_v1 from '../../res/udsu_b1_L4_v1_190701.json';
import udsu_b2_L4_v1 from '../../res/udsu_b2_L4_v1_190701.json';
import udsu_b3_L3_v1 from '../../res/udsu_b3_L3_v1_190701.json';
import udsu_b4_L5_v1 from '../../res/udsu_b4_L5_v1_190701.json';
import udsu_b5_L4_v1 from '../../res/udsu_b5_L4_v1_200102.json';
import udsu_b7_L8_v1 from '../../res/udsu_b7_L8_v1_190701.json';
import { BimJson } from '../interfaces/BimJson';

// TODO: replace hardcoded paths with paths from scenario.json
export const bimFiles: Record<string, BimJson> = {
	'../res/two_levels.json': twoLevels as BimJson,
	'../res/one_zone_one_exit.json': oneZoneOneExit as BimJson,
	'../res/three_zone_three_transit.json': threeZonesThreeTransits as BimJson,
	'../res/building_test.json': buildingTest as BimJson,
	'../res/udsu_b1_L4_v2_190701.json': udsu as BimJson,
	'../res/udsu_b1_L4_v1_190701.json': udsu_b1_L4_v1 as BimJson,
	'../res/udsu_b2_L4_v1_190701.json': udsu_b2_L4_v1 as BimJson,
	'../res/udsu_b3_L3_v1_190701.json': udsu_b3_L3_v1 as BimJson,
	'../res/udsu_b4_L5_v1_190701.json': udsu_b4_L5_v1 as BimJson,
	'../res/udsu_b5_L4_v1_190701.json': udsu_b5_L4_v1 as BimJson,
	'../res/udsu_b7_L8_v1_190701.json': udsu_b7_L8_v1 as BimJson,
	'../res/test_school': testSchool as BimJson
};
