import React, {
	FC,
	MouseEventHandler,
	useEffect,
	useRef,
	WheelEventHandler
} from 'react';
import { App } from '../../../BuildingView2D/application/app';
import { useAppDispatch } from '../../../hooks/redux';
import { setBuildingElement } from '../../../store/slices/BuildingViewSlice';

const BuildingView: FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const dispatch = useAppDispatch();
	let app: App | null = null;

	useEffect(() => {
		app = new App();
		app.startRendering();
		document.addEventListener('keydown', handleDocumentKeydown);
		return () => {
			document.removeEventListener('keydown', handleDocumentKeydown);
			app?.stopRendering();
		};
	}, []);

	const handleDocumentKeydown = (event: KeyboardEvent) => {
		if (app) {
			switch (event.keyCode) {
				// Повысить этаж
				case 38:
					app.data.level += app.data.level + 1 < app.data.struct.Level.length ? 1 : 0;
					break;
				// Понизить этаж
				case 40:
					app.data.level -= app.data.level - 1 >= 0 ? 1 : 0;
					break;
				// Увеличить zoom
				case 107:
					break;
				case 187:
					app.data.scale++;
					break;
				// Уменьшить zoom
				case 189:
				case 109:
					app.data.scale--;
					break;
			}
			app.logic.updateBuildsInCamera();
			app.logic.updatePeopleInCamera();
		}
	};

	const handleCanvasDoubleClick: MouseEventHandler<HTMLCanvasElement> = event => {
		app?.logic.toChoiceBuild(event);
		if (app?.data.choiceBuild) {
			dispatch(
				setBuildingElement({
					id: app.data.choiceBuild.Id,
					area: Math.floor(app.mathem.calculateBuildArea(app.data.choiceBuild)),
					name: app.data.choiceBuild.Name,
					type: app.data.choiceBuild.Sign,
					level: app.data.struct.Level[app.data.level].ZLevel,
					numberOfPeople: app.ui.getPeopleCountInChoiceRoom()
				})
			);
		}
	};

	const handleCanvasWheel: WheelEventHandler<HTMLCanvasElement> = event => {
		if (app) {
			switch (Math.sign(event.deltaY)) {
				case -1: // Увеличить zoom
					app.data.scale += 0.5;
					break;
				case +1: // Уменьшить zoom
					app.data.scale -= 0.5;
					break;
			}
			app.logic.updateBuildsInCamera();
			app.logic.updatePeopleInCamera();
		}
	};

	const handleCanvasMouseDown: MouseEventHandler<HTMLCanvasElement> = _ => {
		if (app) {
			app.data.canMove = true;
		}
	};

	const handleCanvasMouseUp: MouseEventHandler<HTMLCanvasElement> = _ => {
		if (app) {
			app.data.canMove = false;
		}
	};

	const handleCanvasMouseOut: MouseEventHandler<HTMLCanvasElement> = _ => {
		if (app) {
			app.data.canMove = false;
		}
	};

	const handleCanvasMouseMove: MouseEventHandler<HTMLCanvasElement> = event => {
		if (app?.data.canMove === true) {
			app.logic.mouseMove(event);
		}
	};

	return (
		<section>
			<div className="w-full h-full" id="canvas_container">
				<canvas
					ref={canvasRef}
					id="field"
					onDoubleClick={handleCanvasDoubleClick}
					onWheel={handleCanvasWheel}
					onMouseDown={handleCanvasMouseDown}
					onMouseUp={handleCanvasMouseUp}
					onMouseOut={handleCanvasMouseOut}
					onMouseMove={handleCanvasMouseMove}
				></canvas>
			</div>
		</section>
	);
};

export default BuildingView;
