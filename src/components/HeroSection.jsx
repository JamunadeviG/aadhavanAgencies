import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();
  const [offsetY, setOffsetY] = useState(0);

  // Parallax Event Listener
  const handleScroll = () => {
    setOffsetY(window.pageYOffset);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const glassCards = [
    { title: "Grains & Cereals", text: "Premium bulk rice, wheat, and millets." },
    { title: "Pulses & Dals", text: "High-protein lentils sourced directly from farms." },
    { title: "Spices & Masalas", text: "Authentic, aromatic bulk spices." },
    { title: "Edible Oils", text: "Wholesale refined & cold-pressed oils." }
  ];

  return (
    <div className="hero-parallax-wrapper">
      <style>{`
        .hero-parallax-wrapper {
          position: relative;
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #1a3c2e; /* Deep forest green */
          font-family: inherit;
        }

        /* Parallax Background */
        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 120%; /* Taller for parallax room */
          /* Abstract nature/grocery pattern or deep gradient */
          background: radial-gradient(circle at center, #2c5945 0%, #1a3c2e 100%);
          z-index: 0;
          /* The parallax transform happens inline in JSX */
        }

        /* Particle accents */
        .hero-bg::after {
          content: '';
          position: absolute;
          width: 200vw;
          height: 200vh;
          background-image: 
            radial-gradient(#f5a623 1px, transparent 1px),
            radial-gradient(#f5a623 1px, transparent 1px);
          background-size: 50px 50px;
          background-position: 0 0, 25px 25px;
          opacity: 0.1;
          animation: drift 60s linear infinite;
        }

        @keyframes drift {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50px); }
        }

        .hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 4rem 2rem;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 5rem;
          align-items: center;
        }

        .hero-text-side {
          color: white;
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .hero-tag {
          display: inline-block;
          background: rgba(245, 166, 35, 0.15); /* Gold tinted */
          color: #f5a623; /* Gold */
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
          letter-spacing: 1px;
          border: 1px solid rgba(245, 166, 35, 0.3);
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: white;
        }

        .hero-title span {
          color: #f5a623; /* Gold accent */
        }

        .hero-desc {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
          margin-bottom: 2.5rem;
          max-width: 90%;
        }

        /* Ripple Button */
        .hero-btn {
          position: relative;
          background: #f5a623;
          color: #1a3c2e;
          border: none;
          padding: 1rem 2.5rem;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(245, 166, 35, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hero-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(245, 166, 35, 0.4);
        }

        .hero-btn::after {
          content: '';
          background: rgba(255, 255, 255, 0.3);
          display: block;
          position: absolute;
          border-radius: 50%;
          padding-top: 240%;
          padding-left: 240%;
          margin-top: -120%;
          margin-left: -120%;
          opacity: 0;
          transition: all 0.5s;
        }

        .hero-btn:active::after {
          padding-top: 0;
          padding-left: 0;
          margin-top: 0;
          margin-left: 0;
          opacity: 1;
          transition: 0s;
        }

        /* Glassmorphism Floating Cards */
        .glass-cards-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          position: relative;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 2rem;
          border-radius: 20px;
          color: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          transition: all 0.4s ease;
          animation: floatFloat 6s ease-in-out infinite;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .glass-card:nth-child(2) { animation-delay: 1.5s; }
        .glass-card:nth-child(3) { animation-delay: 3s; }
        .glass-card:nth-child(4) { animation-delay: 4.5s; }

        .glass-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(245, 166, 35, 0.4);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(245, 166, 35, 0.1);
        }

        .glass-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, rgba(245, 166, 35, 0.3), rgba(245, 166, 35, 0.1));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f5a623;
          font-size: 1.2rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(245, 166, 35, 0.3);
        }

        .glass-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: white;
          letter-spacing: -0.02em;
        }

        .glass-text {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes floatFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @media (max-width: 1280px) {
          .hero-content {
            gap: 3rem;
            padding: 3rem 1.5rem;
          }
          .hero-title { font-size: 3rem; }
        }

        @media (max-width: 1024px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 4rem;
          }
          .hero-text-side {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-desc {
            margin: 0 auto 2.5rem;
            max-width: 600px;
          }
          .glass-cards-container {
            grid-template-columns: repeat(2, 1fr);
            max-width: 700px;
            margin: 0 auto;
          }
        }

        @media (max-width: 640px) {
          .hero-title { font-size: 2.5rem; }
          .hero-tag { font-size: 0.75rem; }
          .glass-cards-container { grid-template-columns: 1fr; }
          .glass-card { padding: 1.5rem; }
        }
      `}</style>

      {/* Parallax Background mapping to Y offset */}
      <div
        className="hero-bg"
        style={{ transform: `translateY(${offsetY * 0.4}px)` }}
      />

      <div className="hero-content">
        <div className="hero-text-side">
          <div className="hero-tag">B2B WHOLESALE EXCELLENCE</div>

          <h1 className="hero-title">
            Source Smart,<br />
            Scale <span>Faster.</span>
          </h1>

          <p className="hero-desc">
            Aadhavan Agencies supplies premium wholesale grocery to supermarkets, hotels, and distributors directly across the nation. Experience real-time pricing and bulk dynamic offers.
          </p>

          <button className="hero-btn" onClick={() => navigate('/register')}>
            Partner With Us
          </button>
        </div>

        <div className="glass-cards-container">
          {glassCards.map((card, idx) => (
            <div className="glass-card" key={idx}>
              <div className="glass-icon">
                {card.title.charAt(0)}
              </div>
              <h3 className="glass-title">{card.title}</h3>
              <p className="glass-text">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
