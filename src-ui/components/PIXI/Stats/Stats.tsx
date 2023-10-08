import React, { useEffect } from 'react';
import { addStats } from 'pixi-stats';
import { Ticker, UPDATE_PRIORITY } from 'pixi.js';
import { useApp } from '@pixi/react';
import * as PIXI from 'pixi.js';

const Stats = () => {
	const pixiApp = useApp();

	useEffect(() => {
		const stats = addStats(document, pixiApp);
		const ticker = Ticker.shared;
		ticker.add(stats.update, stats, UPDATE_PRIORITY.UTILITY);
	}, []);

	return <></>;
};

export default Stats;
