import type { FC, MouseEventHandler } from 'react';
import type React from 'react';
import cn from 'classnames';

interface ButtonProps {
	className?: string;
	children: React.ReactNode;
	onClick: MouseEventHandler;
}

const Button: FC<ButtonProps> = ({ className, children, onClick }) => {
	return (
		<button
			className={cn(
				'inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
				className
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
};

export default Button;
