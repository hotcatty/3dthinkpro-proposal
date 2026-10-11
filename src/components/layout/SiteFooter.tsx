import Link from 'next/link';
import NewsletterForm from './NewsletterForm';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-subscribe">
            <p className="footer-subscribe-title fs-24 fw-regular">
              Subscribe to 3DThinkPro’s
              <br />
              Newsletter
            </p>
            <div className="footer-form-block">
              <NewsletterForm />
              <p className="footer-terms fs-12">
                By subscribing I accept the{' '}
                <Link href="/policies/privacy-policy">Terms of policies</Link> of 3DThinkPro
              </p>
            </div>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col footer-col-explore">
            <p className="footer-col-title fs-16 fw-regular">Explore</p>
            <div className="footer-col-list">
              <Link href="/shop">All Our Products</Link>
              <Link href="/community">Community</Link>
              <Link href="/policies/privacy-policy">Privacy</Link>
            </div>
          </div>
          <div className="footer-col footer-col-social">
            <p className="footer-col-title fs-16 fw-regular">Follow Us</p>
            <div className="footer-social">
              <a href="https://x.com" aria-label="X">
                <img src="/brand/social-x.svg" alt="" width={20} height={20} />
              </a>
              <a href="https://instagram.com" aria-label="Instagram">
                <img src="/brand/social-instagram.svg" alt="" width={20} height={20} />
              </a>
              <a href="https://facebook.com" aria-label="Facebook">
                <img src="/brand/social-facebook.svg" alt="" width={20} height={20} />
              </a>
              <a href="https://tiktok.com" aria-label="TikTok">
                <img src="/brand/social-tiktok.svg" alt="" width={20} height={20} />
              </a>
            </div>
          </div>
          <div className="footer-col footer-col-contact">
            <p className="footer-col-title fs-16 fw-medium">Contact Us</p>
            <a href="mailto:sales1@3dthinkpro.com">sales1@3dthinkpro.com</a>
          </div>
        </div>
      </div>
      <div className="footer-legal">
        <Link href="/" className="footer-legal-mark" aria-label="3DThinkPro">
          <img src="/brand/hive-mark.png" alt="" width={47} height={54} />
        </Link>
        <p className="footer-legal-copy fs-14 fw-medium">
          Part of Sandi Holdings Limited · © 2026 All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
