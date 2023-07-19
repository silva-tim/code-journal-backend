import { useEffect, useState } from 'react';

export default function EntryList({ onCreate, onEdit }) {
  const [entries, setEntries] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch('/api/journals');
        if (!res.ok) {
          throw new Error(`fetch Error ${res.status}`);
        }
        const journalEntries = await res.json();
        setEntries(journalEntries);
      } catch (err) {
        setError(err);
      }
    }
    fetchEntries();
  }, []);

  if (!error && !entries) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error</div>;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="column-full d-flex justify-between align-center">
          <h1>Entries</h1>
          <h3>
            <button
              type="button"
              className="white-text form-link"
              onClick={onCreate}>
              NEW
            </button>
          </h3>
        </div>
      </div>
      <div className="row">
        <div className="column-full">
          <ul className="entry-ul">
            {entries.map((entry) => (
              <Entry key={entry.entryId} entry={entry} onEdit={onEdit} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Entry({ entry, onEdit }) {
  return (
    <li>
      <div className="row">
        <div className="column-half">
          <img
            className="input-b-radius form-image"
            src={entry.photoUrl}
            alt=""
          />
        </div>
        <div className="column-half">
          <div className="row">
            <div className="column-full d-flex justify-between">
              <h3>{entry.title}</h3>
              <i
                className="fa-solid fa-pencil"
                onClick={() => onEdit(entry)}></i>
            </div>
          </div>
          <p>{entry.notes}</p>
        </div>
      </div>
    </li>
  );
}
