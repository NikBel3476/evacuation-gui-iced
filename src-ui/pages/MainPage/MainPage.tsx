import { invoke } from '@tauri-apps/api/tauri';
import { FC } from 'react';
import { Link } from 'react-router-dom';

type mainPageProps = {};

const MainPage: FC<mainPageProps> = () => {
	const handleOpenConfigurationButtonClick = () => {
		invoke('open_configuration_window');
	};

	return (
		<main>
			<h1>Main page</h1>
			<Link to="configuration">Configuration page</Link>
			<div>
				<button onClick={handleOpenConfigurationButtonClick}>
					Open configuration window
				</button>
			</div>
		</main>
	);
};

export default MainPage;
