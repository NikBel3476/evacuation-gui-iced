import React, { FC, MouseEventHandler } from 'react';

interface ButtonProps {
	className?: string;
	children: React.ReactNode;
	onClick: MouseEventHandler;
}

const Button: FC<ButtonProps> = ({ className, children, onClick }) => {
	return (
		<button
			className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
			onClick={onClick}
		>
			{children}
		</button>
	);
};

export default Button;
