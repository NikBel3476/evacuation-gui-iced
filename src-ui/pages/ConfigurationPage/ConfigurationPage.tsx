import { FC } from 'react';
import { Link } from 'react-router-dom';
import { RescriptComponent } from '../../components/RescriptComponent/RescriptComponent.gen';

type configurationPageProps = {};

const ConfigurationPage: FC<configurationPageProps> = () => {
	return (
		<main>
			<h1>Configuration page</h1>
			<Link to="/">Main page</Link>
			<RescriptComponent />
		</main>
	);
};

export default ConfigurationPage;
