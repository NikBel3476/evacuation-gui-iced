import type { Options } from '@wdio/types';
import os from 'os';
import path from 'path';
import { spawn, spawnSync } from 'child_process';

// keep track of the `tauri-driver` child process
let tauriDriver;
const appExecutableName = process.platform === 'win32' ? 'evacuation.exe' : 'evacuation';
const tauriDriverExecuatbleName =
	process.platform === 'win32' ? 'tauri-driver.exe' : 'tauri-driver';

export const config: Options.Testrunner = {
	specs: ['./test/specs/**/*.{js,ts}'],
	hostname: '127.0.0.1',
	maxInstances: 1,
	capabilities: [
		{
			maxInstances: 1,
			'tauri:options': {
				application: './target/release/' + appExecutableName
			}
			// 'ms:edgeOptions': {
			// 	args: ['--headless']
			// },
			// 'moz:firefoxOptions': {
			// 	args: ['-headless']
			// }
		}
	],
	reporters: ['spec'],
	framework: 'mocha',
	mochaOpts: {
		ui: 'bdd',
		timeout: 60000
	},

	// ensure the rust project is built since we expect this binary to exist for the webdriver sessions
	onPrepare: () => spawnSync('cargo', ['build', '--release']),

	// ensure we are running `tauri-driver` before the session starts so that we can proxy the webdriver requests
	beforeSession: () =>
		(tauriDriver = spawn(
			path.resolve(os.homedir(), '.cargo', 'bin', tauriDriverExecuatbleName),
			[],
			{ stdio: [null, process.stdout, process.stderr] }
		)),

	// clean up the `tauri-driver` process we spawned at the start of the session
	afterSession: () => tauriDriver.kill()
};
