import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Select from '../../components/Select';
import { runEvacuationModeling } from '../../rustCalls';
import { EvacuationModelingResult } from '../../types/ModelingResult';
import ModelingResultWidget from '../../components/ModelingResultWidget';
import { BaseDirectory, FileEntry, readDir } from '@tauri-apps/api/fs';
import { listen, TauriEvent, UnlistenFn } from '@tauri-apps/api/event';
import cn from 'classnames';
import styles from './ModelingPage.module.css';

const ModelingPage = () => {
	const [bimFiles, setBimFiles] = useState<FileEntry[]>([]);
	const [selectedFilePath, setSelectedFilePath] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isFileDropHover, setIsFileDropHover] = useState<boolean>(false);
	const [evacuationModelingResult, setEvacuationModelingResult] =
		useState<EvacuationModelingResult | null>(null);

	useEffect(() => {
		let unlistenWindowFileDrop: UnlistenFn | null = null;
		let unlistenWindowFileDropHover: UnlistenFn | null = null;
		let unlistenWindowFileDropCancelled: UnlistenFn | null = null;

		void (async () => {
			unlistenWindowFileDrop = await listen<string>(
				TauriEvent.WINDOW_FILE_DROP,
				event => {
					console.log(event);
				}
			);

			unlistenWindowFileDropHover = await listen<string>(
				TauriEvent.WINDOW_FILE_DROP_HOVER,
				event => {
					setIsFileDropHover(true);
					console.log(event);
				}
			);

			unlistenWindowFileDropCancelled = await listen<string>(
				TauriEvent.WINDOW_FILE_DROP_CANCELLED,
				event => {
					setIsFileDropHover(false);
					console.log(event);
				}
			);
		})();

		void loadFiles();
		return () => {
			if (unlistenWindowFileDrop) {
				unlistenWindowFileDrop();
			}
			if (unlistenWindowFileDropHover) {
				unlistenWindowFileDropHover();
			}
			if (unlistenWindowFileDropCancelled) {
				unlistenWindowFileDropCancelled();
			}
		};
	}, []);

	const loadFiles = async () => {
		const files = await readDir('resources', { dir: BaseDirectory.AppData });
		setBimFiles(files);
		if (files.length > 0) {
			setSelectedFilePath(files[0].path);
		}
	};

	const handleSelectFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const filePath = e.target.value;
		setSelectedFilePath(filePath);
	};

	const handleRunEvacuationModelingButton = async (
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		setIsLoading(true);
		const modelingResult = await runEvacuationModeling(selectedFilePath);
		setIsLoading(false);
		setEvacuationModelingResult(modelingResult);
	};

	return (
		<>
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
					<div className="mt-2">
						{isLoading ? (
							<p>Loading...</p>
						) : (
							evacuationModelingResult && (
								<ModelingResultWidget modelingResult={evacuationModelingResult} />
							)
						)}
					</div>
				</section>
			</main>
			<div
				className={cn(
					styles.dropZone,
					'absolute inset-0 w-screen h-screen flex justify-center items-center bg-gray-300 bg-opacity-50 border-8 border-gray-500 border-dashed',
					isFileDropHover ? 'visible opacity-100' : 'invisible opacity-0'
				)}
			>
				<p className="text-center text-gray-500 font-medium text-5xl">Добавить файлы</p>
			</div>
		</>
	);
};

export default ModelingPage;
