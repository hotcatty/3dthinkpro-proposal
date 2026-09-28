'use client';

import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

export type LocaleChoice = {
  country: string;
  language: string;
};

export const LOCALE_COUNTRIES = [
  { value: 'jp-jpy', label: 'Japan (¥)' },
  { value: 'us-usd', label: 'United States ($)' },
  { value: 'de-eur', label: 'Germany (€)' },
] as const;

export const LOCALE_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
] as const;

export const DEFAULT_LOCALE: LocaleChoice = {
  country: 'jp-jpy',
  language: 'en',
};

type Props = {
  country: string;
  language: string;
  onCountryChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onApply: () => void;
};

export default function LocalePopover({
  country,
  language,
  onCountryChange,
  onLanguageChange,
  onApply,
}: Props) {
  return (
    <div
      className="locale-pop"
      role="dialog"
      aria-labelledby="locale-pop-title"
      aria-modal="true"
    >
      <div className="locale-pop-head">
        <h2 id="locale-pop-title" className="locale-pop-title">
          Select Country / Currency and Language
        </h2>
        <hr className="locale-pop-rule" />
      </div>
      <form
        className="locale-pop-form"
        onSubmit={(event) => {
          event.preventDefault();
          onApply();
        }}
      >
        <div className="locale-pop-fields">
          <label className="locale-field">
            <span className="locale-field-label">COUNTRY / CURRENCY</span>
            <span className="locale-select">
              <select
                name="country"
                value={country}
                onChange={(event) => onCountryChange(event.target.value)}
              >
                {LOCALE_COUNTRIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Icon name="chevron-down" size={20} />
            </span>
          </label>
          <label className="locale-field">
            <span className="locale-field-label">LANGUAGE</span>
            <span className="locale-select">
              <select
                name="language"
                value={language}
                onChange={(event) => onLanguageChange(event.target.value)}
              >
                {LOCALE_LANGUAGES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Icon name="chevron-down" size={20} />
            </span>
          </label>
        </div>
        <div className="locale-pop-actions">
          <Button variant="solid" type="submit">
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
}
