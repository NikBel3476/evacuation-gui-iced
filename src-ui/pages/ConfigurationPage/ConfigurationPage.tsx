import { FC } from 'react';
import { Link } from 'react-router-dom';
import { RescriptComponent } from '../../components/RescriptComponent/RescriptComponent.gen';

type configurationPageProps = {};

const ConfigurationPage: FC<configurationPageProps> = () => {
	return (
		<main>
			<h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
				Configuration page
			</h1>
			<Link
				className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 ml-3 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				to="/"
			>
				Main page
			</Link>
			<RescriptComponent />
		</main>
	);
};

export default ConfigurationPage;
