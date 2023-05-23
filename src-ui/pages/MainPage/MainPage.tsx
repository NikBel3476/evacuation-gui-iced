import { invoke } from '@tauri-apps/api/tauri';
import { FC } from 'react';

import styles from './MainPage.module.css';
import RouterLink from '../../components/RouterLink';
import Button from '../../components/Button/Button';

const MainPage: FC = () => {
	const handleOpenConfigurationButtonClick = () => {
		void invoke('open_configuration_window');
	};

	const handleOpenConfigurationRescriptButtonClick = () => {
		void invoke('open_configuration_rescript_window');
	};

	const handleOpenPeopleTrafficButtonClick = () => {
		void invoke('open_people_traffic_window');
	};

	const handleOpenBuildingViewButtonClick = () => {
		void invoke('open_building_view_window');
	};

	const handleBimStartButtonClick = () => {
		void invoke('bim_start').then(() => {
			console.log('completed');
		});
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
							<RouterLink to="configuration">Страница конфигурации</RouterLink>
						</li>
						<li>
							<RouterLink to="peopleTraffic">
								Страница визуализации моделирования эвакуации
							</RouterLink>
						</li>
						<li>
							<Button onClick={handleOpenConfigurationButtonClick}>
								Открыть окно настроек
							</Button>
						</li>
						<li>
							<Button onClick={handleOpenConfigurationRescriptButtonClick}>
								Открыть окно настроек(Rescript)
							</Button>
						</li>
						<li>
							<Button onClick={handleOpenPeopleTrafficButtonClick}>
								Открыть окно моделирования эвакуации
							</Button>
						</li>
						<li>
							<Button onClick={handleOpenBuildingViewButtonClick}>
								Открыть окно просмотра модели здания
							</Button>
						</li>
						<li>
							<Button onClick={handleBimStartButtonClick}>Запустить симуляцию</Button>
						</li>
						<li>
							<RouterLink to="modelingView">
								Страница визуализации моделирования(Pixi.js)
							</RouterLink>
						</li>
					</ul>
				</nav>
			</header>
		</main>
	);
};

export default MainPage;
