import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
