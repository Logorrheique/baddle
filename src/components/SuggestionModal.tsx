import { useState } from 'react';
import type { Language } from '../types/player.ts';
import { useEscapeKey } from '../hooks/useEscapeKey.ts';

interface SuggestionModalProps {
  onClose: () => void;
  lang: Language;
}

type Tab = 'new-player' | 'correction' | 'bug';

// Public repo, no secret: users land on a GitHub form pre-filled with their
// suggestion. They press "Submit new issue" there. GitHub handles auth,
// captcha and abuse — no server-side state needed.
const ISSUE_REPO = 'Logorrheique/baddle';

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
    submit: 'Ouvrir GitHub',
    hint: 'L\'envoi se fait via GitHub. Tu devras valider d\'un clic sur leur page.',
    opened: 'Suggestion préparée sur GitHub. Clique sur « Submit new issue » dans l\'onglet ouvert pour l\'envoyer.',
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
    submit: 'Open on GitHub',
    hint: 'Submitted via GitHub. One last click on their page to publish.',
    opened: 'Your suggestion is ready on GitHub. Click "Submit new issue" in the opened tab to send it.',
  },
};

interface BuiltIssue { title: string; body: string; labels: string[] }

function buildIssue(tab: Tab, fd: FormData): BuiltIssue {
  const get = (k: string) => String(fd.get(k) ?? '').trim();
  if (tab === 'new-player') {
    const name = get('name');
    return {
      title: `[Suggestion] New player: ${name}`,
      labels: ['suggestion', 'new-player'],
      body: [
        '## New player suggestion', '',
        `- **Name** : ${name}`,
        `- **Country** : ${get('country')}`,
        `- **Gender** : ${get('gender')}`,
        `- **Discipline** : ${get('discipline')}`,
        get('wikiUrl') && `- **Wikipedia** : ${get('wikiUrl')}`,
        '', get('notes') && '### Notes\n\n' + get('notes'),
      ].filter(Boolean).join('\n'),
    };
  }
  if (tab === 'correction') {
    return {
      title: `[Correction] ${get('playerName')} — ${get('field')}`,
      labels: ['suggestion', 'correction'],
      body: [
        '## Data correction', '',
        `- **Player** : ${get('playerName')}`,
        `- **Field** : ${get('field')}`,
        `- **Proposed value** : ${get('newValue')}`,
        get('source') && `- **Source** : ${get('source')}`,
        '', get('notes') && '### Notes\n\n' + get('notes'),
      ].filter(Boolean).join('\n'),
    };
  }
  return {
    title: `[Bug] ${get('title')}`,
    labels: ['suggestion', 'bug'],
    body: [
      '## Bug report', '', get('description'), '',
      get('url') && `- **URL/Context** : ${get('url')}`,
    ].filter(Boolean).join('\n'),
  };
}

function issueUrl(repo: string, issue: BuiltIssue): string {
  const params = new URLSearchParams({
    title: issue.title,
    body: issue.body,
    labels: issue.labels.join(','),
  });
  return `https://github.com/${repo}/issues/new?${params.toString()}`;
}

export function SuggestionModal({ onClose, lang }: SuggestionModalProps) {
  useEscapeKey(onClose);
  const t = L[lang];
  const [tab, setTab] = useState<Tab>('new-player');
  const [opened, setOpened] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const issue = buildIssue(tab, new FormData(e.currentTarget));
    window.open(issueUrl(ISSUE_REPO, issue), '_blank', 'noopener,noreferrer');
    setOpened(true);
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

        {opened ? (
          <p className="text-center text-ace-green text-sm py-8">{t.opened}</p>
        ) : (
          <>
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

            <form onSubmit={handleSubmit} className="space-y-3 text-sm" autoComplete="off">
              {tab === 'new-player' && <NewPlayerFields t={t} />}
              {tab === 'correction' && <CorrectionFields t={t} />}
              {tab === 'bug' && <BugFields t={t} />}

              <p className="text-[11px] text-shuttle-feather italic leading-snug">{t.hint}</p>

              <button
                type="submit"
                className="w-full py-3 rounded-card bg-shuttle-white text-court-dark font-bold uppercase tracking-wider hover:opacity-90 transition-opacity text-sm"
              >
                {t.submit}
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
