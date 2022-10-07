import { FC } from 'react';
import { Link } from 'react-router-dom';

type configurationPageProps = {};

const ConfigurationPage: FC<configurationPageProps> = () => {
	return (
		<main>
			<h1>Configuration page</h1>
			<Link to="/">Main page</Link>
		</main>
	);
};

export default ConfigurationPage;
