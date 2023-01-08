import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RescriptComponent } from './RescriptComponent.gen';

describe('Rescript Component', () => {
	test('should render', () => {
		render(<RescriptComponent />);
		expect(screen.getByTestId('text-content')).toBeInTheDocument();
	});
});
