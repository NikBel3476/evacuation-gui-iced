import React, { FC } from 'react';
import { useAppSelector } from '../../../hooks/redux';

const FloorInfo: FC = () => {
	const { buildingElement } = useAppSelector(state => state.floorReducer);

	return (
		<aside className="p-4 bg-sky-400 grid grid-cols-1 gap-y-4 content-start">
			<h1 className="text-4xl">Данные</h1>
			<p>
				<span className="block">Уровень этажа:</span>
				<span>{buildingElement?.level}</span>
			</p>
			<p>
				<span className="block">Тип:</span>
				<span>{buildingElement?.type}</span>
			</p>
			<p>
				<span className="block">Название:</span>
				<span>{buildingElement?.name}</span>
			</p>
			<p>
				<span className="block">ID:</span>
				<span>{buildingElement?.id}</span>
			</p>
			<p>
				<span className="block">Количество людей:</span>
				<span>{buildingElement?.numberOfPeople}</span>
			</p>
			<p>
				<span className="block">Площадь:</span>
				{buildingElement !== null && <span>{buildingElement.area} м^2</span>}
			</p>
		</aside>
	);
};

export default FloorInfo;
