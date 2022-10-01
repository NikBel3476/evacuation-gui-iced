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

(document.getElementById('start-btn') as HTMLElement).addEventListener('click', async _ => {
	try {
		let config = (await invoke('read_config')) as ScenarioCfg;
		(document.querySelector('.config__bim-files') as HTMLElement).innerHTML =
			config.files.reduce(
				(filenameElements, pathToFile) => filenameElements.concat(`<li>${pathToFile}</li>`),
				''
			);

		(document.querySelector('.config__logfile-path') as HTMLParagraphElement).innerText =
			config.logger_config;

		(
			document.querySelector('.distribution-type') as HTMLParagraphElement
		).innerText = `Тип: ${config.distribution.distribution_type}`;

		(
			document.querySelector('.distribution-density') as HTMLParagraphElement
		).innerText = `Плотность: ${config.distribution.density}`;

		(document.querySelector('.distribution-special') as HTMLUListElement).innerHTML =
			config.distribution.special.reduce<string>(
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

		(
			document.querySelector('.transitions-type') as HTMLParagraphElement
		).innerText = `Тип: ${config.transition.transitions_type}`;

		(
			document.querySelector('.transitions-doorway-in') as HTMLParagraphElement
		).innerText = `Doorway in: ${config.transition.doorway_in}`;

		(
			document.querySelector('.transitions-doorway-out') as HTMLParagraphElement
		).innerText = `Doorway out: ${config.transition.doorway_out}`;

		(document.querySelector('.transitions-special') as HTMLUListElement).innerHTML =
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

		(
			document.querySelector('.modeling-step') as HTMLParagraphElement
		).innerText = `Шаг: ${config.modeling.step}`;

		(
			document.querySelector('.modeling-max-speed') as HTMLParagraphElement
		).innerText = `Максимальная скорость: ${config.modeling.max_speed}`;

		(
			document.querySelector('.modeling-max-density') as HTMLParagraphElement
		).innerText = `Максимальная плотность: ${config.modeling.max_density}`;

		(
			document.querySelector('.modeling-min-density') as HTMLParagraphElement
		).innerText = `Минимальная плотность: ${config.modeling.min_density}`;

		(document.querySelector('.config-error') as HTMLElement).style.display = 'none';
		(document.querySelector('.config') as HTMLDivElement).style.display = 'block';
	} catch (errorMessage) {
		(document.querySelector('.config') as HTMLElement).style.display = 'none';
		(document.querySelector('.config-error') as HTMLElement).innerHTML = `
			<p>
				${typeof errorMessage === 'string' ? errorMessage : 'Произошла неизвестная ошибка'}
			</p>
		`;
	}
});
