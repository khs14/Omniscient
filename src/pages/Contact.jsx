import './Contact.css';

/** Edit these to change what the Contact page shows. */
const CONTACT = {
  name: 'Kaustubh Hari Sethi',
  role: 'Creator of Omniscient',
  email: 'kaustubhsethi14@gmail.com',
  links: [
    {
      label: 'LinkedIn',
      text: 'linkedin.com/in/kaustubh-hari-sethi',
      url: 'https://www.linkedin.com/in/kaustubh-hari-sethi/',
    },
    { label: 'Website', text: 'kaustubhsethi.com', url: 'https://kaustubhsethi.com' },
  ],
};

const TOPICS = [
  {
    title: 'A mistake in a card',
    text: 'Tell me the word and the topic it appears in, and what looks wrong: the definition, the sentence, the explanation or a source.',
  },
  {
    title: 'An idea for a new topic',
    text: 'A subject you would enjoy learning GRE words through. The more specific, the better.',
  },
  {
    title: 'Feedback on the app',
    text: 'Anything confusing, broken or missing, or something you would like it to do.',
  },
];

export default function Contact() {
  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Omniscient feedback')}`;

  return (
    <div className="page page--narrow contact">
      <title>Contact · Omniscient</title>
      <header className="contact__header">
        <h1>Contact</h1>
        <p className="contact__lead">
          Omniscient is built by {CONTACT.name}. If you have a question, spot a mistake in a card or have an
          idea for a new topic, I'd like to hear from you.
        </p>
      </header>

      <section className="contact__card" aria-labelledby="contact-name">
        <h2 id="contact-name" className="contact__name">
          {CONTACT.name}
        </h2>
        <p className="contact__role">{CONTACT.role}</p>

        <dl className="contact__details">
          <div className="contact__row">
            <dt className="contact__label">Email</dt>
            <dd className="contact__value">
              <a href={mailto}>{CONTACT.email}</a>
            </dd>
          </div>
          {CONTACT.links.map((link) => (
            <div key={link.url} className="contact__row">
              <dt className="contact__label">{link.label}</dt>
              <dd className="contact__value">
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.text}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </dd>
            </div>
          ))}
        </dl>

        <a className="button button--primary contact__email-button" href={mailto}>
          Email me
        </a>
      </section>

      <section className="contact__topics" aria-labelledby="contact-topics-title">
        <h2 id="contact-topics-title" className="contact__topics-title">
          What to write about
        </h2>
        <ul className="contact__topic-list">
          {TOPICS.map((topic) => (
            <li key={topic.title} className="contact__topic">
              <h3 className="contact__topic-title">{topic.title}</h3>
              <p className="contact__topic-text">{topic.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
