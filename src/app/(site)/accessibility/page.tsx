import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility — 3DThinkPro',
  description: 'Help using the 3DThinkPro website.',
};

export default function AccessibilityPage() {
  return (
    <div className="policy-page">
      <div className="policy-intro">
        <h1 className="fs-32 fw-regular policy-title">Accessibility</h1>
      </div>
      <div className="policy-body">
        <p>
          If you have trouble using this website, email support@3dthinkpro.com and we will help you complete your request.
        </p>
      </div>
    </div>
  );
}
