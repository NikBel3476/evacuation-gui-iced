import React from 'react';
import { useApp } from '@pixi/react';
import * as PIXI from 'pixi.js';

const PixiApp = () => {
	const app = useApp();
	const graphics = new PIXI.Graphics();
	graphics.clear();
	graphics.beginFill(0x000000);
	graphics.drawRect(50, 50, 100, 100);
	graphics.endFill();
	graphics.interactive = true;
	graphics.cursor = 'pointer';
	graphics.onclick = () => console.log('click');

	const container = new PIXI.Container();
	container.addChild(graphics);

	app.stage.addChild(container);

	return <></>;
};

export default PixiApp;
