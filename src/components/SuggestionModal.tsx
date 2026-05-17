import { useRef, useState } from 'react';
import type { Language } from '../types/player.ts';
import { useEscapeKey } from '../hooks/useEscapeKey.ts';
import { getTurnstileToken } from '../lib/turnstile.ts';

interface SuggestionModalProps {
  onClose: () => void;
  lang: Language;
}

type Tab = 'new-player' | 'correction' | 'bug';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const API_ENDPOINT = '/api/suggest';

const L = {
  fr: {
    title: 'Faire une suggestion',
    tabNewPlayer: 'Nouveau joueur',
    tabCorrection: 'Correction',
    tabBug: 'Bug',
    name: 'Nom complet',
    country: 'Pays',
    gender: 'Sexe',
    male: 'Homme',
    female: 'Femme',
    discipline: 'Discipline',
    singles: 'Simple',
    doubles: 'Double',
    mixed: 'Double mixte',
    wikiUrl: 'Lien Wikipedia (optionnel)',
    playerName: 'Joueur concerné',
    field: 'Champ à corriger',
    newValue: 'Nouvelle valeur',
    source: 'Source (optionnel)',
    bugTitle: 'Titre du bug',
    bugDescription: 'Description',
    bugUrl: 'URL ou contexte (optionnel)',
    notes: 'Notes (optionnel)',
    submit: 'Envoyer',
    sending: 'Envoi…',
    success: 'Merci ! Ta suggestion a été enregistrée.',
    errorGeneric: 'Une erreur est survenue. Réessaie plus tard.',
    errorNotConfigured: 'Le formulaire de suggestion n\'est pas disponible sur ce déploiement.',
  },
  en: {
    title: 'Send a suggestion',
    tabNewPlayer: 'New player',
    tabCorrection: 'Correction',
    tabBug: 'Bug',
    name: 'Full name',
    country: 'Country',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    discipline: 'Discipline',
    singles: 'Singles',
    doubles: 'Doubles',
    mixed: 'Mixed Doubles',
    wikiUrl: 'Wikipedia link (optional)',
    playerName: 'Player',
    field: 'Field to correct',
    newValue: 'Proposed value',
    source: 'Source (optional)',
    bugTitle: 'Bug title',
    bugDescription: 'Description',
    bugUrl: 'URL or context (optional)',
    notes: 'Notes (optional)',
    submit: 'Send',
    sending: 'Sending…',
    success: 'Thanks! Your suggestion was sent.',
    errorGeneric: 'Something went wrong. Try again later.',
    errorNotConfigured: 'Suggestions are not available on this deployment.',
  },
};

export function SuggestionModal({ onClose, lang }: SuggestionModalProps) {
  useEscapeKey(onClose);
  const t = L[lang];
  const [tab, setTab] = useState<Tab>('new-player');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const turnstileHost = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!TURNSTILE_SITE_KEY) {
      setError(t.errorNotConfigured);
      return;
    }

    const fd = new FormData(e.currentTarget);
    setSubmitting(true);

    try {
      const token = await getTurnstileToken(turnstileHost.current!, TURNSTILE_SITE_KEY);

      let payload: Record<string, unknown> = { type: tab, turnstileToken: token };
      if (tab === 'new-player') {
        payload = {
          ...payload,
          name: fd.get('name'),
          country: fd.get('country'),
          gender: fd.get('gender'),
          discipline: fd.get('discipline'),
          wikiUrl: fd.get('wikiUrl') || undefined,
          notes: fd.get('notes') || undefined,
        };
      } else if (tab === 'correction') {
        payload = {
          ...payload,
          playerName: fd.get('playerName'),
          field: fd.get('field'),
          newValue: fd.get('newValue'),
          source: fd.get('source') || undefined,
          notes: fd.get('notes') || undefined,
        };
      } else {
        payload = {
          ...payload,
          title: fd.get('title'),
          description: fd.get('description'),
          url: fd.get('url') || undefined,
        };
      }

      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? t.errorGeneric);
      }
    } catch {
      setError(t.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="suggest-title">
      <div
        className="bg-court-dark rounded-card p-6 max-w-md w-full shadow-2xl border border-court-line max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="suggest-title" className="text-lg font-bold text-shuttle-white text-center uppercase tracking-widest mb-4">
          {t.title}
        </h2>

        {success ? (
          <p className="text-center text-ace-green text-sm py-8">{t.success}</p>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-court-mid rounded-full p-1">
              {(['new-player', 'correction', 'bug'] as Tab[]).map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex-1 px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                    tab === id
                      ? 'bg-shuttle-white text-court-dark'
                      : 'text-shuttle-feather hover:text-shuttle-white'
                  }`}
                >
                  {id === 'new-player' ? t.tabNewPlayer : id === 'correction' ? t.tabCorrection : t.tabBug}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              {tab === 'new-player' && <NewPlayerFields t={t} />}
              {tab === 'correction' && <CorrectionFields t={t} />}
              {tab === 'bug' && <BugFields t={t} />}

              {/* Invisible Turnstile widget host */}
              <div ref={turnstileHost} aria-hidden="true" />

              {error && <p className="text-racket-orange text-xs">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-card bg-shuttle-white text-court-dark font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
              >
                {submitting ? t.sending : t.submit}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-shuttle-feather text-xs uppercase tracking-wider mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputCls = 'w-full bg-court-mid border border-court-line rounded-card px-3 py-2.5 text-shuttle-white placeholder-shuttle-feather focus:outline-none focus:border-shuttle-feather';

function NewPlayerFields({ t }: { t: typeof L['fr'] }) {
  return (
    <>
      <Field label={t.name}><input className={inputCls} name="name" required maxLength={80} /></Field>
      <Field label={t.country}><input className={inputCls} name="country" required maxLength={60} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t.gender}>
          <select className={inputCls} name="gender" required defaultValue="H">
            <option value="H">{t.male}</option>
            <option value="F">{t.female}</option>
          </select>
        </Field>
        <Field label={t.discipline}>
          <select className={inputCls} name="discipline" required defaultValue="Simple">
            <option value="Simple">{t.singles}</option>
            <option value="Double">{t.doubles}</option>
            <option value="Double mixte">{t.mixed}</option>
          </select>
        </Field>
      </div>
      <Field label={t.wikiUrl}><input className={inputCls} name="wikiUrl" type="url" placeholder="https://en.wikipedia.org/wiki/…" /></Field>
      <Field label={t.notes}><textarea className={inputCls} name="notes" rows={2} maxLength={1000} /></Field>
    </>
  );
}

function CorrectionFields({ t }: { t: typeof L['fr'] }) {
  return (
    <>
      <Field label={t.playerName}><input className={inputCls} name="playerName" required maxLength={80} /></Field>
      <Field label={t.field}><input className={inputCls} name="field" required maxLength={40} placeholder="bestRanking, status, discipline…" /></Field>
      <Field label={t.newValue}><input className={inputCls} name="newValue" required maxLength={200} /></Field>
      <Field label={t.source}><input className={inputCls} name="source" type="url" placeholder="https://…" /></Field>
      <Field label={t.notes}><textarea className={inputCls} name="notes" rows={2} maxLength={1000} /></Field>
    </>
  );
}

function BugFields({ t }: { t: typeof L['fr'] }) {
  return (
    <>
      <Field label={t.bugTitle}><input className={inputCls} name="title" required minLength={4} maxLength={120} /></Field>
      <Field label={t.bugDescription}><textarea className={inputCls} name="description" required rows={4} minLength={8} maxLength={2000} /></Field>
      <Field label={t.bugUrl}><input className={inputCls} name="url" /></Field>
    </>
  );
}
