import React from "react";

export default function HeroSection() {
  return (
    <>
      <style>{`
        .hero-container {
          margin: 30px;
          padding: 60px;
          background: #f3f4f6;
          border-radius: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: Arial, sans-serif;
          position: relative;
          z-index: 1;
        }

        .left {
          max-width: 500px;
          z-index: 2;
        }

        .tag {
          display: inline-block;
          background: #2563eb;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 5px;
          font-size: 12px;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .title {
          font-size: 42px;
          font-weight: 700;
          color: #111827; /* DARK TEXT */
          margin-bottom: 15px;
          line-height: 1.2;
        }

        .desc {
          font-size: 16px;
          color: #374151; /* DARK GREY */
          line-height: 1.6;
        }

        .btn {
          background: #22c55e;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 12px;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          z-index: 2;
        }

        .btn:hover {
          background: #16a34a;
        }

        /* 🔥 IMPORTANT FIXES */
        * {
          opacity: 1 !important;
        }

        .hero-container * {
          color: inherit;
        }
      `}</style>

      <div className="hero-container">

        <div className="left">
          <div className="tag">GET STARTED</div>

          <div className="title">
            Ready to grow your business?
          </div>

          <div className="desc">
            Join hundreds of retailers who trust Aadhavan Agencies
            for their wholesale needs.
          </div>
        </div>

        <button className="btn">
          Sign in to Your Account
        </button>

      </div>
    </>
  );
}
