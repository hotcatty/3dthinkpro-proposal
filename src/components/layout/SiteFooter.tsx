import Link from 'next/link';
import NewsletterForm from './NewsletterForm';

const SHOP = [
  { href: '/shop', label: 'All Our Products' },
  { href: '/technology', label: 'Technology' },
] as const;

const POLICY = [
  { href: '/policies/privacy-policy', label: 'Privacy' },
  { href: '/policies/refund-policy', label: 'Return & Refund' },
  { href: '/policies/shipping-policy', label: 'Shipping' },
  { href: '/policies/terms-of-service', label: 'Payment' },
] as const;

const SUPPORT = [
  { href: '/accessibility', label: 'Accessibility' },
  { href: '/contact', label: 'Contact' },
] as const;

const SOCIAL = [
  { href: 'https://instagram.com', label: 'Instagram', src: '/brand/social-instagram.svg' },
  { href: 'https://facebook.com', label: 'Facebook', src: '/brand/social-facebook.svg' },
] as const;

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-subscribe">
        <div className="footer-subscribe-title">
          <p className="fs-24 fw-regular">Subscribe to 3DThinkPro’s Newsletter</p>
        </div>
        <div className="footer-form-block">
          <NewsletterForm />
          <p className="footer-terms fs-12">
            By subscribing I accept the{' '}
            <Link href="/policies/terms-of-service">Terms of policies</Link> of 3DThinkPro
          </p>
        </div>
      </div>

      <div className="footer-lower">
        <div className="footer-links">
          <div className="footer-col footer-col-shop">
            <p className="footer-col-title fs-16 fw-regular">Shop</p>
            <div className="footer-col-list">
              {SHOP.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <p className="footer-col-title fs-16 fw-medium">Policy</p>
            <div className="footer-col-list">
              {POLICY.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <p className="footer-col-title fs-16 fw-regular">Support</p>
            <div className="footer-col-list">
              {SUPPORT.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="footer-col footer-col-contact">
            <p className="footer-col-title footer-contact-title fs-14 fw-medium">Contact Us</p>
            <div className="footer-contact">
              <p className="footer-contact-name fs-14 fw-bold">SANDI HOLDINGS LIMITED (3DThinkPro)</p>
              <p className="fs-14 fw-medium">
                Room 01, 3/F, No. 2R Sai Yeung Choi Street South, Mong Kok, Kowloon, Hong Kong
              </p>
              <p className="fs-14 fw-medium">
                Call:{' '}
                <a href="tel:+19095665239">+1 (909) 566-5239</a>
              </p>
              <p className="fs-14 fw-medium">
                Service:{' '}
                <a href="mailto:support@3dthinkpro.com">support@3dthinkpro.com</a>
              </p>
              <div className="footer-social">
                {SOCIAL.map((item) => (
                  <a key={item.label} href={item.href} aria-label={item.label}>
                    <img src={item.src} alt="" width={20} height={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="footer-meta">
          <div className="footer-payments" aria-label="Payment methods">
            <span className="pay-mark pay-mark-amex">
              <img src="/brand/payments/amex.png" alt="American Express" width={31} height={31} />
            </span>
            <span className="pay-mark pay-mark-apple">
              <img src="/brand/payments/apple-group.svg" alt="" width={40} height={25.6076} />
              <img
                className="pay-apple-border"
                src="/brand/payments/apple-border.svg"
                alt=""
                width={38.2929}
                height={23.9005}
              />
              <img
                className="pay-apple-logo"
                src="/brand/payments/apple-logo.svg"
                alt=""
                width={8.07878}
                height={9.93007}
              />
              <img
                className="pay-apple-word"
                src="/brand/payments/apple-word.svg"
                alt="Apple Pay"
                width={19.4011}
                height={11.6425}
              />
            </span>
            <span className="pay-mark pay-mark-shop">
              <img src="/brand/payments/shop.png" alt="Shop Pay" width={40} height={40} />
            </span>
            <span className="pay-mark pay-mark-mastercard">
              <img src="/brand/payments/mastercard.png" alt="Mastercard" width={55} height={41.379} />
            </span>
            <span className="pay-mark pay-mark-gpay">
              <img src="/brand/payments/gpay.png" alt="Google Pay" width={48.147} height={25.61} />
            </span>
            <span className="pay-mark pay-mark-visa">
              <img src="/brand/payments/visa.png" alt="Visa" width={40} height={40} />
            </span>
            <span className="pay-mark pay-mark-unionpay">
              <img src="/brand/payments/unionpay.png" alt="UnionPay" width={40} height={24.991} />
            </span>
          </div>

          <div className="footer-legal">
            <Link href="/" className="footer-legal-mark" aria-label="3DThinkPro">
              <img src="/brand/footer-mark.png" alt="" width={28} height={32} />
            </Link>
            <p className="footer-legal-copy fs-14 fw-medium">
              Part of SANDI HOLDINGS LIMITED © 2026 All rights reserved.    Business Registration No. 81166213-000-09-26-A
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
