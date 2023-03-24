/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import rescript from '@jihchi/vite-plugin-rescript';
import * as path from 'path';

export default defineConfig({
	plugins: [react(), rescript()],
	// prevent vite from obscuring rust errors
	clearScreen: false,
	// Tauri expects a fixed port, fail if that port is not available
	server: {
		strictPort: true
	},
	// to make use of `TAURI_PLATFORM`, `TAURI_ARCH`, `TAURI_FAMILY`,
	// `TAURI_PLATFORM_VERSION`, `TAURI_PLATFORM_TYPE` and `TAURI_DEBUG`
	// env variables
	envPrefix: ['VITE_', 'TAURI_'],
	css: {
		modules: {
			localsConvention: 'camelCase'
		}
	},
	build: {
		// Tauri supports es2021
		target: ['es2021', 'chrome100', 'safari13'],
		// don't minify for debug builds
		minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
		// produce sourcemaps for debug builds
		sourcemap: !!process.env.TAURI_DEBUG,
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, 'index.html'),
				configuration: path.resolve(__dirname, 'src-ui', 'config', 'index.html'),
				configurationRescript: path.resolve(
					__dirname,
					'src-ui',
					'configRescript',
					'index.html'
				),
				peopleTraffic: path.resolve(__dirname, 'src-ui', 'peopleTraffic', 'index.html'),
				buildingView: path.resolve(__dirname, 'src-ui', 'buildingView', 'index.html')
			}
		}
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: 'src-ui/setupTests.ts',
		coverage: {
			all: true,
			exclude: [
				'coverage/**',
				'dist/**',
				'packages/*/test{,s}/**',
				'**/*.d.ts',
				'cypress/**',
				'test{,s}/**',
				'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
				'**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
				'**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
				'**/__tests__/**',
				'**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*',
				'**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
				'vite.config.ts',
				'tailwind.config.cjs',
				'postcss.config.cjs',
				'**/target/**'
			]
		}
	}
});
