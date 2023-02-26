import React, { FC, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getConfig } from '../../store/actionCreators/getConfig';

const ConfigurationPage: FC = () => {
	const dispatch = useAppDispatch();
	const { config, isLoading, error } = useAppSelector(state => state.configReducer);

	useEffect(() => {
		void dispatch(getConfig());
	}, []);

	return (
		<main className="pb-5">
			<h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
				Configuration page
			</h1>
			<Link
				className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 ml-5 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				to="/"
			>
				Main page
			</Link>
			{isLoading && <h3>Configuration is loading...</h3>}
			{error && <h3>{error}</h3>}
			{config !== null && (
				<div className="ml-5">
					<section className="mt-5">
						<h2 className="text-2xl">Файлы цифровых моделей зданий</h2>
						<ol className="list-decimal list-inside">
							{config.files.map(file => (
								<li key={file}>{file}</li>
							))}
						</ol>
					</section>
					<section className="mt-5">
						<h2 className="text-2xl">Файл конфигурации логирования</h2>
						<p>{config.logger_config}</p>
					</section>
					<section className="mt-5">
						<h2 className="text-2xl">Параметры распределения</h2>
						<p>Тип: {config.distribution.distribution_type}</p>
						<p>Плотность: {config.distribution.density}</p>
						<ul>
							{config.distribution.special.map(special => (
								<li key={special.uuid.toString()}>
									<ol>
										{special.uuid.map(uuid => (
											<li key={uuid}>{uuid}</li>
										))}
									</ol>
									<p>Плотность: {special.density}</p>
									<p>Комментарий: {special.comment}</p>
								</li>
							))}
						</ul>
					</section>
					<section className="mt-5">
						<h2 className="text-2xl">Параметры переходов</h2>
						<p>Тип: {config.transition.transitions_type}</p>
						<p>Doorway in: {config.transition.doorway_in}</p>
						<p>Doorway out: {config.transition.doorway_out}</p>
						<ol>
							{config.transition.special.map(special => (
								<li key={special.uuid.toString()}>
									<ol>
										{special.uuid.map(uuid => (
											<li key={uuid}>{uuid}</li>
										))}
									</ol>
									<p>Ширина: {special.width}</p>
									<p>Комментарий: {special.comment}</p>
								</li>
							))}
						</ol>
					</section>
					<section className="mt-5">
						<h2 className="text-2xl">Параметры моделирования</h2>
						<p>Шаг: {config.modeling.step}</p>
						<p>Максимальная скорость: {config.modeling.max_speed}</p>
						<p>Максимальная плотность: {config.modeling.max_density}</p>
						<p>Минимальная плотность: {config.modeling.min_density}</p>
					</section>
				</div>
			)}
		</main>
	);
};

export default ConfigurationPage;
