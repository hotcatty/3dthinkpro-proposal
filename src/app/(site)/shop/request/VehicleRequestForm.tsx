'use client';

import { useRef, useState, type FormEvent } from 'react';

const NOTES_MIN_HEIGHT = 114;

type Status = 'idle' | 'sending' | 'sent' | 'error';

function growNotes(el: HTMLTextAreaElement) {
  el.style.height = `${NOTES_MIN_HEIGHT}px`;
  el.style.height = `${Math.max(NOTES_MIN_HEIGHT, el.scrollHeight)}px`;
}

export default function VehicleRequestForm() {
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch('/api/vehicle-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          brand: data.get('brand'),
          model: data.get('model'),
          year: data.get('year'),
          notes: data.get('notes'),
          company: data.get('company'),
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setStatus('error');
        setMessage(result.error || 'Could not send the request.');
        return;
      }
      setStatus('sent');
      form.reset();
      if (notesRef.current) growNotes(notesRef.current);
    } catch {
      setStatus('error');
      setMessage('Could not send the request.');
    }
  }

  if (status === 'sent') {
    return (
      <p className="vehicle-request-done fs-14 fw-regular c-black-80">
        Thanks — we received your bike info and will contact you once it becomes available.
      </p>
    );
  }

  return (
    <form className="vehicle-request-form" onSubmit={onSubmit} noValidate>
      <div className="vehicle-request-fields">
        <label className="vehicle-field">
          <span className="vehicle-label">
            FULL NAME <span className="vehicle-req">*</span>
          </span>
          <input className="vehicle-input" name="name" type="text" required autoComplete="name" />
        </label>

        <label className="vehicle-field">
          <span className="vehicle-label">
            EMAIL <span className="vehicle-req">*</span>
          </span>
          <input className="vehicle-input" name="email" type="email" required autoComplete="email" />
        </label>

        <div className="vehicle-row">
          <label className="vehicle-field">
            <span className="vehicle-label">
              BRAND <span className="vehicle-req">*</span>
            </span>
            <input className="vehicle-input" name="brand" type="text" required autoComplete="off" />
          </label>
          <label className="vehicle-field">
            <span className="vehicle-label">
              MODEL <span className="vehicle-req">*</span>
            </span>
            <input className="vehicle-input" name="model" type="text" required autoComplete="off" />
          </label>
          <label className="vehicle-field">
            <span className="vehicle-label">
              YEAR <span className="vehicle-req">*</span>
            </span>
            <input className="vehicle-input" name="year" type="text" required inputMode="numeric" autoComplete="off" />
          </label>
        </div>

        <label className="vehicle-field">
          <span className="vehicle-label">OPTIONAL NOTES</span>
          <textarea
            ref={notesRef}
            className="vehicle-input vehicle-notes"
            name="notes"
            rows={1}
            onInput={(event) => growNotes(event.currentTarget)}
          />
        </label>

        <label className="vehicle-honeypot" aria-hidden="true">
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button className="vehicle-send" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending' : 'Send'}
      </button>

      {status === 'error' && message && (
        <p className="vehicle-request-error" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
