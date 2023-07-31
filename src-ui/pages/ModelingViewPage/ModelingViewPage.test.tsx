import { screen } from '@testing-library/react';
import ModelingViewPage from './ModelingViewPage';
import { renderWithProviders } from '../../tests/helpers/renderWithProviders';
import { MemoryRouter } from 'react-router-dom';

describe('ModelingViewPage tests', () => {
	test('Should be rendered without errors', () => {
		renderWithProviders(
			<MemoryRouter initialEntries={['/']}>
				<ModelingViewPage />
			</MemoryRouter>
		);

		expect(screen.getByText(/Main page/)).toBeInTheDocument();
	});
});
