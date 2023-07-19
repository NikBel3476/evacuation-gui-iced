import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Select from '../../components/Select';
import { runEvacuationModeling } from '../../rustCalls';
import { EvacuationModelingResult } from '../../types/ModelingResult';
import ModelingResultWidget from '../../components/ModelingResultWidget';
import { useDropzone } from 'react-dropzone';
import { BaseDirectory, FileEntry, readDir } from '@tauri-apps/api/fs';

const ModelingPage = () => {
	const [bimFiles, setBimFiles] = useState<FileEntry[]>([]);
	const [selectedFilePath, setSelectedFilePath] = useState<string>('');
	const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
	const [evacuationModelingResult, setEvacuationModelingResult] =
		useState<EvacuationModelingResult | null>(null);
	const handleSelectFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const filePath = e.target.value;
		setSelectedFilePath(filePath);
	};

	const loadFiles = async () => {
		const files = await readDir('resources', { dir: BaseDirectory.AppData });
		setBimFiles(files);
		if (files.length > 0) {
			setSelectedFilePath(files[0].path);
		}
	};

	useEffect(() => {
		void loadFiles();
	}, []);

	useEffect(() => {
		console.log(acceptedFiles);
	}, [acceptedFiles]);

	const handleRunEvacuationModelingButton = async (
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		const modelingResult = await runEvacuationModeling(selectedFilePath);
		setEvacuationModelingResult(modelingResult);
	};

	useEffect(() => {
		console.log(acceptedFiles);
	}, [acceptedFiles]);

	return (
		<main>
			<h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
				Страница моделирования
			</h1>
			<section className="mt-6 mx-5">
				<Link
					className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					to="/"
				>
					На главную страницу
				</Link>
				<div
					{...getRootProps({
						className:
							'dropzone h-24 mt-4 flex justify-center items-center font-medium text-lg border-2 border-gray-500 rounded-md border-dashed hover:cursor-pointer'
					})}
				>
					<input {...getInputProps()} />
					<p className="text-center">Перетащите файлы сюда или нажмите, чтобы выбрать</p>
				</div>
				<Select
					className="text-black mt-4"
					options={bimFiles.map(file => ({
						key: file.name ?? 'Undefined name',
						value: file.path
					}))}
					onChange={handleSelectFileChange}
				/>
				<button
					className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 mt-4 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
					onClick={handleRunEvacuationModelingButton}
					disabled={selectedFilePath === ''}
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
