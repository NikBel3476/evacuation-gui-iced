import React from 'react';
import cn from 'classnames';
import {
	PlayIcon,
	PauseIcon,
	ArrowDownIcon,
	ArrowUpIcon
} from '@heroicons/react/24/solid';
import styles from './PeopleTraffic.module.css';

const PeopleTraffic = () => {
	return (
		<main className={cn(styles.container, 'text-sm font-medium text-white')}>
			<aside className="p-4 bg-sky-400 grid grid-cols-1 gap-y-4 content-start">
				<h1 className="text-4xl">Данные</h1>
				<p>
					Уровень этажа:
					<p></p>
				</p>
				<p>
					Тип:
					<p></p>
				</p>
				<p>
					Название:
					<p></p>
				</p>
				<p>
					ID:
					<p></p>
				</p>
				<p>
					Количество людей:
					<p></p>
				</p>
				<p>
					Площадь:
					<p></p>
				</p>
			</aside>
			<section>
				<canvas></canvas>
			</section>
			<aside className={cn(styles.footer, 'bg-sky-400')}>
				<div className="grid grid-cols-4 grid-rows-1 gap-x-4 justify-items-center">
					<div className="p-1 rounded-full bg-indigo-600">
						<PlayIcon className="h-6 w-6 fill-amber-50" />
					</div>
					<div className="p-1 rounded-full bg-indigo-600">
						<PauseIcon className="h-6 w-6 fill-amber-50" />
					</div>
					<div className="p-1 rounded-full bg-indigo-600">
						<ArrowDownIcon className="h-6 w-6 fill-amber-50" />
					</div>
					<div className="p-1 rounded-full bg-indigo-600">
						<ArrowUpIcon className="h-6 w-6 fill-amber-50" />
					</div>
				</div>
				<div>Длительность движения: 5 сек</div>
				<div>Человек в здании: 228</div>
				<div>Человек вышло: 18</div>
			</aside>
		</main>
	);
};

export default PeopleTraffic;
