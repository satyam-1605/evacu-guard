import HeroSection from '../components/hero/HeroSection';
import HowItWorks from '../components/landing/HowItWorks';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import TechStack from '../components/landing/TechStack';
import Footer from '../components/landing/Footer';
import Navbar from '../components/landing/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesGrid />
      <TechStack />
      <Footer />
    </div>
  );
}
