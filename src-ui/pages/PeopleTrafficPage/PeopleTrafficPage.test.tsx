import { render, screen } from '@testing-library/react';
import { renderWithProviders } from '../../tests/helpers/renderWithProviders';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import PeopleTrafficPage from './PeopleTrafficPage';
import { renderWithRouter } from '../../tests/helpers/renderWithRouter';
import { mockIPC } from '@tauri-apps/api/mocks';
import { FileEntry } from '@tauri-apps/api/fs';

describe('ModelingViewPage tests', () => {
	test('Should be rendered without errors', () => {
		mockIPC(cmd => {
			const files: FileEntry[] = [
				{
					path: 'resources/building.json',
					name: 'building.json'
				},
				{
					path: 'res/test.json',
					name: 'test.json'
				},
				{
					path: 'two_levels.json',
					name: 'two_levels.json'
				}
			];
			if (cmd === 'readDir') {
				return files;
			}
		});

		renderWithProviders(
			<BrowserRouter>
				<PeopleTrafficPage />
			</BrowserRouter>
		);

		expect(screen.getByText(/Main page/)).toBeInTheDocument();
	});
});
