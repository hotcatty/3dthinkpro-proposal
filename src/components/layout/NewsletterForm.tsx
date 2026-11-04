'use client';

import { useMemo, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

const DOMAINS = ['gmail.com', 'outlook.com', 'qq.com', 'icloud.com', 'yahoo.com'];
const STORAGE_KEY = '3dthinkpro-newsletter-emails';

function loadSaved(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function saveEmail(email: string) {
  try {
    const next = [email, ...loadSaved().filter((item) => item !== email)].slice(0, 6);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function buildSuggestions(query: string, saved: string[]): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return saved.slice(0, 6);

  const fromSaved = saved.filter((item) => item.toLowerCase().includes(q));
  if (q.includes('@')) {
    const [local, domainPart = ''] = q.split('@');
    if (!local) return fromSaved;
    const domains = DOMAINS.filter((domain) => domain.startsWith(domainPart)).map(
      (domain) => `${local}@${domain}`,
    );
    return [...new Set([...fromSaved, ...domains])].slice(0, 6);
  }

  const domains = DOMAINS.map((domain) => `${q}@${domain}`);
  return [...new Set([...fromSaved, ...domains])].slice(0, 6);
}

export default function NewsletterForm() {
  const [value, setValue] = useState('');
  const [active, setActive] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const blurTimer = useRef<number>(0);

  const suggestions = useMemo(() => buildSuggestions(value, saved), [value, saved]);
  const showFloat = active && suggestions.length > 0;

  function focusField() {
    window.clearTimeout(blurTimer.current);
    setSaved(loadSaved());
    setActive(true);
  }

  function blurField() {
    window.clearTimeout(blurTimer.current);
    blurTimer.current = window.setTimeout(() => {
      if (!wrapRef.current?.contains(document.activeElement)) setActive(false);
    }, 120);
  }

  return (
    <form
      className="email-form"
      action="/contact"
      method="get"
      onSubmit={() => {
        const email = value.trim();
        if (email) saveEmail(email);
      }}
    >
      <div ref={wrapRef} className="email-field-wrap">
        <input
          className="text-field"
          type="text"
          name="email"
          value={value}
          placeholder="Your email please."
          required
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="email"
          aria-autocomplete="list"
          aria-expanded={showFloat}
          aria-controls="email-suggest-float"
          onChange={(event) => {
            setValue(event.target.value);
            setActive(true);
            setSaved(loadSaved());
          }}
          onFocus={focusField}
          onBlur={blurField}
        />
        {showFloat && (
          <div id="email-suggest-float" className="suggest-float" role="listbox">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                className="suggest-hit"
                role="option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setValue(item);
                  setActive(false);
                }}
              >
                <span className="suggest-hit-label">{item}</span>
                {saved.includes(item) && (
                  <span
                    className="suggest-hit-clear"
                    aria-hidden="true"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const next = loadSaved().filter((email) => email !== item);
                      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                      setSaved(next);
                    }}
                  >
                    <Icon name="x" size={16} />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <Button variant="solid-white" type="submit">
        Join
      </Button>
    </form>
  );
}
