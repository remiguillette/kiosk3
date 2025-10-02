import { Link } from 'react-router-dom';
import { PhoneCall, Globe2 } from 'lucide-react';
import '../styles/menu.css';

function MenuCard({ title, description, to, icon, external = false }) {
  const content = (
    <div className="menu-card-content">
      <span className="menu-card-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );

  if (external) {
    return (
      <a className="menu-card" href={to} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link className="menu-card" to={to}>
      {content}
    </Link>
  );
}

function MenuPage() {
  return (
    <main className="menu-page">
      <header>
        <h1>Beaver Kiosk</h1>
        <p>Select a destination to continue.</p>
      </header>
      <section className="menu-grid">
        <MenuCard
          title="BeaverPhone"
          description="Place calls through the local BeaverPhone system."
          to="/beaverphone"
          icon={<PhoneCall size={32} />}
        />
        <MenuCard
          title="BeaverNet.ca"
          description="Open the BeaverNet.ca cloud portal in the kiosk browser."
          to="https://rgbeavernet.ca"
          icon={<Globe2 size={32} />}
          external
        />
      </section>
    </main>
  );
}

export default MenuPage;
