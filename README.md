# Omniscient: GRE vocabulary by topic

**Live app:** [omniscient-sgx0.onrender.com](https://omniscient-sgx0.onrender.com/)

A flashcard app for learning GRE words through topics you care about, from computer science and environmental science to bird watching, American football and movies. Each topic card uses a GRE word in a sentence about a real concept from the topic, with a source you can check, so new vocabulary attaches to ideas you already know. A Cinephile deck links every word to movie and TV clips where you can hear it spoken. Reviews are scheduled with [FSRS](https://github.com/open-spaced-repetition/ts-fsrs) and progress is saved in the browser.

Stack: Vite, React (JavaScript), plain CSS, react-router, ts-fsrs, localStorage. No backend.

## Setup

Requires Node.js 22.22 or newer (required by react-router).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

The app uses client-side routes (`/deck/:id`, `/words`, …). When deploying `dist/`, configure the host to serve `index.html` for unknown paths (on a Render static site, add a rewrite rule from `/*` to `/index.html`).

## Topics

Each topic is one JSON file in `src/data/decks/`, grouped on the home page by its `category` (subject):

| Subject                        | Topics                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Computer Science               | AI App Development, Computer Networks, Computer Science Pragmatics, Computer Vision, Empathetic Leadership in Computing, Foundations of Artificial Intelligence, Information Retrieval and Web Search, Intro to AI, Intro to Computer Programming, Intro to Database Management Systems, Intro to Operating Systems, Introduction to Computer Security, Introduction to Machine Learning, Introduction to Natural Language Processing, Mobile App Development, Mobile App Development for Entrepreneurs, Scientific Programming, Web Systems |
| Environment and Sustainability | Biology of Mammals, Climate Change, Ecology of Fishes, Environmental Law, Forest Ecology and Management, Ornithology                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Nature                         | Bird Watching                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Sports                         | American Football                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Cinephile                      | PlayPhrase.me (external tool)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

The home page builds its subject list, topic counts and jump links from these files, so a new topic or subject shows up there automatically.

## Using the app

- **Decks** (`/`): an introduction listing the subjects, a summary of how many topics and cards there are, jump links to each subject, and the decks grouped by subject with cards due today and new cards available. Decks that link to a third-party site carry an "External tool" badge.
- **Deck** (`/deck/:id`): new, learning and due counts, the word list, and a Study button. External-tool decks also explain which site the cards link to.
- **Study** (`/deck/:id/study`): <kbd>Space</kbd> shows the answer, <kbd>1</kbd>–<kbd>4</kbd> answer Again / Hard / Good / Easy. Each button shows when the card will come back. A session shows cards due today first, then up to 10 new cards per deck per day. Cards still in short learning steps come back later in the same session.
- **Words** (`/words`): every word across all decks, searchable, with the topics each appears in. Click a word to see all of its cards.
- **Settings** (`/settings`): export progress to a JSON file, import it again (in this or another browser), or reset everything.
- **Contact** (`/contact`): how to reach the creator with questions or feedback (email, LinkedIn, website), and what kinds of messages help most.

### Cinephile deck and external tools

The Cinephile deck (`/deck/cinephile`, titled PlayPhrase.me) teaches each word with a short definition, then links to [PlayPhrase.me](https://www.playphrase.me/), where you can watch movie and TV clips of actors saying it. PlayPhrase.me is an independent website, not made by or affiliated with Omniscient, and the app labels it as an external tool everywhere it appears: a badge on the home page, a notice on the deck page, and a "Hear it in movies" panel with a disclaimer on the back of each card and on the word page. Links open in a new tab.

## Adding a deck

Add a JSON file to `src/data/decks/`. It is picked up automatically (`import.meta.glob`); no code changes needed. There are two kinds of deck.

### Topic decks

The default. Every card ties the word to a concept from the topic:

```json
{
  "id": "security",
  "title": "Security",
  "category": "Computer Science",
  "description": "Learn GRE words through cryptography, networks and attacks.",
  "cards": [
    {
      "id": "security-ephemeral",
      "word": "ephemeral",
      "partOfSpeech": "adjective",
      "definition": "lasting for a very short time",
      "sentence": "Forward secrecy relies on ephemeral keys, generated for one session and then discarded.",
      "explanation": "Short explanation of the concept and how the word fits it.",
      "citations": [
        {
          "title": "Forward secrecy (Wikipedia)",
          "url": "https://en.wikipedia.org/wiki/Forward_secrecy"
        }
      ]
    }
  ]
}
```

| Field                                     | Rules                                                                                                                                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id` (deck)                               | Unique; lowercase letters, digits and dashes. Used in the URL.                                                                                                                           |
| `title`, `category`, `description`        | Non-empty strings. Decks with the same `category` are grouped together.                                                                                                                  |
| `externalTool` (deck)                     | Optional. Turns the deck into an external-tool deck (see below). Must be a key of `EXTERNAL_TOOLS` in `src/lib/externalTools.js`.                                                        |
| `cards[].id`                              | Unique across **all** decks and stable. Progress is stored against it, so don't rename it once people have studied the card. A deck-name prefix (`security-ephemeral`) keeps ids unique. |
| `word`, `definition`                      | Non-empty strings. Always required.                                                                                                                                                      |
| `partOfSpeech`, `sentence`, `explanation` | Non-empty strings. Required in topic decks, optional in external-tool decks. The word is highlighted in the sentence, including simple inflections (`obfuscating`).                      |
| `citations`                               | At least one `{ "title", "url" }`; URLs must be `http(s)`. Required in topic decks, optional in external-tool decks.                                                                     |

### External-tool decks

Set `"externalTool"` on the deck and each card only needs an `id`, a `word` and a `definition`. Every card then links to that tool for its word. Any optional fields a card does include are validated and shown as usual.

```json
{
  "id": "cinephile",
  "title": "PlayPhrase.me",
  "category": "Cinephile",
  "description": "Learn each meaning, then hear it spoken in movie and TV clips.",
  "externalTool": "playphrase",
  "cards": [
    {
      "id": "cinephile-abate",
      "word": "abate",
      "definition": "subside, or moderate"
    }
  ]
}
```

The same word may appear in several decks; the Words page groups them.

Decks are validated when the app loads (`src/lib/decks.js`, which also documents the schema in JSDoc). A malformed card is skipped with a warning in the browser console; a deck with a missing or invalid `id`, `title`, `category`, `description`, `externalTool` or `cards` is skipped with an error. The rest of the app keeps working.

## Progress storage

All progress is stored in `localStorage` under one key, `gre-vocab:v1`:

```json
{
  "version": 1,
  "cards": {
    "security-ephemeral": {
      "due": "2026-10-29T21:14:20.048Z",
      "stability": 8.29,
      "difficulty": 1,
      "elapsed_days": 0,
      "scheduled_days": 7,
      "learning_steps": 0,
      "reps": 1,
      "lapses": 0,
      "state": 2,
      "last_review": "2026-10-22T21:14:20.048Z"
    }
  },
  "newCards": { "security": { "date": "2026-10-22", "count": 5 } }
}
```

`cards` holds the ts-fsrs card state per card id (dates are converted back to `Date` objects on load). `newCards` counts new cards introduced per deck on the current local day, for the 10-per-day limit. Export files use the same format.

If storage is unavailable (for example, blocked in a private window), the app still works, keeps progress in memory for the visit and shows a notice.

## Code structure

```
src/
  data/decks/   Deck JSON files
  lib/          decks.js (loading, validation, schema), externalTools.js (third-party sites decks can link to),
                scheduler.js (FSRS, queue, stats), storage.js (localStorage), study.js (records a review),
                text.js, useProgress.js
  components/   Layout, Flashcard, RatingButtons, CardDetails, DeckCard,
                ExternalBadge, ExternalToolLink, ExternalToolNotice (.jsx + .css)
  pages/        Home, Deck, Study, Words, Word, Settings, Contact, NotFound (.jsx + .css)
  styles/       variables.css (tokens, dark mode), global.css (reset, base, buttons)
```

Scheduling and storage live in `src/lib`, not in components. To move progress to a backend such as Supabase, replace `storage.js` with an implementation of the same functions (`getProgress`, `subscribe`, `saveReview`, `importProgress`, `resetProgress`, …); the UI does not need to change.

CSS uses BEM class names prefixed with the component name (`.flashcard__back`), one stylesheet per component, and design tokens from `variables.css`. Dark mode follows the system setting, and the card flip is skipped when reduced motion is requested.

## Customizing

- **Contact details:** edit the `CONTACT` object at the top of `src/pages/Contact.jsx`.
- **External tools:** add an entry to `EXTERNAL_TOOLS` in `src/lib/externalTools.js` with an `id`, `name`, `homepage`, `action` (button label, e.g. "Hear it in movies"), `description` and a `url(word)` function that builds the link for a word. Then set `"externalTool": "<id>"` on a deck.
- **Selected text** uses a white background with black text (`--color-selection-bg` and `--color-selection-text` in `variables.css`).
- **Scrollbar** is thin and uses the accent color on the page background (`--color-scrollbar-thumb` and `--color-scrollbar-track`), so it follows dark mode. Firefox and Chrome use the standard `scrollbar-width` / `scrollbar-color` properties; Safari gets an equivalent `::-webkit-scrollbar` style.

## Contact

Built by Kaustubh Hari Sethi. Questions or feedback: [kaustubhsethi14@gmail.com](mailto:kaustubhsethi14@gmail.com), [LinkedIn](https://www.linkedin.com/in/kaustubh-hari-sethi/), [kaustubhsethi.com](https://kaustubhsethi.com).
