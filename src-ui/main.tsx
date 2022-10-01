import * as ReactDOM from 'react-dom/client';
import App from './App';

/*(document.getElementById('file_input') as HTMLInputElement).addEventListener('change', e => {
	console.log((e.target as HTMLInputElement).value);
});*/

const rootElement = document.querySelector('#root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
