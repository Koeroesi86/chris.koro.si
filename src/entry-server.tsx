import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { App } from './components/app';
import me from './assets/images/me.jpg';
import { appProps, email, jobTitle, location, name, url } from './site';

const image = new URL(me, url).href;

const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name,
  jobTitle,
  url,
  image,
  email,
  homeLocation: { '@type': 'Place', name: location },
  sameAs: appProps.links.map((link) => link.href),
};

export const renderHead = () =>
  renderToStaticMarkup(
    <>
      <meta name="description" content={appProps.intro} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={name} />
      <meta property="og:description" content={appProps.intro} />
      <meta property="og:image" content={image} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, '\\u003c') }}
      />
    </>
  );

export const renderBody = () => renderToString(<App {...appProps} />);
