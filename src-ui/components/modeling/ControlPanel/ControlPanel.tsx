import type { FC, MouseEventHandler } from 'react';
import React from 'react';
import cn from 'classnames';
import styles from './ControlPanel.module.css';
import {
	ArrowDownIcon,
	ArrowUpIcon,
	PauseIcon,
	PlayIcon
} from '@heroicons/react/24/solid';
import { useAppSelector } from '../../../hooks/redux';

interface ControlPanelProps {
	onPlayButtonClick: MouseEventHandler;
	onPauseButtonClick: MouseEventHandler;
	onIncrementLevelButtonClick: MouseEventHandler;
	onDecrementLevelButtonClick: MouseEventHandler;
}

const ControlPanel: FC<ControlPanelProps> = ({
	onPlayButtonClick,
	onPauseButtonClick,
	onIncrementLevelButtonClick,
	onDecrementLevelButtonClick
}) => {
	const {
		numberOfPeopleInsideBuilding,
		numberOfPeopleOutsideBuilding,
		evacuationTimeInSec
	} = useAppSelector(state => state.buildingViewReducer);

	return (
		<aside className={cn(styles.container, 'bg-sky-400')}>
			<div className="grid grid-cols-4 grid-rows-1 gap-x-4 justify-items-center">
				<div
					className="p-1 rounded-full bg-indigo-600 cursor-pointer"
					onClick={onPlayButtonClick}
				>
					<PlayIcon className="h-6 w-6 fill-amber-50" />
				</div>
				<div
					className="p-1 rounded-full bg-indigo-600 cursor-pointer"
					onClick={onPauseButtonClick}
				>
					<PauseIcon className="h-6 w-6 fill-amber-50" />
				</div>
				<div
					className="p-1 rounded-full bg-indigo-600 cursor-pointer"
					onClick={onDecrementLevelButtonClick}
				>
					<ArrowDownIcon className="h-6 w-6 fill-amber-50" />
				</div>
				<div
					className="p-1 rounded-full bg-indigo-600 cursor-pointer"
					onClick={onIncrementLevelButtonClick}
				>
					<ArrowUpIcon className="h-6 w-6 fill-amber-50" />
				</div>
			</div>
			<div>
				<p>
					Длительность движения, сек:{' '}
					<span id="evacuation_time_label">{evacuationTimeInSec.toFixed(1)}</span>
				</p>
			</div>
			<div>
				<p>
					Человек в здании:{' '}
					<span id="people_inside_building">{numberOfPeopleInsideBuilding}</span>
				</p>
			</div>
			<div>
				<p>
					Человек вышло:{' '}
					<span id="people_outside_building">{numberOfPeopleOutsideBuilding}</span>
				</p>
			</div>
		</aside>
	);
};

export default ControlPanel;
