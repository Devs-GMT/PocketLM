"use client";
import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { NotebookCard } from "@/components/app/NotebookCard";
import { deleteNotebook, useNotebooks } from "@/lib/notebooks";

export default function NotebooksList() {
  const list = useNotebooks();
  const [q, setQ] = useState("");
  const [asking, setAsking] = useState(null);
  const shown = (list || []).filter((n) => n.title.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="ap-page">
      <div className="ap-sec-head is-page">
        <div>
          <h1 className="ap-h2">My notebooks</h1>
          <p className="ap-lede">Saved only in this browser. Clearing your browser data removes them.</p>
        </div>
        <Link href="/app/new" className="ap-btn is-primary">+ New notebook</Link>
      </div>

      {list && list.length > 4 && (
        <input className="ap-input ap-search" type="search" placeholder="Search notebooks" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search notebooks" />
      )}

      {list === null ? (
        <div className="ap-grid" aria-hidden="true">{[0, 1, 2].map((i) => <div key={i} className="ap-card ap-skel" />)}</div>
      ) : list.length === 0 ? (
        <div className="ap-empty">
          <p className="ap-hand">no notebooks yet</p>
          <p>Paste some notes or drop in a PDF to make your first one.</p>
          <Link href="/app/new" className="ap-btn is-primary">Create a notebook</Link>
        </div>
      ) : shown.length === 0 ? (
        <div className="ap-empty"><p>No notebook matches “{q}”.</p></div>
      ) : (
        <div className="ap-grid">
          {shown.map((n) => <NotebookCard key={n.id} nb={n} onDelete={setAsking} />)}
        </div>
      )}

      {asking && createPortal(
        <div className="ap-modal-bg" onMouseDown={(e) => e.target === e.currentTarget && setAsking(null)}>
          <div className="ap-modal is-small" role="alertdialog" aria-modal="true" aria-labelledby="del-h">
            <div className="ap-modal-body">
              <h2 id="del-h">Delete this notebook?</h2>
              <p className="ap-lede">“{asking.title}” will be removed from this browser. Anything you already stamped on-chain stays there.</p>
              <div className="ap-modal-actions">
                <button className="ap-btn is-ghost" onClick={() => setAsking(null)}>Keep it</button>
                <button className="ap-btn is-danger" onClick={() => { deleteNotebook(asking.id); setAsking(null); }}>Delete</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
