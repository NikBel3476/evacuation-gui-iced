import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainPage from '../pages/MainPage';
import ConfigurationPage from '../pages/ConfigurationPage';
import PeopleTrafficPage from '../pages/PeopleTrafficPage';
import ModelingViewPage from '../pages/ModelingViewPage';
import ModelingPage from '../pages/ModelingPage';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <MainPage />
	},
	{
		path: '/configuration',
		element: <ConfigurationPage />
	},
	{
		path: '/peopleTraffic',
		element: <PeopleTrafficPage />
	},
	{
		path: '/modeling',
		element: <ModelingPage />
	},
	{
		path: '/modelingView',
		element: <ModelingViewPage />
	}
]);
