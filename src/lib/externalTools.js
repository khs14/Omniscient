/**
 * Third-party websites a deck can link each word to. These are NOT built by the
 * Omniscient team; the UI always labels them as external tools.
 *
 * A deck opts in with `"externalTool": "<id>"` in its JSON file.
 */

/**
 * @typedef {Object} ExternalTool
 * @property {string} id           Key used in deck JSON.
 * @property {string} name         Display name of the website.
 * @property {string} homepage     Link to the site itself.
 * @property {string} action       Short label for what the link does.
 * @property {string} description  One sentence on what the user will find there.
 * @property {(word: string) => string} url  Link for a specific word.
 */

/** @type {Record<string, ExternalTool>} */
export const EXTERNAL_TOOLS = {
  playphrase: {
    id: 'playphrase',
    name: 'PlayPhrase.me',
    homepage: 'https://www.playphrase.me/',
    action: 'Hear it in movies',
    description:
      'Watch short movie and TV clips where actors say this word, to hear how it sounds and how it is used.',
    url: (word) =>
      `https://www.playphrase.me/#/search?q=${encodeURIComponent(word.trim().toLowerCase())}&language=en`,
  },
};

/** @param {string | null | undefined} id */
export const getExternalTool = (id) => (id ? EXTERNAL_TOOLS[id] : undefined);
