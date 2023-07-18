import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { bimFiles } from '../../consts/bimFiles';
import Select from '../../components/Select';
import { runEvacuationModeling } from '../../rustCalls';
import { EvacuationModelingResult } from '../../types/ModelingResult';
import ModelingResultWidget from '../../components/ModelingResultWidget';

const ModelingPage = () => {
	const [filePath, setFilePath] = useState<string>(Object.keys(bimFiles)[0]);
	const [evacuationModelingResult, setEvacuationModelingResult] =
		useState<EvacuationModelingResult | null>(null);
	const handleSelectFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const filePath = e.target.value;
		setFilePath(filePath);
	};

	const handleRunEvacuationModelingButton = async (
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		const modelingResult = await runEvacuationModeling(filePath);
		setEvacuationModelingResult(modelingResult);
	};

	return (
		<main>
			<h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
				Страница моделирования
			</h1>
			<section className="ml-5">
				<Link
					className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
					className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 mt-2 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					onClick={handleRunEvacuationModelingButton}
				>
					Старт
				</button>
				{evacuationModelingResult && (
					<ModelingResultWidget
						className="mt-2"
						modelingResult={evacuationModelingResult}
					/>
				)}
			</section>
		</main>
	);
};

export default ModelingPage;
