// Two rows of stamped notebooks drifting in opposite directions: other people's study shelves.
// Hover pauses the rows and opens a notebook a little. Example content only.
const KRAFTS = ["#b98a5e", "#a9784a", "#c79a6c", "#9c7249", "#bf8f62"];
const BOOKS = [
  ["Biology ch. 3", "4/5"], ["Intro to Solidity", "5/5"], ["History, week 2", "3/5"], ["Calculus limits", "4/5"], ["Cell respiration", "5/5"],
  ["Python basics", "4/5"], ["Macroeconomics", "3/5"], ["Web3 docs", "5/5"], ["Organic chem", "4/5"], ["Philosophy 101", "3/5"],
];
const ROW_B = [...BOOKS.slice(5), ...BOOKS.slice(0, 5)];

function Book({ title, score, i }) {
  const stamped = i % 3 !== 1;
  return (
    <figure className="sr-book" style={{ "--c": KRAFTS[i % KRAFTS.length], "--r": `${((i * 37) % 7) - 3}deg` }}>
      <div className="sr-cover">
        <span className="sr-rings" aria-hidden="true" />
        <span className="sr-label"><small>Name:</small><b>{title}</b></span>
        {stamped && (
          <span className="sr-stamp" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="46" height="46"><circle cx="32" cy="32" r="27" fill="none" stroke="#ef7a3a" strokeWidth="4" /><circle cx="32" cy="32" r="20" fill="none" stroke="#ef7a3a" strokeWidth="1.8" opacity=".7" /><path d="M20 33l8 8 17-18" fill="none" stroke="#ef7a3a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        )}
        <span className="sr-score">{score}</span>
      </div>
      <span className="sr-pages" aria-hidden="true" />
    </figure>
  );
}

function Row({ items, reverse, hidden }) {
  return (
    <div className={`sr-row${reverse ? " is-rev" : ""}`} aria-hidden={hidden || undefined}>
      {items.map(([t, s], i) => (
        <Book key={t} title={t} score={s} i={i + (reverse ? 3 : 0)} />
      ))}
    </div>
  );
}

export default function ShelfRows() {
  return (
    <section className="ln-section sr-wrap" aria-labelledby="sr-h">
      <div className="wrap">
        <p className="ln-note" data-reveal>other shelves, stamped</p>
        <h2 id="sr-h" data-split data-guide-avoid>Every notebook here was studied, then stamped.</h2>
      </div>
      <div className="sr-rows" data-guide-avoid role="img" aria-label="Example notebooks with study scores, drifting past">
        {[false, true].map((rev) => (
          <div key={String(rev)} className="sr-lane">
            <div className={`sr-track${rev ? " is-rev" : ""}`}>
              <Row items={rev ? ROW_B : BOOKS} reverse={rev} />
              <Row items={rev ? ROW_B : BOOKS} reverse={rev} hidden />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
