import classNames from 'classnames';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
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
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className={classNames(styles.App, { [styles.contactOpen]: contactOpen })}>
      <Background imageAssets={logos} backgroundImage={backgroundImage} canvasOpacity={0.4} />
      <header className={styles.header}>
        <img src={me} className={styles.imageMe} alt="me" />
        <h1 className={styles.headerTitle}>{hero}</h1>
        <div className={styles.headerIntro}>{intro}</div>
        <div className={styles.links}>
          {links.map((link) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={link.href}
              className={styles.link}
              key={`link-${link.href}`}
            >
              <FontAwesomeIcon icon={link.icon} className={styles.icon} />
              <span className={styles.text}>{link.text}</span>
            </a>
          ))}
        </div>
        <div className={styles.contactPanel}>
          <div className={styles.contactPanelDetails}>
            <h3>Contact me if you fancy</h3>
            <div className={styles.lines}>
              {contacts.map((contact, index) => (
                <div key={`contact-${index}`}>
                  <FontAwesomeIcon icon={contact.icon} className={styles.icon} />
                  <span className={styles.text}>{contact.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.contactPanelToggle} onClick={() => setContactOpen(!contactOpen)}>
            <FontAwesomeIcon icon={faCaretDown} className={styles.icon} />
          </div>
        </div>
      </header>
    </div>
  );
};

export default App;
