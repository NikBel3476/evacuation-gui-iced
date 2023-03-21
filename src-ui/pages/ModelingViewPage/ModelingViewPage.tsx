import React, { useCallback, useEffect, useState } from 'react';
import { Container, Graphics, Stage } from '@pixi/react';
import { Graphics as PixiGraphics } from '@pixi/graphics';
import buildingData from '../../peopleTraffic/udsu_b1_L4_v2_190701.json';
import { View } from '../../BuildingView2D/application/view/View';

const ModelingViewPage = () => {
	const [scale, setScale] = useState<number>(5);

	useEffect(() => {}, []);

	const draw = useCallback((g: PixiGraphics) => {
		g.clear();
		// g.beginFill(0xff3300);
		// g.lineStyle(4, 0xffd900, 1);
		// g.moveTo(50, 50);
		// g.lineTo(250, 50);
		// g.lineTo(100, 100);
		// g.lineTo(50, 50);
		// g.endFill();
		// g.lineStyle(2, 0x0000ff, 1);
		// g.beginFill(0xff700b, 1);
		// g.drawRect(50, 150, 120, 120);
		// g.lineStyle(2, 0xff00ff, 1);
		// g.beginFill(0xff00bb, 0.25);
		// g.drawRoundedRect(150, 100, 300, 100, 15);
		// g.endFill();
		// g.lineStyle(0);
		// g.beginFill(0xffff0b, 0.5);
		// g.drawCircle(470, 90, 60);
		// g.endFill();
		View.drawBuildingRoomsPixi(g, buildingData.Level[0].BuildElement);
	}, []);

	return (
		<Stage id="canvas" options={{ backgroundColor: 0xffffff }}>
			<Container scale={scale}>
				<Graphics draw={draw} />
			</Container>
		</Stage>
	);
};

export default ModelingViewPage;
