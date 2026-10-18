"use client";
import Link from "next/link";
import { quizDone, quizScore, shortDate } from "@/lib/notebooks";

export function metaLine(nb) {
  const m = nb.meta || {};
  const size = m.kind === "pdf" && m.pages ? `${m.pages} page${m.pages === 1 ? "" : "s"}` : `${(nb.text?.length || 0).toLocaleString("en-US")} chars`;
  return `${size} · ${shortDate(nb.createdAt)}`;
}

export function statusOf(nb) {
  if (nb.stamped) return { cls: "is-stamped", text: `Stamped #${nb.stamped.id ?? "·"}` };
  if (quizDone(nb)) return { cls: "is-done", text: `Quiz ${quizScore(nb)}/${nb.kit.quiz.length}` };
  if ((nb.answers || []).some((a) => a !== null)) return { cls: "is-part", text: "Quiz in progress" };
  return { cls: "", text: "Not quizzed yet" };
}

export function NotebookCard({ nb, onDelete }) {
  const st = statusOf(nb);
  return (
    <article className="ap-card ap-nbcard">
      <Link href={`/app/notebook?id=${nb.id}`} className="ap-nbcard-link">
        <span className="ap-nbcard-ico" aria-hidden="true">{nb.meta?.kind === "pdf" ? "PDF" : "TXT"}</span>
        <b title={nb.title}>{nb.title}</b>
        <small>{metaLine(nb)}</small>
        <span className={`ap-chip ${st.cls}`}>{st.text}</span>
      </Link>
      {onDelete && (
        <button className="ap-x" onClick={() => onDelete(nb)} aria-label={`Delete ${nb.title}`} title="Delete from this browser">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      )}
    </article>
  );
}
