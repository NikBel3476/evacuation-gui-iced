import { invoke } from '@tauri-apps/api';
import { ScenarioConfiguration } from '../types/ScenarioConfiguration';

document.getElementById('start-btn')!.addEventListener('click', async _ => {
	try {
		const config = await invoke<ScenarioConfiguration>('read_config');

		document.querySelector<HTMLOListElement>('.config__bim-files')!.innerHTML =
			config.bimFiles.reduce(
				(filenameElements, pathToFile) =>
					filenameElements.concat(`<li>${pathToFile}</li>`),
				''
			);

		document.querySelector<HTMLParagraphElement>('.config__logfile-path')!.innerText =
			config.loggerCfg;

		document.querySelector<HTMLParagraphElement>(
			'.distribution-type'
		)!.innerText = `Тип: ${config.distribution.type}`;

		document.querySelector<HTMLParagraphElement>(
			'.distribution-density'
		)!.innerText = `Плотность: ${config.distribution.density}`;

		document.querySelector<HTMLUListElement>('.distribution-special')!.innerHTML =
			config.distribution.special.reduce(
				(specialElements, special) =>
					specialElements.concat(
						`<li>
							<ol>
								${special.uuid.reduce(
									(uuidElements, uuid) => uuidElements.concat(`<li>${uuid}</li>`),
									''
								)}
							</ol>
							<p>Плотность: ${special.density}</p>
							<p>Комментарий: ${special.comment}</p>
						</li>`
					),
				''
			);

		document.querySelector<HTMLParagraphElement>(
			'.transitions-type'
		)!.innerText = `Тип: ${config.transitionParameters.type}`;

		document.querySelector<HTMLParagraphElement>(
			'.transitions-doorway-in'
		)!.innerText = `Doorway in: ${config.transitionParameters.doorwayIn}`;

		document.querySelector<HTMLParagraphElement>(
			'.transitions-doorway-out'
		)!.innerText = `Doorway out: ${config.transitionParameters.doorwayOut}`;

		document.querySelector<HTMLUListElement>('.transitions-special')!.innerHTML =
			config.transitionParameters.special.reduce(
				(specialElements, special) =>
					specialElements.concat(`
					<li>
						<ol>
							${special.uuid.reduce(
								(uuidElements, uuid) => uuidElements.concat(`<li>${uuid}</li>`),
								''
							)}
						</ol>
						<p>Ширина: ${special.width}</p>
						<p>Комментарий: ${special.comment}</p>
					</li>
				`),
				''
			);

		document.querySelector<HTMLParagraphElement>(
			'.modeling-step'
		)!.innerText = `Шаг: ${config.modelingParameters.step}`;

		document.querySelector<HTMLParagraphElement>(
			'.modeling-max-speed'
		)!.innerText = `Максимальная скорость: ${config.modelingParameters.maxSpeed}`;

		document.querySelector<HTMLParagraphElement>(
			'.modeling-max-density'
		)!.innerText = `Максимальная плотность: ${config.modelingParameters.maxDensity}`;

		document.querySelector<HTMLParagraphElement>(
			'.modeling-min-density'
		)!.innerText = `Минимальная плотность: ${config.modelingParameters.minDensity}`;

		document.querySelector<HTMLElement>('.config-error')!.style.display = 'none';
		document.querySelector<HTMLDivElement>('.config')!.style.display = 'block';
	} catch (errorMessage) {
		document.querySelector<HTMLElement>('.config')!.style.display = 'none';
		document.querySelector<HTMLElement>('.config-error')!.innerHTML = `
			<p>
				${typeof errorMessage === 'string' ? errorMessage : 'Произошла неизвестная ошибка'}
			</p>
		`;
	}
});
