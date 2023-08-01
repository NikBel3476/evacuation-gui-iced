import type { Meta, StoryObj } from '@storybook/react';

import { RescriptComponent } from './RescriptComponent.gen';

const meta = {
	title: 'RescriptComponent',
	component: RescriptComponent,
	parameters: {
		layout: 'centered'
	},
	tags: ['autodocs']
} satisfies Meta<typeof RescriptComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {}
};
