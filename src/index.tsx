import { render } from 'react-dom';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin, faSkype } from '@fortawesome/free-brands-svg-icons';
import { App } from './components/app';
import backgroundImage from './assets/images/bg.jpg';
import { unregisterServiceWorker } from './unregister-service-worker';
import './clients/default/index.scss';

const logos = Object.values(
  import.meta.glob<string>('./assets/images/logos/*.svg', { eager: true, query: '?url', import: 'default' })
);

const links = [
  { href: 'https://github.com/Koeroesi86', icon: faGithub, text: 'GitHub' },
  { href: 'https://www.linkedin.com/in/krisztiankorosi', icon: faLinkedin, text: 'LinkedIn' },
];

const contacts = [
  { icon: faEnvelope, text: 'koeroesi86@gmail.com' },
  { icon: faSkype, text: 'koeroesi86' },
];

render(
  <App
    logos={logos}
    hero="Krisztian Korosi"
    intro="Senior full-stack software engineer, and meh. Just Chris. :)"
    links={links}
    contacts={contacts}
    backgroundImage={backgroundImage}
  />,
  document.getElementById('root')
);

unregisterServiceWorker();
