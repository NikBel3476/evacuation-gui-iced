import { invoke } from '@tauri-apps/api';

enum DistributionType {
	FromBim,
	Users
}

enum TransitionType {
	FromBim,
	Users
}

type ScenarioCfg = {
	files: string[];
	logger_config: string;
	distribution: {
		distribution_type: DistributionType;
		density: number;
		special: {
			uuid: string[];
			density: number;
			comment: string;
		}[];
	};
	transition: {
		transitions_type: TransitionType;
		doorway_in: number;
		doorway_out: number;
		special: {
			uuid: string[];
			width: number;
			comment: string;
		}[];
	};
	modeling: {
		step: number;
		max_speed: number;
		max_density: number;
		min_density: number;
	};
};

document.getElementById('start-btn')!.addEventListener('click', async _ => {
	try {
		let config = await invoke<ScenarioCfg>('read_config');

		document.querySelector<HTMLOListElement>('.config__bim-files')!.innerHTML =
			config.files.reduce(
				(filenameElements, pathToFile) => filenameElements.concat(`<li>${pathToFile}</li>`),
				''
			);

		document.querySelector<HTMLParagraphElement>('.config__logfile-path')!.innerText =
			config.logger_config;

		document.querySelector<HTMLParagraphElement>(
			'.distribution-type'
		)!.innerText = `Тип: ${config.distribution.distribution_type}`;

		document.querySelector<HTMLParagraphElement>(
			'.distribution-density'
		)!.innerText = `Плотность: ${config.distribution.density}`;

		document.querySelector<HTMLUListElement>('.distribution-special')!.innerHTML =
			config.distribution.special.reduce(
				(specialElements, special) =>
					specialElements.concat(
						`<li>
							<ol>
								${special.uuid.reduce((uuidElements, uuid) => uuidElements.concat(`<li>${uuid}</li>`), '')}
							</ol>
							<p>Плотность: ${special.density}</p>
							<p>Комментарий: ${special.comment}</p>
						</li>`
					),
				''
			);

		document.querySelector<HTMLParagraphElement>(
			'.transitions-type'
		)!.innerText = `Тип: ${config.transition.transitions_type}`;

		document.querySelector<HTMLParagraphElement>(
			'.transitions-doorway-in'
		)!.innerText = `Doorway in: ${config.transition.doorway_in}`;

		document.querySelector<HTMLParagraphElement>(
			'.transitions-doorway-out'
		)!.innerText = `Doorway out: ${config.transition.doorway_out}`;

		document.querySelector<HTMLUListElement>('.transitions-special')!.innerHTML =
			config.transition.special.reduce(
				(specialElements, special) =>
					specialElements.concat(`
					<li>
						<ol>
							${special.uuid.reduce((uuidElements, uuid) => uuidElements.concat(`<li>${uuid}</li>`), '')}
						</ol>
						<p>Ширина: ${special.width}</p>
						<p>Комментарий: ${special.comment}</p>
					</li>
				`),
				''
			);

		document.querySelector<HTMLParagraphElement>(
			'.modeling-step'
		)!.innerText = `Шаг: ${config.modeling.step}`;

		document.querySelector<HTMLParagraphElement>(
			'.modeling-max-speed'
		)!.innerText = `Максимальная скорость: ${config.modeling.max_speed}`;

		document.querySelector<HTMLParagraphElement>(
			'.modeling-max-density'
		)!.innerText = `Максимальная плотность: ${config.modeling.max_density}`;

		document.querySelector<HTMLParagraphElement>(
			'.modeling-min-density'
		)!.innerText = `Минимальная плотность: ${config.modeling.min_density}`;

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
