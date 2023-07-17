import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { bimFiles } from '../../consts/bimFiles';
import Select from '../../components/Select';
import { runEvacuationModeling } from '../../rustCalls';

const ModelingPage = () => {
	const [filePath, setFilePath] = useState<string>(Object.keys(bimFiles)[0]);
	const handleSelectFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const filePath = e.target.value;
		setFilePath(filePath);
	};

	const handleRunEvacuationModelingButton = async (
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		const modelingResult = await runEvacuationModeling(filePath);
		console.log(modelingResult);
	};

	return (
		<main>
			<h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
				Страница моделирования
			</h1>
			<Link
				className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 ml-5 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				to="/"
			>
				Main page
			</Link>
			<Select
				className="text-black"
				options={Object.keys(bimFiles)}
				onChange={handleSelectFileChange}
			/>
			<button
				className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 ml-5 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				onClick={handleRunEvacuationModelingButton}
			>
				Старт
			</button>
		</main>
	);
};

export default ModelingPage;
