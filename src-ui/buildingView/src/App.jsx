import './App.css';
import dataBuild from './res/building.json';
import React, { useState } from 'react';
import { Layer, Line, Stage } from 'react-konva';

let scale = 50;

const PEOPLE_RADIUS = 1 * scale;

function getPoint(el) {
	let points = el.XY[0].points;
	let arr = [];
	for (let i = 0; i < points.length; i++) {
		arr.push(points[i].x * scale);
		arr.push(points[i].y * scale);
	}
	console.log(arr);
	return arr;
}

function getData() {
	let doors = [];
	let rooms = [];
	let staircase = [];
	let Buiding = dataBuild;
	let Levels = Buiding['Level'];
	for (let i = 0; i < Levels.length; i++) {
		let BuildElement = Buiding['Level'][i].BuildElement;
		for (let j = 0; j < BuildElement.length; j++) {
			if (
				BuildElement[j].Sign === 'DoorWayOut' ||
				BuildElement[j].Sign === 'DoorWay' ||
				BuildElement[j].Sign === 'DoorWayInt'
			) {
				doors.push(BuildElement[j]);
			}
			if (BuildElement[j].Sign === 'Room') {
				rooms.push(BuildElement[j]);
			}
			if (BuildElement[j].Sign === 'Staircase') {
				staircase.push(BuildElement[j]);
			}
		}
	}
	return { rooms: rooms, doors: doors, staircase: staircase };
}

let rs = getData().rooms;
let ds = getData().doors;
let sc = getData().staircase;

function calculateArea(coords) {
	let area = 0;

	for (let i = 0; i < coords.length; i++) {
		const [x1, y1] = [coords[i].x, coords[i].y];
		const [x2, y2] = [
			coords[(i + 1) % coords.length].x,
			coords[(i + 1) % coords.length].y
		];

		console.log(coords[0].x);
		area += x1 * y2 - x2 * y1;
	}

	return Math.abs(area) / 2;
}

function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

function getElementBorderPoints(elem) {
	let points = elem.XY[0].points;
	let borderPoints = {
		xMin: Number.MAX_VALUE,
		xMax: Number.MIN_VALUE,
		yMin: Number.MAX_VALUE,
		yMax: Number.MIN_VALUE
	};

	for (let i = 0; i < points.length; i++) {
		const [x, y] = [points[i].x, points[i].y];
		if (x <= borderPoints.xMin) {
			borderPoints.xMin = x;
		}
		if (x >= borderPoints.xMax) {
			borderPoints.xMax = x;
		}
		if (y <= borderPoints.yMin) {
			borderPoints.yMin = y;
		}
		if (y >= borderPoints.yMax) {
			borderPoints.yMax = y;
		}
	}
	return borderPoints;
}

function getPeoplePointsCircle(borderPoints, numOfPeople) {
	let points = [];
	for (let i = 0; i < numOfPeople; i++) {
		let x = getRandomArbitrary(
			borderPoints.xMin + PEOPLE_RADIUS,
			borderPoints.xMax - PEOPLE_RADIUS
		);
		let y = getRandomArbitrary(
			borderPoints.yMin + PEOPLE_RADIUS,
			borderPoints.yMax - PEOPLE_RADIUS
		);
		points.push([x, y]);
	}
	return points;
}

function viewPeople(elem) {
	const borderPoints = getElementBorderPoints(elem);
	const points = getPeoplePointsCircle(borderPoints, elem.NumPeople);
	let center = [...Array(points.length)].map((_, i) => ({
		x: points[i].x,
		y: points[i].y
	}));
	return center;
}

function App() {
	function getElement(elem) {
		let div = document.querySelector('.elemInfo');
		//let Points = getPoint(elem);
		//console.log(Points);
		let area = calculateArea(elem.XY[0].points);
		console.log(area);
		div.innerHTML = ` id: ${elem.Id}  <br> sign: ${elem.Sign} <br> Area: ${area}`;
		console.log(div);
	}

	const [scale, setState] = useState({
		stageScale: 1,
		stageX: 0,
		stageY: 0
	});

	const handleWheel = e => {
		e.evt.preventDefault();

		const scaleBy = 1.05;
		const stage = e.target.getStage();
		const oldScale = stage.scaleX();
		const mousePointTo = {
			x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
			y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
		};

		const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

		stage.scale({ x: newScale, y: newScale });

		const windowCenter = {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2
		};
		setState({
			stageScale: newScale,
			stageX: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
			stageY: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
		});
	};

	const [elements, setBorder] = useState({
		id: null,
		color: 'red',
		isClicked: false
	});

	const handleClickedIn = e => {
		const id = e.target.id();
		setBorder(
			elements.map(elem => {
				return {
					...elem,
					isDragging: elem.id === id
				};
			})
		);
	};
	const handleClickedOut = e => {
		setBorder(
			elements.map(elem => {
				return {
					...elem,
					isDragging: false
				};
			})
		);
	};

	return (
		<>
			<div className="elemInfo">sdf</div>
			<Stage
				width={window.innerWidth}
				height={window.innerHeight}
				draggable
				onWheel={handleWheel}
				scaleX={scale.stageScale}
				scaleY={scale.stageScale}
				x={scale.stageX}
				y={scale.stageY}
			>
				<Layer>
					{rs.map(room => (
						<Line
							key={room.Id}
							id={room.Id}
							onClick={() => {
								getElement(room);
							}}
							x={window.innerWidth / 2}
							y={window.innerHeight / 2}
							points={getPoint(room)}
							closed
							stroke="black"
							fill="grey"
						/>
					))}
				</Layer>
				<Layer>
					{ds.map(door => (
						<Line
							key={door.Id}
							onClick={() => {
								getElement(door);
							}}
							x={window.innerWidth / 2}
							y={window.innerHeight / 2}
							points={getPoint(door)}
							closed
							stroke="black"
							fill="#89b717"
							opacity={0.8}
						/>
					))}
				</Layer>
				<Layer>
					{rs.map(
						room => console.log()
						//   for (;;) {
						//     <Circle
						//   x={200}
						//   y={100}
						//   radius={50}
						//   fill="green" />
						// }
					)}
				</Layer>
			</Stage>
		</>
	);
}

export default App;
