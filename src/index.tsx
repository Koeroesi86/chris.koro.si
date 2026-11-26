import { createRoot, hydrateRoot } from 'react-dom/client';
import { config } from '@fortawesome/fontawesome-svg-core';
import { App } from './components/app';
import { appProps } from './site';
import { unregisterServiceWorker } from './unregister-service-worker';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './clients/default/index.scss';

// The icon styles are bundled above, so the prerendered icons are sized before any script runs.
config.autoAddCss = false;

const root = document.getElementById('root')!;
const app = <App {...appProps} />;

// The production build ships prerendered markup; the dev server starts with an empty root.
if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}

unregisterServiceWorker();
