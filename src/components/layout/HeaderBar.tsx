'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/components/ui/Icon';
import IconButton from '@/components/ui/IconButton';
import { SHOP_BRANDS } from '@/lib/catalog';
import LocalePopover, {
  DEFAULT_LOCALE,
  type LocaleChoice,
} from './LocalePopover';

const LOCALE_STORAGE_KEY = '3dthinkpro.locale';

export type SearchHit = {
  handle: string;
  title: string;
};

function canHover() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
}

export default function HeaderBar({
  count,
  catalog = [],
}: {
  count: number;
  catalog?: SearchHit[];
}) {
  const path = usePathname();
  const router = useRouter();
  const onHome = path === '/';
  const onDarkHero = onHome || path.startsWith('/technology');
  const onLightHero = path.startsWith('/community');
  const [scrolled, setScrolled] = useState(false);
  const [barHover, setBarHover] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchHover, setSearchHover] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [locale, setLocale] = useState<LocaleChoice>(DEFAULT_LOCALE);
  const [localeDraft, setLocaleDraft] = useState<LocaleChoice>(DEFAULT_LOCALE);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const shopCloseTimer = useRef<number>(0);
  const blurTimer = useRef<number>(0);

  const searchOpen = searchHover || searchActive;
  const overlayOpen = shopOpen || searchOpen || localeOpen || menuOpen;
  const chrome =
    onDarkHero && !scrolled && !barHover && !overlayOpen
      ? 'pinned'
      : onLightHero && !scrolled && !barHover && !overlayOpen
        ? 'over-light'
        : 'scrolled';
  const onWhite = !onDarkHero && !onLightHero && !scrolled && !overlayOpen;

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog.slice(0, 6);
    return catalog
      .filter((item) => item.title.toLowerCase().includes(q) || item.handle.toLowerCase().includes(q))
      .slice(0, 6);
  }, [catalog, query]);

  // Hover only expands the field; float appears after click/focus into input.
  const showFloat = searchActive && suggestions.length > 0;

  function openShop() {
    window.clearTimeout(shopCloseTimer.current);
    if (localeOpen) closeLocale();
    setShopOpen(true);
  }

  function scheduleCloseShop() {
    window.clearTimeout(shopCloseTimer.current);
    shopCloseTimer.current = window.setTimeout(() => setShopOpen(false), 160);
  }

  function closeSearch() {
    setSearchActive(false);
    setSearchHover(false);
    setQuery('');
  }

  function closeMenu() {
    setMenuOpen(false);
    setShopOpen(false);
  }

  function toggleMenu() {
    if (menuOpen) {
      closeMenu();
      return;
    }
    closeSearch();
    closeLocale();
    setMenuOpen(true);
  }

  function closeLocale() {
    setLocaleOpen(false);
    setLocaleDraft(locale);
  }

  function openLocale() {
    setShopOpen(false);
    setMenuOpen(false);
    closeSearch();
    setLocaleDraft(locale);
    setLocaleOpen(true);
  }

  function applyLocale() {
    setLocale(localeDraft);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(localeDraft));
    } catch {
      /* ignore quota / private mode */
    }
    setLocaleOpen(false);
  }

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as LocaleChoice;
      if (saved?.country && saved?.language) {
        setLocale(saved);
        setLocaleDraft(saved);
      }
    } catch {
      /* ignore broken storage */
    }
  }, []);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [path]);

  useEffect(() => {
    setShopOpen(false);
    setMenuOpen(false);
    closeSearch();
    closeLocale();
    setBarHover(false);
  }, [path]);

  useEffect(() => {
    if (!searchActive) return;
    searchInputRef.current?.focus();
  }, [searchActive]);

  useEffect(() => {
    if (!shopOpen && !searchActive && !localeOpen && !menuOpen) return undefined;

    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setShopOpen(false);
        setMenuOpen(false);
        closeSearch();
        closeLocale();
        setBarHover(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShopOpen(false);
        setMenuOpen(false);
        closeSearch();
        closeLocale();
      }
    };

    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [shopOpen, searchActive, localeOpen, menuOpen, locale]);

  useEffect(
    () => () => {
      window.clearTimeout(shopCloseTimer.current);
      window.clearTimeout(blurTimer.current);
    },
    [],
  );

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header
      ref={rootRef}
      className={`site-header ${chrome}${shopOpen ? ' is-open' : ''}${menuOpen ? ' is-menu' : ''}${onWhite ? ' has-edge' : ''}${localeOpen ? ' is-locale-open' : ''}`}
      onMouseEnter={() => setBarHover(true)}
      onMouseLeave={() => {
        setBarHover(false);
        if (!menuOpen) setShopOpen(false);
        if (!searchActive) setSearchHover(false);
        window.clearTimeout(shopCloseTimer.current);
      }}
    >
      {localeOpen && (
        <button
          type="button"
          className="site-scrim"
          aria-label="Close"
          onClick={closeLocale}
        />
      )}
      <div className="site-header-inner">
        <div className="nav-left">
          <Link href="/" className="nav-logo">
            3DThinkPro
          </Link>
          <span className="nav-menu-wrap">
            <IconButton
              label={menuOpen ? 'Close menu' : 'Menu'}
              expanded={menuOpen}
              onClick={toggleMenu}
            >
              <Icon name={menuOpen ? 'x' : 'menu'} size={20} />
            </IconButton>
          </span>
          <nav className="nav-links">
            <Link
              href="/shop"
              className={`nav-link${shopOpen ? ' is-on' : ''}`}
              aria-expanded={shopOpen}
              aria-haspopup="true"
              onMouseEnter={() => {
                if (canHover()) openShop();
              }}
              onMouseLeave={() => {
                if (canHover()) scheduleCloseShop();
              }}
            >
              Shop
            </Link>
            <Link href="/community" className="nav-link">
              Community
            </Link>
            <Link href="/technology" className="nav-link">
              Tech
            </Link>
          </nav>
        </div>
        <div className="nav-right">
          <div
            ref={searchWrapRef}
            className="nav-search-wrap"
            onMouseEnter={() => setSearchHover(true)}
            onMouseLeave={() => {
              if (!searchActive) setSearchHover(false);
            }}
          >
            <form
              className={`nav-search${searchOpen ? ' is-open' : ''}`}
              action="/shop"
              method="get"
              onSubmit={(event) => {
                if (suggestions[0] && query.trim()) {
                  event.preventDefault();
                  router.push(`/products/${encodeURIComponent(suggestions[0].handle)}`);
                  closeSearch();
                }
              }}
            >
              <button
                type={searchOpen ? 'submit' : 'button'}
                className="nav-search-icon"
                aria-label="Search"
                onClick={() => {
                  if (!searchOpen) {
                    if (localeOpen) closeLocale();
                    closeMenu();
                    setSearchActive(true);
                  }
                }}
              >
                <Icon name="search" size={20} />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                name="q"
                value={query}
                placeholder="Search"
                aria-label="Search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                inputMode="search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={showFloat}
                aria-controls="nav-search-float"
                tabIndex={searchOpen ? 0 : -1}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => {
                  window.clearTimeout(blurTimer.current);
                  setSearchActive(true);
                }}
                onBlur={() => {
                  window.clearTimeout(blurTimer.current);
                  blurTimer.current = window.setTimeout(() => {
                    if (!searchWrapRef.current?.contains(document.activeElement)) {
                      setSearchActive(false);
                      setSearchHover(false);
                    }
                  }, 120);
                }}
              />
            </form>
            {showFloat && (
              <div id="nav-search-float" className="nav-search-float" role="listbox">
                {suggestions.map((item) => (
                  <Link
                    key={item.handle}
                    href={`/products/${encodeURIComponent(item.handle)}`}
                    className="nav-search-hit"
                    role="option"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => closeSearch()}
                  >
                    <span className="nav-search-hit-label">{item.title}</span>
                    <span
                      className="nav-search-hit-clear"
                      aria-hidden="true"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        closeSearch();
                      }}
                    >
                      <Icon name="x" size={16} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="nav-locale-wrap">
            <IconButton
              label="Language"
              expanded={localeOpen}
              onClick={() => {
                if (localeOpen) closeLocale();
                else openLocale();
              }}
            >
              <Icon name="language" size={20} />
            </IconButton>
            {localeOpen && (
              <LocalePopover
                country={localeDraft.country}
                language={localeDraft.language}
                onCountryChange={(country) => setLocaleDraft((cur) => ({ ...cur, country }))}
                onLanguageChange={(language) => setLocaleDraft((cur) => ({ ...cur, language }))}
                onApply={applyLocale}
              />
            )}
          </div>
          <IconButton href="/cart" label="Cart">
            <Icon name="bag" size={20} />
            {count > 0 && <span className="cart-dot" />}
          </IconButton>
        </div>
      </div>
      {searchActive ? (
        <form
          className="nav-search-sheet"
          action="/shop"
          method="get"
          onSubmit={(event) => {
            if (suggestions[0] && query.trim()) {
              event.preventDefault();
              router.push(`/products/${encodeURIComponent(suggestions[0].handle)}`);
              closeSearch();
            }
          }}
        >
          <input
            type="text"
            name="q"
            value={query}
            placeholder="Search your bike model"
            aria-label="Search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode="search"
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>
      ) : null}
      <nav className="nav-mobile" aria-label="Menu">
        <div className="nav-mobile-item">
          <div className="nav-mobile-row">
            <Link href="/shop" className="nav-mobile-link" onClick={closeMenu}>
              Shop
            </Link>
            <button
              type="button"
              className={`nav-mobile-more${shopOpen ? ' is-on' : ''}`}
              aria-expanded={shopOpen}
              aria-label={shopOpen ? 'Hide brands' : 'Show brands'}
              onClick={() => setShopOpen((open) => !open)}
            >
              <Icon name="chevron-down" size={16} />
            </button>
          </div>
          {shopOpen ? (
            <div className="nav-mobile-brands">
              {SHOP_BRANDS.map((brand) => (
                <Link
                  key={brand.name}
                  href={`/shop?brand=${brand.name}`}
                  className="nav-brand"
                  onClick={closeMenu}
                >
                  <img src={brand.src} alt="" width={20} height={20} />
                  <span>{brand.name}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        <Link href="/community" className="nav-mobile-link" onClick={closeMenu}>
          Community
        </Link>
        <Link href="/technology" className="nav-mobile-link" onClick={closeMenu}>
          Tech
        </Link>
      </nav>
      <div
        className="nav-shop-panel"
        onMouseEnter={() => {
          if (canHover()) openShop();
        }}
        onMouseLeave={() => {
          if (canHover()) scheduleCloseShop();
        }}
      >
        <div className="nav-shop-clip">
          <div className="nav-brands">
            {SHOP_BRANDS.map((brand) => (
              <Link key={brand.name} href={`/shop?brand=${brand.name}`} className="nav-brand">
                <img src={brand.src} alt="" width={20} height={20} />
                <span>{brand.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
