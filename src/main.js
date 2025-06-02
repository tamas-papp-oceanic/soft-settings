import App from './App.svelte';
import pkg from '../package.json';

const app = new App({
	target: document.body,
	props: {
		appName: pkg.name,
		version: pkg.version,
	}
});

export default app;
