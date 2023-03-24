import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainPage from '../pages/MainPage';
import ConfigurationPage from '../pages/ConfigurationPage';
import PeopleTraffic from '../pages/PeopleTraffic';
import ModelingViewPage from '../pages/ModelingViewPage';

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
		element: <PeopleTraffic />
	},
	{
		path: '/modelingView',
		element: <ModelingViewPage />
	}
]);
