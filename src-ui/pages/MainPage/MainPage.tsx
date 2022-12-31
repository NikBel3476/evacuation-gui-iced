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
			<h1>Main page</h1>
			<header>
				<nav>
					<ul className={styles.linkList}>
						<li>
							<Link to="configuration">Configuration page</Link>
						</li>
						<li>
							<button onClick={handleOpenConfigurationButtonClick}>
								Открыть окно настроек
							</button>
						</li>
						<li>
							<button onClick={handleOpenConfigurationRescriptButtonClick}>
								Открыть окно настроек(Rescript)
							</button>
						</li>
						<li>
							<button onClick={handleOpenPeopleTrafficButtonClick}>
								Открыть окно моделирования эвакуации
							</button>
						</li>
						<li>
							<button onClick={handleOpenBuildingViewButtonClick}>
								Открыть окно просмотра модели здания
							</button>
						</li>
						<li>
							<button onClick={handleBimStartButtonClick}>Запустить симуляцию</button>
						</li>
					</ul>
				</nav>
			</header>
		</main>
	);
};

export default MainPage;
