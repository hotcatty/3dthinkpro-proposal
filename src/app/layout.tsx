import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: '3DThinkPro — Precision Motorcycle Seats',
  description: 'Premium 3D-printed motorcycle seats. 20 years of manufacturing excellence, trusted by Harley-Davidson and Ducati.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Navigation */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10,10,10,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#cc0000', fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>3D</span>
              <span style={{ color: 'white', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>ThinkPro</span>
            </Link>

            {/* Nav links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              <Link href="/shop" className="nav-link">Shop</Link>
              <Link href="/technology" className="nav-link">Technology</Link>
              <Link href="/brand" className="nav-link">Brand</Link>
              <Link href="/contact" className="nav-link">Contact</Link>
            </nav>

            {/* CTA */}
            <Link href="/shop" className="btn-primary" style={{ padding: '10px 20px', fontSize: '11px' }}>
              Shop Now
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={{ paddingTop: 64 }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '60px 32px 40px',
          marginTop: 0,
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 60 }}>
              {/* Brand */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <span style={{ color: '#cc0000', fontSize: 18, fontWeight: 900 }}>3D</span>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>ThinkPro</span>
                </div>
                <p style={{ color: '#666', fontSize: 13, lineHeight: 1.7, maxWidth: 280 }}>
                  Premium 3D-printed motorcycle seats engineered for comfort and performance. 20+ years of manufacturing excellence.
                </p>
                <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', border: '1px solid #333', padding: '6px 12px' }}>IATF 16949</span>
                  <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', border: '1px solid #333', padding: '6px 12px' }}>ISO 16949</span>
                </div>
              </div>

              {/* Products */}
              <div>
                <p className="label" style={{ marginBottom: 20 }}>Products</p>
                {['Harley-Davidson Series', 'Vespa Series', 'Off-Road Series', 'Scooter Series', 'Custom Orders'].map(item => (
                  <p key={item} style={{ color: '#555', fontSize: 13, marginBottom: 10 }}>{item}</p>
                ))}
              </div>

              {/* Company */}
              <div>
                <p className="label" style={{ marginBottom: 20 }}>Company</p>
                {[
                  { label: 'Brand Story', href: '/brand' },
                  { label: 'Technology', href: '/technology' },
                  { label: 'Contact', href: '/contact' },
                ].map(item => (
                  <p key={item.label} style={{ marginBottom: 10 }}>
                    <Link href={item.href} style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}
                    >{item.label}</Link>
                  </p>
                ))}
              </div>

              {/* Contact */}
              <div>
                <p className="label" style={{ marginBottom: 20 }}>Contact</p>
                <p style={{ color: '#555', fontSize: 13, marginBottom: 8 }}>Yinghao@3dthinkpro.com</p>
                <p style={{ color: '#555', fontSize: 12, lineHeight: 1.6, marginTop: 16 }}>
                  No. 288 Juming Rd,<br/>
                  Taizhou Bay New Area,<br/>
                  Taizhou, Zhejiang, China
                </p>
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: '#333', fontSize: 12 }}>© 2026 3DThinkPro · Taizhou Yinghao Auto & Moto Parts Co., Ltd.</p>
              <p style={{ color: '#333', fontSize: 12 }}>www.3dthinkpro.com</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
