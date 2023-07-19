import React, { ChangeEvent, FC } from 'react';
import cn from 'classnames';

interface SelectProps {
	className?: string;
	options: Array<{ key: string; value: string }>;
	onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const Select: FC<SelectProps> = ({ className, options, onChange }) => {
	return (
		<select
			className={cn(
				className,
				'mt-2 p-1 block rounded-md border-0 border-transparent outline-none shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-600'
			)}
			id="bim_filenames"
			onChange={onChange}
		>
			{options.map(option => (
				<option key={option.key} value={option.value}>
					{option.key}
				</option>
			))}
		</select>
	);
};

export default Select;
