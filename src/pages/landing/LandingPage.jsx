import React, { useEffect } from 'react';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Features from './Features';
import LiveDemo from './LiveDemo';
import DashboardPreview from './DashboardPreview';
import Pricing from './Pricing';
import Footer from './Footer';
import '../../styles/landing-v2.css';

export default function LandingPage() {
  useEffect(() => {
    document.title = 'MoMo Statement — Your Mobile Money, Finally in Order';
  }, []);

  return (
    <div className="landing-page">
      <Hero />
      <HowItWorks />
      <Features />
      <LiveDemo />
      <DashboardPreview />
      <Pricing />
      <Footer />
    </div>
  );
}
