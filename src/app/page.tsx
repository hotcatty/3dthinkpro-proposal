import Link from 'next/link';
import { getProducts, ShopifyProduct } from '@/lib/shopify';
import { SeriesGrid, FeaturedProducts } from '@/components/HomeClient';

export const revalidate = 0;

export default async function HomePage() {
  let products: ShopifyProduct[] = [];
  try {
    products = await getProducts();
  } catch {}

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />
        {/* Red left accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '40%', background: '#cc0000' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px', width: '100%', position: 'relative' }}>
          <div style={{ maxWidth: 720 }}>
            <p className="label" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'inline-block', width: 24, height: 2, background: '#cc0000' }} />
              3DThinkPro · Est. 2004
            </p>

            <h1 className="display" style={{ marginBottom: 32 }}>
              Engineered<br />
              for the<br />
              <span style={{ color: '#cc0000' }}>Road.</span>
            </h1>

            <p style={{ color: '#888', fontSize: 16, lineHeight: 1.8, maxWidth: 480, marginBottom: 48 }}>
              Premium 3D-printed motorcycle seats crafted with 20+ years of manufacturing expertise. Trusted by Harley-Davidson and Ducati worldwide.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/shop" className="btn-primary">Shop Now →</Link>
              <Link href="/technology" className="btn-outline">Our Technology</Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 48, marginTop: 64, paddingTop: 48, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { num: '20+', label: 'Years Experience' },
                { num: '3M+', label: 'Units / Year' },
                { num: '50+', label: 'SKU Available' },
                { num: '2', label: 'OEM Partners' },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{s.num}</p>
                  <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginTop: 4 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right decoration */}
        <div style={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          width: '38%', height: '65%',
          background: 'linear-gradient(135deg, #111 0%, #0a0a0a 100%)',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 80, opacity: 0.25,
        }}>🏍</div>
      </section>

      {/* ── SERIES ───────────────────────────────────────── */}
      <section className="section" style={{ background: '#0a0a0a' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
            <div>
              <p className="label" style={{ marginBottom: 12 }}>Product Range</p>
              <h2 className="heading">Our Series</h2>
            </div>
            <Link href="/shop" className="btn-outline">View All</Link>
          </div>
          <SeriesGrid />
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────── */}
      {products.length > 0 && (
        <section className="section" style={{ background: '#0a0a0a' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
              <div>
                <p className="label" style={{ marginBottom: 12 }}>Live Inventory</p>
                <h2 className="heading">Featured Products</h2>
              </div>
              <Link href="/shop" className="btn-outline">All Products</Link>
            </div>
            <FeaturedProducts products={products} />
          </div>
        </section>
      )}

      {/* ── 3D TECH HIGHLIGHT ────────────────────────────── */}
      <section className="section" style={{ background: '#080808' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <p className="label" style={{ marginBottom: 16 }}>Core Technology</p>
              <h2 className="heading" style={{ marginBottom: 24 }}>3D-Printed<br />Precision</h2>
              <div className="divider" />
              <p style={{ color: '#888', fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
                One of the few manufacturers worldwide with mass-production capability for 3D-printed motorcycle seats. Advanced TPU lattice structure solves the three core pain points of traditional foam seats.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { title: 'Waterproof', desc: 'No degradation from moisture or UV exposure' },
                  { title: 'Durability', desc: 'Material stability far beyond foam alternatives' },
                  { title: 'Customization', desc: 'Unlimited design freedom — any geometry possible' },
                ].map((item, i) => (
                  <div key={item.title} style={{ display: 'flex', gap: 20 }}>
                    <span style={{ fontSize: 11, color: '#cc0000', fontWeight: 700, marginTop: 2, minWidth: 20 }}>{String(i+1).padStart(2,'0')}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white', marginBottom: 4 }}>{item.title}</p>
                      <p style={{ fontSize: 13, color: '#666' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 40 }}>
                <Link href="/technology" className="btn-primary">Explore Technology →</Link>
              </div>
            </div>

            {/* Visual */}
            <div style={{
              background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)',
              aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(204,0,0,0.08) 0%, transparent 70%)' }} />
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: 80, marginBottom: 16 }}>⚙️</div>
                <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#333' }}>3D Lattice Structure</p>
              </div>
              {/* Corner accents */}
              {[
                { top: 16, left: 16, borderTop: '2px solid #cc0000', borderLeft: '2px solid #cc0000' },
                { top: 16, right: 16, borderTop: '2px solid #cc0000', borderRight: '2px solid #cc0000' },
                { bottom: 16, left: 16, borderBottom: '2px solid #cc0000', borderLeft: '2px solid #cc0000' },
                { bottom: 16, right: 16, borderBottom: '2px solid #cc0000', borderRight: '2px solid #cc0000' },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: 20, height: 20, ...s }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OEM TRUST BAR ────────────────────────────────── */}
      <section style={{ padding: '40px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0a' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
          <p className="label">Trusted by</p>
          {['HARLEY-DAVIDSON', 'DUCATI', 'OEM Partners Worldwide'].map(brand => (
            <span key={brand} style={{
              fontSize: brand.length > 12 ? 11 : 13,
              fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: brand === 'OEM Partners Worldwide' ? '#2a2a2a' : '#444',
            }}>{brand}</span>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ padding: '80px 32px', background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 40 }}>
          <div>
            <h2 className="heading" style={{ marginBottom: 12 }}>Ready to Upgrade?</h2>
            <p style={{ color: '#666', fontSize: 15 }}>Find the perfect seat for your motorcycle.</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/shop" className="btn-primary">Shop by Model</Link>
            <Link href="/contact" className="btn-outline">Get Custom Quote</Link>
          </div>
        </div>
      </section>
    </>
  );
}
