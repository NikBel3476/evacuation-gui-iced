import React, { useEffect } from 'react';
import { addStats } from 'pixi-stats';
import { Ticker, UPDATE_PRIORITY } from 'pixi.js';
import { useApp } from '@pixi/react';
// import GameStats from 'gamestats.js';
// import * as PIXI from 'pixi.js';

const Stats = () => {
	const pixiApp = useApp();

	useEffect(() => {
		// const gameStats = new GameStats();
		// document.body.appendChild(gameStats.dom);
		// gameStats.enableExtension('pixi', [PIXI, pixiApp]);

		const stats = addStats(document, pixiApp);
		const ticker = Ticker.shared;
		ticker.add(stats.update, stats, UPDATE_PRIORITY.UTILITY);
	}, []);

	return <></>;
};

export default Stats;
