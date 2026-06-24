import Link from 'next/link';

export default function TechnologyPage() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        padding: '80px 32px 60px',
        background: '#080808',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p className="label" style={{ marginBottom: 12 }}>Engineering Innovation</p>
          <h1 className="heading" style={{ marginBottom: 24 }}>
            The Science<br />
            Behind the Seat
          </h1>
          <div className="divider" />
          <p style={{ color: '#888', fontSize: 16, maxWidth: 520, lineHeight: 1.8, marginTop: 20 }}>
            3D-printed TPU lattice structures redefine what a motorcycle seat can be — engineered at the molecular level for precision performance.
          </p>
        </div>
      </section>

      {/* Core Innovation */}
      <section className="section">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div>
              <p className="label" style={{ marginBottom: 16 }}>Core Technology</p>
              <h2 className="heading" style={{ marginBottom: 24 }}>TPU Lattice<br />Structure</h2>
              <div className="divider" />
              <p style={{ color: '#888', fontSize: 15, lineHeight: 1.8, marginTop: 20, marginBottom: 32 }}>
                Our proprietary TPU (Thermoplastic Polyurethane) lattice matrix is 3D-printed with micrometer precision. Unlike foam, each node in the lattice is engineered to specific load and flex parameters.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(255,255,255,0.05)' }}>
                {[
                  { label: 'Material', value: 'Medical-grade TPU' },
                  { label: 'Layer Resolution', value: '0.1mm precision' },
                  { label: 'Print Technology', value: 'FDM / SLS hybrid' },
                  { label: 'Density Zones', value: 'Variable by seating area' },
                  { label: 'Durability', value: '5× longer than foam' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', background: '#0a0a0a', padding: '16px 20px' }}>
                    <span style={{ fontSize: 12, color: '#555', width: 160, flexShrink: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: '#ddd' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{
                background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)',
                aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 60%, rgba(204,0,0,0.06) 0%, transparent 60%)' }} />
                <div style={{ textAlign: 'center', position: 'relative' }}>
                  <div style={{ fontSize: 64 }}>⚙️</div>
                  <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#333', marginTop: 12 }}>Lattice Cross-Section</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {[
                  { label: 'Waterproof', icon: '💧', desc: 'Fully sealed cell structure' },
                  { label: 'UV Resistant', icon: '☀️', desc: 'No surface degradation' },
                  { label: 'Anti-Vibration', icon: '〰️', desc: 'Engineered damping zones' },
                  { label: 'Custom Shape', icon: '✏️', desc: 'Any geometry printable' },
                ].map(f => (
                  <div key={f.label} style={{ background: '#0f0f0f', padding: '24px 20px' }}>
                    <p style={{ fontSize: 20, marginBottom: 10 }}>{f.icon}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'white', marginBottom: 4 }}>{f.label}</p>
                    <p style={{ fontSize: 12, color: '#555' }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="section" style={{ background: '#080808' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <p className="label" style={{ marginBottom: 16 }}>Performance Comparison</p>
          <h2 className="heading" style={{ marginBottom: 40 }}>3D Print vs. Traditional Foam</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'rgba(255,255,255,0.05)' }}>
            {/* Header */}
            <div style={{ background: '#0a0a0a', padding: '20px 24px' }}>
              <p className="label">Spec</p>
            </div>
            <div style={{ background: '#0a0a0a', padding: '20px 24px', borderBottom: '2px solid #cc0000' }}>
              <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#cc0000' }}>3DThinkPro</p>
            </div>
            <div style={{ background: '#0a0a0a', padding: '20px 24px' }}>
              <p className="label">Traditional Foam</p>
            </div>

            {[
              ['Waterproof', '✓ Fully sealed', '✗ Absorbs moisture'],
              ['Durability', '5× longer lifespan', 'Degrades in 2-4 years'],
              ['UV Resistance', '✓ No degradation', '✗ Cracks & fades'],
              ['Custom Design', '✓ Any shape', '⚠ Limited by mold'],
              ['Weight', '~20% lighter', 'Standard'],
              ['Breathability', '✓ Open lattice', '⚠ Varies by cover'],
            ].map(([spec, thinkpro, foam]) => (
              <>
                <div key={spec} style={{ background: '#0a0a0a', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{spec}</p>
                </div>
                <div style={{ background: '#0a0a0a', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: 13, color: thinkpro.startsWith('✓') ? '#66cc66' : 'white' }}>{thinkpro}</p>
                </div>
                <div style={{ background: '#0a0a0a', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: 13, color: '#555' }}>{foam}</p>
                </div>
              </>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section style={{ padding: '60px 32px', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
            <p className="label">Certified to</p>
            {['IATF 16949', 'ISO 16949', 'OEM Grade'].map(cert => (
              <div key={cert} style={{
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '12px 24px',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888',
              }}>{cert}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <h2 className="heading" style={{ marginBottom: 12 }}>Experience the Difference</h2>
            <p style={{ color: '#666', fontSize: 14 }}>Find your motorcycle model and order direct from the factory.</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/shop" className="btn-primary">Shop Now →</Link>
            <Link href="/contact" className="btn-outline">Request Sample</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
