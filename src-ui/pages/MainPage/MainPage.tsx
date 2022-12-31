import { invoke } from '@tauri-apps/api/tauri';
import { FC } from 'react';
import { Link } from 'react-router-dom';

import * as styles from './MainPage.module.css';

type mainPageProps = {};

const MainPage: FC<mainPageProps> = () => {
	const handleOpenConfigurationButtonClick = () => {
		invoke('open_configuration_window');
	};

	const handleOpenConfigurationRescriptButtonClick = () => {
		invoke('open_configuration_rescript_window');
	};

	const handleOpenPeopleTrafficButtonClick = () => {
		invoke('open_people_traffic_window');
	};

	const handleOpenBuildingViewButtonClick = () => {
		invoke('open_building_view_window');
	};

	const handleBimStartButtonClick = () => {
		invoke('bim_start');
	};

	return (
		<main>
			<header>
				<h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
					Main page
				</h1>
				<nav>
					<ul className={styles.linkList}>
						<li>
							<Link
								className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
								to="configuration"
							>
								Configuration page
							</Link>
						</li>
						<li>
							<button
								className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
								onClick={handleOpenConfigurationButtonClick}
							>
								Открыть окно настроек
							</button>
						</li>
						<li>
							<button
								className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
								onClick={handleOpenConfigurationRescriptButtonClick}
							>
								Открыть окно настроек(Rescript)
							</button>
						</li>
						<li>
							<button
								className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
								onClick={handleOpenPeopleTrafficButtonClick}
							>
								Открыть окно моделирования эвакуации
							</button>
						</li>
						<li>
							<button
								className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
								onClick={handleOpenBuildingViewButtonClick}
							>
								Открыть окно просмотра модели здания
							</button>
						</li>
						<li>
							<button
								className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
								onClick={handleBimStartButtonClick}
							>
								Запустить симуляцию
							</button>
						</li>
					</ul>
				</nav>
			</header>
		</main>
	);
};

export default MainPage;
