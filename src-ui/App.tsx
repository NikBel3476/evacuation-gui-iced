import React, { FC } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ConfigurationPage from './pages/ConfigurationPage';
import MainPage from './pages/MainPage';

// TODO: move routes to separate file
const router = createBrowserRouter([
	{
		path: '/',
		element: <MainPage />
	},
	{
		path: '/configuration',
		element: <ConfigurationPage />
	}
]);

const App: FC = () => {
	return (
		<React.StrictMode>
			<RouterProvider router={router} />
		</React.StrictMode>
	);
};

export default App;
