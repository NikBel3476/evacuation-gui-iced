import React, { FC, MouseEventHandler } from 'react';
import cn from 'classnames';
import styles from '../../../pages/PeopleTraffic/PeopleTraffic.module.css';
import {
	ArrowDownIcon,
	ArrowUpIcon,
	PauseIcon,
	PlayIcon
} from '@heroicons/react/24/solid';

const ControlPanel: FC = () => {
	const handlePlayButton: MouseEventHandler<HTMLDivElement> = e => {};

	return (
		<aside className={cn(styles.footer, 'bg-sky-400')}>
			<div className="grid grid-cols-4 grid-rows-1 gap-x-4 justify-items-center">
				<div className="p-1 rounded-full bg-indigo-600 cursor-pointer">
					<PlayIcon className="h-6 w-6 fill-amber-50" />
				</div>
				<div className="p-1 rounded-full bg-indigo-600 cursor-pointer">
					<PauseIcon className="h-6 w-6 fill-amber-50" />
				</div>
				<div className="p-1 rounded-full bg-indigo-600 cursor-pointer">
					<ArrowDownIcon className="h-6 w-6 fill-amber-50" />
				</div>
				<div className="p-1 rounded-full bg-indigo-600 cursor-pointer">
					<ArrowUpIcon className="h-6 w-6 fill-amber-50" />
				</div>
			</div>
			<div>
				<span className="block">Длительность движения:</span>
			</div>
			<div>
				<span className="block">Человек в здании:</span>
			</div>
			<div>
				<span className="block">Человек вышло:</span>
			</div>
		</aside>
	);
};

export default ControlPanel;
