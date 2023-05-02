import React, { ChangeEventHandler, FC, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getConfig } from '../../store/actionCreators/getConfig';
import { changeLoggerFile } from '../../store/slices/ConfigSlice';
import Select from '../../components/Select';

const ConfigurationPage: FC = () => {
	const dispatch = useAppDispatch();
	const { config, isLoading, error } = useAppSelector(state => state.configReducer);

	useEffect(() => {
		void dispatch(getConfig());
	}, [dispatch]);

	const handleLoggerFilenameInputChange: ChangeEventHandler<HTMLInputElement> = e => {
		dispatch(changeLoggerFile(e.target.value));
	};

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
			<button className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 ml-5 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
				Save
			</button>
			{isLoading && <h3>Configuration is loading...</h3>}
			{error && <h3>{error}</h3>}
			{config !== null && (
				<div className="ml-5">
					<section className="mt-5">
						<label htmlFor="bim_filenames" className="text-2xl">
							Файлы цифровых моделей зданий
						</label>
						<Select options={config.files} />
					</section>
					<section className="mt-5">
						<label htmlFor="logger_filename" className="text-2xl">
							Файл конфигурации логирования
						</label>
						<input
							value={config.logger_config}
							onChange={handleLoggerFilenameInputChange}
							type="text"
							name="logger_filename"
							id="logger_filename"
							autoComplete="on"
							className="mt-2 block rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
						/>
					</section>
					<section className="mt-5">
						<h2 className="text-2xl">Параметры распределения</h2>
						<div className="mt-2">
							<label htmlFor="distribution_type">Тип:</label>
							<input
								value={config.distribution.distribution_type}
								onChange={() => {}}
								placeholder="distribution_type"
								type="text"
								name="distribution_type"
								id="distribution_type"
								autoComplete="on"
								className="ml-1 px-2 py-0.5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							/>
						</div>
						<div className="mt-2">
							<label>Плотность:</label>
							<input
								value={config.distribution.density}
								onChange={() => {}}
								placeholder="distribution_density"
								type="text"
								name="distribution_density"
								id="distribution_density"
								autoComplete="on"
								className="ml-1 px-2 py-0.5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							/>
						</div>
						<div>
							<p>Специальные зоны:</p>
							<ul className="ml-4 list-decimal list-outside">
								{config.distribution.special.map(special => (
									<li key={special.uuid.toString()}>
										<div>
											<label
												htmlFor="distribution_special_density"
												className="inline-block"
											>
												Плотность:
											</label>
											<input
												value={special.density}
												onChange={() => {}}
												placeholder="distribution_special_density"
												type="text"
												name="distribution_special_density"
												id="distribution_special_density"
												autoComplete="on"
												className="ml-1 px-2 py-0.5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
											/>
										</div>
										<div className="mt-2">
											<label htmlFor="zones_special">Зоны:</label>
											<select
												className="ml-1 p-1 rounded-md border-0 border-transparent outline-none shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-600"
												id="zones_special"
											>
												{special.uuid.map(uuid => (
													<option key={uuid} value={uuid}>
														{special.uuid}
													</option>
												))}
											</select>
										</div>
										<div className="mt-2">
											<label htmlFor="distribution_special_comment">Комментарий:</label>
											<input
												value={special.comment}
												onChange={() => {}}
												placeholder="distribution_special_comment"
												type="text"
												name="distribution_special_comment"
												id="distribution_special_comment"
												autoComplete="on"
												className="ml-1 px-2 py-0.5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
											/>
										</div>
									</li>
								))}
							</ul>
						</div>
					</section>
					<section className="mt-5">
						<h2 className="text-2xl">Параметры переходов</h2>
						<div className="mt-2">
							<label htmlFor="transition_type">Тип:</label>
							<input
								value={config.transition.transitions_type}
								onChange={() => {}}
								placeholder="transition_type"
								type="text"
								name="transition_type"
								id="transition_type"
								autoComplete="on"
								className="ml-1 px-2 py-0.5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							/>
						</div>
						<div className="mt-2">
							<label htmlFor="transition_doorway_in">Doorway in:</label>
							<input
								value={config.transition.doorway_in}
								onChange={() => {}}
								placeholder="transition_doorway_in"
								type="text"
								name="transition_doorway_in"
								id="transition_doorway_in"
								autoComplete="on"
								className="ml-1 px-2 py-0.5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							/>
						</div>
						<div className="mt-2">
							<label htmlFor="transition_doorway_out">Doorway out:</label>
							<input
								value={config.transition.doorway_out}
								onChange={() => {}}
								placeholder="transition_doorway_out"
								type="text"
								name="transition_doorway_out"
								id="transition_doorway_out"
								autoComplete="on"
								className="ml-1 px-2 py-0.5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							/>
						</div>
						<div className="mt-2">
							<ul className="ml-4 list-decimal list-outside">
								{config.transition.special.map(special => (
									<li key={special.uuid.toString()}>
										<div>
											<label
												htmlFor="distribution_special_width"
												className="inline-block"
											>
												Плотность:
											</label>
											<input
												value={special.width}
												onChange={() => {}}
												placeholder="distribution_special_width"
												type="text"
												name="distribution_special_width"
												id="distribution_special_width"
												autoComplete="on"
												className="ml-1 px-2 py-0.5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
											/>
										</div>
										<div className="mt-2">
											<label htmlFor="transitions_special">Переходы:</label>
											<select
												className="ml-1 p-1 rounded-md border-0 border-transparent outline-none shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-600"
												id="transitions_special"
											>
												{special.uuid.map(uuid => (
													<option key={uuid} value={uuid}>
														{special.uuid}
													</option>
												))}
											</select>
										</div>
										<div className="mt-2">
											<label htmlFor="transition_special_comment">Комментарий:</label>
											<input
												value={special.comment}
												onChange={() => {}}
												placeholder="transition_special_comment"
												type="text"
												name="transition_special_comment"
												id="transition_special_comment"
												autoComplete="on"
												className="ml-1 px-2 py-0.5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
											/>
										</div>
									</li>
								))}
							</ul>
						</div>
					</section>
					<section className="mt-5">
						<h2 className="text-2xl">Параметры моделирования</h2>
						<div className="mt-2">
							<label htmlFor="modeling_step">Шаг:</label>
							<input
								value={config.modeling.step}
								onChange={() => {}}
								placeholder="modeling_step"
								type="text"
								name="modeling_step"
								id="modeling_step"
								autoComplete="on"
								className="ml-1 px-2 py-0.5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							/>
						</div>
						<div className="mt-2">
							<label htmlFor="max_speed">Максимальная скорость:</label>
							<input
								value={config.modeling.max_speed}
								onChange={() => {}}
								placeholder="max_speed"
								type="text"
								name="max_speed"
								id="max_speed"
								autoComplete="on"
								className="ml-1 px-2 py-0.5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							/>
						</div>
						<div className="mt-2">
							<label htmlFor="max_density">Максимальная плотность:</label>
							<input
								value={config.modeling.max_density}
								onChange={() => {}}
								placeholder="max_density"
								type="text"
								name="max_density"
								id="max_density"
								autoComplete="on"
								className="ml-1 px-2 py-0.5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							/>
						</div>
						<div className="mt-2">
							<label htmlFor="min_density">Минимальная плотность:</label>
							<input
								value={config.modeling.min_density}
								onChange={() => {}}
								placeholder="min_density"
								type="text"
								name="min_density"
								id="min_density"
								autoComplete="on"
								className="ml-1 px-2 py-0.5 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
							/>
						</div>
					</section>
				</div>
			)}
		</main>
	);
};

export default ConfigurationPage;
