import { FC } from 'react';
import { Link } from 'react-router-dom';

type mainPageProps = {};

const MainPage: FC<mainPageProps> = () => {
	return (
		<main>
			<h1>Main page</h1>
			<Link to="configuration">Configuration page</Link>
		</main>
	);
};

export default MainPage;
