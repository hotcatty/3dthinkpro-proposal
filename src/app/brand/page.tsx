import Link from 'next/link';

export default function BrandPage() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        padding: '80px 32px 60px',
        background: '#080808',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(to bottom, #cc0000, transparent)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p className="label" style={{ marginBottom: 12 }}>Our Story</p>
          <h1 className="heading" style={{ marginBottom: 24 }}>
            20 Years.<br />
            One Mission.
          </h1>
          <div className="divider" />
          <p style={{ color: '#888', fontSize: 16, maxWidth: 560, lineHeight: 1.8, marginTop: 20 }}>
            From a workshop in Taizhou to OEM partner of Harley-Davidson and Ducati — the 3DThinkPro story is one of relentless engineering.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <p className="label" style={{ marginBottom: 40 }}>Company Milestones</p>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 60, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.06)' }} />

            {[
              { year: '2004', title: 'Founded in Taizhou', desc: 'Yinghao established in Zhejiang Province, focused on high-end motorcycle seat manufacturing.' },
              { year: '2010', title: 'First OEM Contract', desc: 'Secured first OEM agreement with international motorcycle brand, entering global supply chain.' },
              { year: '2018', title: 'IATF 16949 Certified', desc: 'Achieved automotive quality management certification, qualifying for tier-1 partnerships.' },
              { year: '2021', title: '3D Printing Breakthrough', desc: 'Became one of the first manufacturers worldwide to achieve mass production of 3D-printed motorcycle seats.' },
              { year: '2023', title: 'Harley-Davidson Partnership', desc: 'Selected as official OEM partner by Harley-Davidson and Ducati for premium 3D-printed seat components.' },
              { year: '2026', title: '3DThinkPro Direct', desc: 'Launching 3DThinkPro.com — our direct-to-consumer brand bringing factory quality to global riders.' },
            ].map((item, i) => (
              <div key={item.year} style={{ display: 'flex', gap: 40, marginBottom: 48, position: 'relative', paddingLeft: 100 }}>
                {/* Year */}
                <div style={{ position: 'absolute', left: 0, top: 2 }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: '#cc0000', letterSpacing: '0.1em' }}>{item.year}</p>
                </div>
                {/* Dot */}
                <div style={{
                  position: 'absolute', left: 56, top: 4,
                  width: 9, height: 9, borderRadius: '50%',
                  background: i === 5 ? '#cc0000' : '#333',
                  border: '2px solid',
                  borderColor: i === 5 ? '#cc0000' : '#222',
                }} />
                {/* Content */}
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{item.title}</p>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 32px', background: '#080808', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(255,255,255,0.05)' }}>
            {[
              { num: '20+', label: 'Years Experience', sub: 'Est. 2004' },
              { num: '3M+', label: 'Units / Year', sub: '3 Production Bases' },
              { num: '300K+', label: 'Sq Ft New Facility', sub: 'Opening 2026' },
              { num: '2', label: 'OEM Partners', sub: 'Harley-Davidson · Ducati' },
            ].map(s => (
              <div key={s.label} style={{ padding: '40px 32px', background: '#0a0a0a' }}>
                <p style={{ fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: 8 }}>{s.num}</p>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: 11, color: '#444' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturing Process */}
      <section className="section">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <p className="label" style={{ marginBottom: 16 }}>Manufacturing Excellence</p>
          <h2 className="heading" style={{ marginBottom: 40 }}>End-to-End Production</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'rgba(255,255,255,0.05)' }}>
            {[
              { step: '01', name: 'Injection Molding', icon: '🔩' },
              { step: '02', name: 'Foaming', icon: '🧱' },
              { step: '03', name: 'Cutting', icon: '✂️' },
              { step: '04', name: 'Hot Stamping', icon: '🔥' },
              { step: '05', name: 'Embroidery', icon: '🧵' },
              { step: '06', name: 'Sewing', icon: '🪡' },
              { step: '07', name: 'Assembly', icon: '⚙️' },
            ].map(s => (
              <div key={s.step} style={{ background: '#0a0a0a', padding: '28px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 24, marginBottom: 12 }}>{s.icon}</p>
                <p style={{ fontSize: 10, color: '#cc0000', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 6 }}>{s.step}</p>
                <p style={{ fontSize: 11, color: '#777', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3 }}>{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 32px', background: '#080808', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <h2 className="heading" style={{ marginBottom: 12 }}>Factory to Your Door</h2>
            <p style={{ color: '#666', fontSize: 14 }}>No middlemen. Direct from the manufacturer that supplies Harley-Davidson.</p>
          </div>
          <Link href="/shop" className="btn-primary">Shop Direct →</Link>
        </div>
      </section>
    </div>
  );
}
