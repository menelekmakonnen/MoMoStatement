import React, { useEffect } from 'react';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Features from './Features';
import LiveDemo from './LiveDemo';
import DashboardPreview from './DashboardPreview';
import Pricing from './Pricing';
import Testimonials from './Testimonials';
import Footer from './Footer';
import '../../styles/landing.css';

export default function LandingPage() {
  useEffect(() => {
    document.title = "MoMo Statement — Your Mobile Money, Finally in Order";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in-up').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <Hero />
      <HowItWorks />
      <Features />
      <LiveDemo />
      <DashboardPreview />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
}
