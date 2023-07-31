import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:8080',
		video: false,
		setupNodeEvents(on, config) {
			// implement node event listeners here
			on('file:preprocessor', createBundler());
		}
	}
});
