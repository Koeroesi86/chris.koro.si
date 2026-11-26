import { faEnvelope, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import type { AppProps } from './components/app';
import backgroundImage from './assets/images/bg.svg';

export const url = 'https://chris.koro.si/';
export const name = 'Krisztian Korosi';
export const jobTitle = 'Senior full-stack software engineer';
export const email = 'chris@koro.si';
export const location = 'Budapest area, Hungary';

export const appProps: AppProps = {
  logos: Object.values(
    import.meta.glob<string>('./assets/images/logos/*.svg', { eager: true, query: '?url', import: 'default' })
  ),
  hero: name,
  intro: `${jobTitle}, and meh. Just Chris. :)`,
  links: [
    { href: 'https://github.com/Koeroesi86', icon: faGithub, text: 'GitHub' },
    { href: 'https://www.linkedin.com/in/krisztiankorosi', icon: faLinkedin, text: 'LinkedIn' },
  ],
  contacts: [
    { icon: faEnvelope, text: email, href: `mailto:${email}` },
    { icon: faLocationDot, text: location },
  ],
  backgroundImage,
};
