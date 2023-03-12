import React, { FC } from 'react';
import cn from 'classnames';
import styles from './PeopleTraffic.module.css';
import FloorInfo from '../../components/modeling/FloorInfo';
import BuildingView from '../../components/modeling/BuildingView';
import ControlPanel from '../../components/modeling/ControlPanel';

const PeopleTraffic: FC = () => {
	return (
		<main className={cn(styles.container, 'text-sm font-medium text-white')}>
			<FloorInfo />
			<BuildingView />
			<ControlPanel />
		</main>
	);
};

export default PeopleTraffic;
