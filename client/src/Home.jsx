import React from "react";
import { useNavigate } from "react-router";
import "./styles/Home.css";
import ClickableTitle from "./components/ClickableTitle";
import earringsImg from "../images/earrings.png";
import necklaceImg from "../images/necklace.png";
import ringImg from "../images/ring.png";
import braceletImg from "../images/bracelet.png";
import Navbar from "./components/Navbar";

function Home({ onStartDesign }) {
  const navigate = useNavigate();
  return (
    <>
    <div className="home-container">
      <main className="home-main">
        <section className="home-hero">
          <h2>Design YOUR jewelry</h2>
          <p>Create bespoke jewelry pieces tailored to your unique style.</p>
          <button className="btn-start-design" onClick={() => navigate('/survey')}>
            Start Designing
          </button>
        </section>
        <section className="home-features">
          <div className="feature-card" role="button" onClick={() => navigate("/inspiration/rings", { state: { from: 'home' } }) }>
            <div className="feature-icon">
              <img src={ringImg} alt="Ring Icon" className="ring-icon"/>
            </div>
            <h3>Rings</h3>
          </div>
          <div className="feature-card" role="button" onClick={() => navigate("/inspiration/bracelets", { state: { from: 'home' } }) }>
            <div className="feature-icon">
              <img src={braceletImg} alt="Bracelet Icon" className="bracelet-icon"/>
            </div>
            <h3>Bracelets</h3>
          </div>
          <div className="feature-card" role="button" onClick={() => navigate("/inspiration/necklaces", { state: { from: 'home' } }) }>
            <div className="feature-icon">
              <img src={necklaceImg} alt="Necklace Icon" className="necklace-icon"/>
            </div>
            <h3>Necklaces</h3>
          </div>
          <div className="feature-card" role="button" onClick={() => navigate("/inspiration/earrings", { state: { from: 'home' } }) }>
            <div className="feature-icon">
              <img src={earringsImg} alt="Earrings Icon" className="earrings-icon"/>
            </div>
            <h3>Earrings</h3>
          </div>
        </section>
      </main>
      <footer className="home-footer">
        <p>&copy; 2025 Jewelify - Premium Custom Jewelry Design</p>
      </footer>
    </div>
    </>
  );
}

export default Home;
