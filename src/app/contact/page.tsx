export default function ContactPage() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>

      {/* Header */}
      <section style={{
        padding: '80px 32px 60px',
        background: '#080808',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p className="label" style={{ marginBottom: 12 }}>Get in Touch</p>
          <h1 className="heading" style={{ marginBottom: 24 }}>Contact Us</h1>
          <div className="divider" />
          <p style={{ color: '#888', fontSize: 16, maxWidth: 480, lineHeight: 1.8, marginTop: 20 }}>
            For product inquiries, custom orders, or B2B partnerships — our team responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact content */}
      <section className="section">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>

            {/* Contact info */}
            <div>
              <p className="label" style={{ marginBottom: 32 }}>Contact Information</p>

              {/* B2C */}
              <div style={{ marginBottom: 40, padding: '28px', background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#cc0000', marginBottom: 12 }}>Retail Orders</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 8 }}>Consumer Sales</p>
                <a href="mailto:b2c@3dthinkpro.com" style={{
                  color: '#888', fontSize: 14, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span>→</span> b2c@3dthinkpro.com
                </a>
              </div>

              {/* B2B */}
              <div style={{ marginBottom: 40, padding: '28px', background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#cc0000', marginBottom: 12 }}>Wholesale & OEM</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 8 }}>Business Partnerships</p>
                <a href="mailto:Yinghao@3dthinkpro.com" style={{
                  color: '#888', fontSize: 14, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span>→</span> Yinghao@3dthinkpro.com
                </a>
              </div>

              {/* Address */}
              <div style={{ padding: '28px', background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginBottom: 12 }}>Factory Address</p>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8 }}>
                  No. 288 Juming Road<br />
                  Taizhou Bay New Area<br />
                  Taizhou, Zhejiang Province<br />
                  China 318000
                </p>
                <p style={{ fontSize: 12, color: '#444', marginTop: 16 }}>www.3dthinkpro.com</p>
              </div>
            </div>

            {/* Inquiry form (static) */}
            <div>
              <p className="label" style={{ marginBottom: 32 }}>Send an Inquiry</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {[
                  { label: 'Your Name', placeholder: 'Full name' },
                  { label: 'Email Address', placeholder: 'you@example.com' },
                  { label: 'Company (Optional)', placeholder: 'Company or brand name' },
                  { label: 'Motorcycle Model', placeholder: 'e.g. Harley-Davidson Sportster 1200' },
                ].map(field => (
                  <div key={field.label}>
                    <p className="label" style={{ marginBottom: 8 }}>{field.label}</p>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      disabled
                      style={{
                        width: '100%',
                        background: '#0f0f0f',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#888',
                        padding: '14px 16px',
                        fontSize: 13,
                        outline: 'none',
                      }}
                    />
                  </div>
                ))}

                <div>
                  <p className="label" style={{ marginBottom: 8 }}>Message</p>
                  <textarea
                    placeholder="Describe your requirements or questions..."
                    disabled
                    rows={5}
                    style={{
                      width: '100%',
                      background: '#0f0f0f',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#888',
                      padding: '14px 16px',
                      fontSize: 13,
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  disabled
                  style={{
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#444',
                    padding: '16px 32px',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'not-allowed',
                  }}
                >
                  Send Message (Coming Soon)
                </button>

                <p style={{ fontSize: 12, color: '#444', lineHeight: 1.6 }}>
                  Form submission coming in next sprint. For now, email us directly at{' '}
                  <a href="mailto:Yinghao@3dthinkpro.com" style={{ color: '#666' }}>Yinghao@3dthinkpro.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
