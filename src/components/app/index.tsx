import classNames from 'classnames';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Background } from '../background';
import me from '../../assets/images/me.jpg';
import styles from './index.module.scss';

export interface AppLink {
  href: string;
  icon: IconProp;
  text: string;
}

export interface AppContact {
  icon: IconProp;
  text: string;
  href?: string;
}

export interface AppProps {
  logos: string[];
  hero: string;
  intro: string;
  links: AppLink[];
  contacts: AppContact[];
  backgroundImage: string;
}

export const App = ({ logos, hero, intro, links, contacts, backgroundImage }: AppProps) => {
  const [contactOpen, setContactOpen] = useState(true);

  return (
    <div className={classNames(styles.App, { [styles.contactOpen]: contactOpen })}>
      <Background imageAssets={logos} backgroundImage={backgroundImage} canvasOpacity={0.55} />
      <main className={styles.card}>
        <img src={me} className={styles.imageMe} alt={hero} />
        <div className={styles.heading}>
          <h1 className={styles.title}>{hero}</h1>
          <p className={styles.intro}>{intro}</p>
        </div>
        <div className={styles.links}>
          {links.map((link) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={link.href}
              className={styles.link}
              key={`link-${link.href}`}
            >
              <FontAwesomeIcon icon={link.icon} />
              {link.text}
            </a>
          ))}
        </div>
        <div className={styles.contact}>
          <button
            type="button"
            className={styles.contactToggle}
            aria-expanded={contactOpen}
            aria-controls="contact-details"
            onClick={() => setContactOpen(!contactOpen)}
          >
            Contact me if you fancy
            <FontAwesomeIcon icon={faChevronDown} className={styles.chevron} />
          </button>
          <div className={styles.contactDetails} id="contact-details">
            <div className={styles.contactClip}>
              <ul className={styles.contactList}>
                {contacts.map((contact) => (
                  <li key={`contact-${contact.text}`}>
                    {/* Without an href the anchor is plain text: not focusable and not a link. */}
                    <a href={contact.href} className={styles.contactRow}>
                      <FontAwesomeIcon icon={contact.icon} />
                      {contact.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
