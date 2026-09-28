const TECH_CARDS = [
  {
    title: 'HIVE® Lattice Structure',
    body: 'Replaces the entire foam layer with a precision-printed 3D grid.',
    icon: '/tech/icon-lattice.svg',
  },
  {
    title: 'TPU Material',
    body: "Thermoplastic polyurethane that doesn't age, crack, or sag.",
    icon: '/tech/icon-tpu.svg',
  },
  {
    title: 'Zonal Density Printing',
    body: 'Every density zone is designed, not approximated by a mold.',
    icon: '/tech/icon-zonal.svg',
  },
  {
    title: 'Open-Cell Breathability',
    body: 'Open geometry evacuates heat and moisture in real time.',
    icon: '/tech/icon-breath.svg',
  },
  {
    title: 'Waterproof & Non-Absorbent',
    body: '0% weight gain when submerged, dries in 30 seconds.',
    icon: '/tech/icon-waterproof.svg',
  },
  {
    title: 'Integrated Manufacturing',
    body: '7 processes under one roof in Taizhou, IATF 16949 certified.',
    icon: '/tech/icon-factory.svg',
  },
] as const;

export default function TechnologyPage() {
  return (
    <div>
      <section className="page-hero">
        <img className="page-hero-bg" src="/tech/hero.png" alt="" />
        <h1>technology</h1>
      </section>

      <section className="tech-feature">
        <div className="tech-feature-stage">
          <div className="tech-feature-grid">
            <div className="tech-feature-copy">
              <div className="tech-feature-head">
                <div className="tech-feature-title">
                  <h2>The HIVE® Lattice Structure</h2>
                  <p>Structurally permanent</p>
                </div>
                <div className="tech-stats">
                  <p>
                    <strong>27% </strong>
                    <span>lighter</span>
                  </p>
                  <p className="tech-stat-years">
                    <span>stable for </span>
                    <strong>10+</strong>
                    <span> years</span>
                  </p>
                </div>
              </div>
              <img className="tech-seat" src="/tech/seat.png" alt="HIVE lattice motorcycle seat" />
            </div>
            <div className="tech-feature-text">
              <p className="fw-bold">
                Traditional foam works once, then fails slowly. It compresses under load, retains heat,
                absorbs moisture, and never fully recovers.
              </p>
              <p>
                The HIVE® TPU lattice replaces the entire foam layer with a precision-printed
                three-dimensional grid. Each cell acts as an independent spring — responsive,
                breathable, and structurally permanent.
              </p>
            </div>
          </div>
          <div className="tech-bike-wrap">
            <img className="tech-bike" src="/tech/bike.png" alt="" />
          </div>
        </div>
      </section>

      <section className="tech-grid-wrap">
        <div className="tech-grid-title">
          <h2>Six Technologies That Rewrite the Seat</h2>
          <p>Each one is something traditional seats simply can&apos;t do</p>
        </div>
        <div className="tech-grid">
          {TECH_CARDS.map((card) => (
            <article key={card.title} className="tech-card">
              <div className="tech-card-icon">
                <img src={card.icon} alt="" />
              </div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
