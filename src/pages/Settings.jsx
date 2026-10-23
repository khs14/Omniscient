import { useRef, useState } from 'react';
import {
  countStudiedCards,
  exportProgress,
  importProgress,
  parseProgressFile,
  resetProgress,
} from '../lib/storage.js';
import { localDayKey } from '../lib/scheduler.js';
import { useIsPersistent, useProgress } from '../lib/useProgress.js';
import './Settings.css';

const cardsLabel = (n) => (n === 1 ? '1 card' : `${n} cards`);

export default function Settings() {
  const progress = useProgress();
  const persistent = useIsPersistent();
  const studied = countStudiedCards(progress);

  const fileInput = useRef(null);
  const [pendingImport, setPendingImport] = useState(null); // { fileName, progress, skipped }
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [message, setMessage] = useState(null); // { tone: 'ok' | 'error', text }

  function handleExport() {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gre-vocab-progress-${localDayKey(new Date())}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setMessage({ tone: 'ok', text: `Exported progress for ${cardsLabel(studied)}.` });
  }

  async function handleFileChosen(event) {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow choosing the same file again
    if (!file) return;
    setConfirmingReset(false);
    try {
      const parsed = parseProgressFile(await file.text());
      setPendingImport({ fileName: file.name, ...parsed });
      setMessage(null);
    } catch (error) {
      setPendingImport(null);
      setMessage({ tone: 'error', text: `Couldn't import ${file.name}: ${error.message}` });
    }
  }

  function confirmImport() {
    importProgress(pendingImport.progress);
    const imported = countStudiedCards(pendingImport.progress);
    const skippedNote =
      pendingImport.skipped > 0 ? ` Skipped ${pendingImport.skipped} unreadable entries.` : '';
    setMessage({ tone: 'ok', text: `Imported progress for ${cardsLabel(imported)}.${skippedNote}` });
    setPendingImport(null);
  }

  function confirmReset() {
    resetProgress();
    setConfirmingReset(false);
    setMessage({ tone: 'ok', text: 'All progress has been reset.' });
  }

  return (
    <div className="page page--narrow settings">
      <title>Settings · Omniscient</title>
      <h1>Settings</h1>
      <p className="settings__lead">
        Progress is saved in this browser only
        {persistent ? '' : ' for this visit, because storage is blocked'}. You have studied{' '}
        {cardsLabel(studied)} so far.
      </p>

      <div className="settings__message" role="status">
        {message && <p className={`settings__alert settings__alert--${message.tone}`}>{message.text}</p>}
      </div>

      <section className="settings__section" aria-labelledby="settings-export">
        <div className="settings__text">
          <h2 id="settings-export" className="settings__title">
            Export progress
          </h2>
          <p className="settings__description">
            Download a JSON file of your progress to back it up or move it to another browser.
          </p>
        </div>
        <button type="button" className="button" onClick={handleExport}>
          Export progress
        </button>
      </section>

      <section className="settings__section" aria-labelledby="settings-import">
        <div className="settings__text">
          <h2 id="settings-import" className="settings__title">
            Import progress
          </h2>
          <p className="settings__description">
            Load a file made with Export progress. It replaces the progress in this browser.
          </p>
        </div>
        <button type="button" className="button" onClick={() => fileInput.current?.click()}>
          Import progress
        </button>
        <input
          ref={fileInput}
          className="settings__file"
          type="file"
          accept="application/json,.json"
          onChange={handleFileChosen}
          tabIndex={-1}
          aria-hidden="true"
        />
        {pendingImport && (
          <div className="settings__confirm" role="alert">
            <p>
              Replace your current progress ({cardsLabel(studied)}) with {pendingImport.fileName} (
              {cardsLabel(countStudiedCards(pendingImport.progress))})?
            </p>
            <div className="settings__confirm-actions">
              <button type="button" className="button button--primary" onClick={confirmImport}>
                Replace progress
              </button>
              <button type="button" className="button" onClick={() => setPendingImport(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="settings__section settings__section--danger" aria-labelledby="settings-reset">
        <div className="settings__text">
          <h2 id="settings-reset" className="settings__title">
            Reset progress
          </h2>
          <p className="settings__description">
            Delete all progress and start every deck from scratch. Decks themselves are not affected.
          </p>
        </div>
        {!confirmingReset ? (
          <button
            type="button"
            className="button"
            onClick={() => {
              setPendingImport(null);
              setConfirmingReset(true);
            }}
          >
            Reset progress
          </button>
        ) : (
          <div className="settings__confirm settings__confirm--danger" role="alert">
            <p>
              This deletes progress for {cardsLabel(studied)} and can't be undone. Export first if you might
              want it back.
            </p>
            <div className="settings__confirm-actions">
              <button type="button" className="button button--danger" onClick={confirmReset}>
                Delete all progress
              </button>
              <button type="button" className="button" onClick={() => setConfirmingReset(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
