import React, { FC, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import cn from 'classnames';

interface FileDropZoneProps {
	className?: string;
	onFilesAccepted: (files: File[]) => void;
}

const FileDropZone: FC<FileDropZoneProps> = ({ className, onFilesAccepted }) => {
	const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

	useEffect(() => {
		onFilesAccepted(acceptedFiles);
	}, [acceptedFiles, onFilesAccepted]);

	return (
		<div
			{...getRootProps({
				className: cn(
					'dropzone h-24 mt-4 flex justify-center items-center font-medium text-lg border-2 border-gray-500 rounded-md border-dashed hover:cursor-pointer',
					className
				)
			})}
		>
			<input {...getInputProps()} />
			<p className="text-center">Перетащите файлы сюда или нажмите, чтобы выбрать</p>
		</div>
	);
};

export default FileDropZone;
