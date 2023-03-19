import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';

interface RouterLinkProps {
	className?: string;
	to: string;
	children: React.ReactNode;
}

const RouterLink: FC<RouterLinkProps> = ({ className, to, children }) => {
	return (
		<Link
			className={cn(
				className,
				'inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
			)}
			to={to}
		>
			{children}
		</Link>
	);
};

export default RouterLink;
