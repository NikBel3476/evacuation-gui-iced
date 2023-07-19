import React, { ChangeEvent, FC } from 'react';
import { useAppSelector } from '../../../hooks/redux';
import { Link } from 'react-router-dom';
import Select from '../../Select';

interface FloorInfoProps {
	className?: string;
	fileList: string[];
	onSelectChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const FloorInfo: FC<FloorInfoProps> = ({ className, fileList, onSelectChange }) => {
	const { currentLevel, buildingElement } = useAppSelector(
		state => state.buildingViewReducer
	);

	return (
		<aside
			className={
				'p-4 bg-sky-400 grid grid-cols-1 gap-y-2 content-start' +
					' ' +
					String(className) ?? ''
			}
		>
			<Link
				className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				to="/"
			>
				Main page
			</Link>
			<Select
				className="text-black"
				options={fileList.map(file => ({ key: file, value: file }))}
				onChange={onSelectChange}
			/>
			<p className="text-lg">Этаж: {currentLevel}</p>
			<h2 className="text-xl">Данные о помещении</h2>
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
