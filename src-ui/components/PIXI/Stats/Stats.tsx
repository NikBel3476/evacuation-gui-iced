import React, { useEffect } from 'react';
import { addStats } from 'pixi-stats';
import { Ticker, UPDATE_PRIORITY } from 'pixi.js';
import { useApp } from '@pixi/react';

const Stats = () => {
	const pixiApp = useApp();

	useEffect(() => {
		const stats = addStats(document, pixiApp);
		const ticker = Ticker.shared;
		const updateCb = stats.update;
		ticker.add(updateCb, stats, UPDATE_PRIORITY.UTILITY);
		return () => {
			document.getElementById('stats')?.remove();
			ticker.remove(updateCb);
		};
	}, [pixiApp]);

	return <></>;
};

export default Stats;
