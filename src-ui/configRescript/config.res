open Webapi.Dom
open Promise

// %%raw(`import { invoke } from '@tauri-apps/api';`)

// TODO: complete binding
@module("@tauri-apps/api") external invoke: (~cmd: string, ~args: {..}=?, unit) => Promise.t<{..}> = "invoke"

let errorHandler = (errorMessage: string) => {
	switch document->Document.querySelector(".config") {
	| Some(configElement) => {
		configElement
        ->Element.classList
        ->DomTokenList.add("display-none")
    }
	| None => Js.log("No config element found")
	}

	switch document->Document.querySelector(".config-error") {
	| Some(configErrorElement) => {
		configErrorElement
		->Element.setInnerHTML(`<p>${errorMessage}</p>`)
    }
	| None => Js.log("No config error element found")
	}
}

let loadConfigHandler = _ => {
    let _ = invoke(~cmd = "read_config", ())
    ->then(config => {
        Js.log(config)
        resolve()
    })
    ->catch(e => {
        switch e {
        | JsError(obj) =>
            switch Js.Exn.message(obj) {
            | Some(message) => errorHandler(message)
            | None => errorHandler(`Unexpected error`)
            }
        | _ => errorHandler(`Unexpected error`)
        }
        resolve()
    })
    ()
}

switch document->Document.getElementById("start-btn") {
| Some(startButton) => startButton->Element.addClickEventListener(loadConfigHandler)
| None => Js.log("No start button found")
}

/* %%raw(`
document.getElementById('start-btn').addEventListener('click', async _ => {
	try {
		let config = await invoke('read_config');
		document.querySelector('.config__bim-files').innerHTML =
			config.files.reduce(
				(filenameElements, pathToFile) => filenameElements.concat(\`<li>\${pathToFile}</li>\`),
				''
			);
		document.querySelector('.config__logfile-path').innerText =
			config.logger_config;
		document.querySelector('.distribution-type')
			.innerText = \`Тип: \${config.distribution.distribution_type}\`;
		document.querySelector('.distribution-density')
			.innerText = \`Плотность: \${config.distribution.density}\`;
		document.querySelector('.distribution-special').innerHTML =
			config.distribution.special.reduce(
				(specialElements, special) =>
					specialElements.concat(
						\`<li>
						<ol>
							\${special.uuid.reduce((uuidElements, uuid) => uuidElements.concat(\`<li>\${uuid}</li>\`), '')}
						</ol>
						<p>Плотность: \${special.density}</p>
						<p>Комментарий: \${special.comment}</p>
					</li>\`
					),
				''
			);
		document.querySelector('.transitions-type')
			.innerText = \`Тип: \${config.transition.transitions_type}\`;
		document.querySelector('.transitions-doorway-in')
			.innerText = \`Doorway in: \${config.transition.doorway_in}\`;
		document.querySelector('.transitions-doorway-out')
			.innerText = \`Doorway out: \${config.transition.doorway_out}\`;
		document.querySelector('.transitions-special').innerHTML =
			config.transition.special.reduce(
				(specialElements, special) =>
					specialElements.concat(\`
					<li>
						<ol>
							\${special.uuid.reduce((uuidElements, uuid) => uuidElements.concat(\`<li>\${uuid}</li>\`), '')}
						</ol>
						<p>Ширина: \${special.width}</p>
						<p>Комментарий: \${special.comment}</p>
					</li>
				\`),
				''
			);
		document.querySelector('.modeling-step')
			.innerText = \`Шаг: \${config.modeling.step}\`;
		document.querySelector('.modeling-max-speed')
			.innerText = \`Максимальная скорость: \${config.modeling.max_speed}\`;
		document.querySelector('.modeling-max-density')
			.innerText = \`Максимальная плотность: \${config.modeling.max_density}\`;
		document.querySelector('.modeling-min-density')
			.innerText = \`Минимальная плотность: \${config.modeling.min_density}\`;
		document.querySelector('.config-error').style.display = 'none';
		document.querySelector('.config').style.display = 'block';
	} catch (errorMessage) {
		console.error(errorMessage);
		document.querySelector('.config').style.display = 'none';
		document.querySelector('.config-error').innerHTML = \`
			<p>
				\${typeof errorMessage === 'string' ? errorMessage : 'Произошла неизвестная ошибка'}
			</p>
		\`;
	}
});
`) */