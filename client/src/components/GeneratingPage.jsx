import React, { useEffect, useMemo, useState, useRef } from "react"; // Aggiungi useRef
import { useLocation, useNavigate } from "react-router";
import "../styles/GeneratingPage.css";
import { useHeader } from "./HeaderContext";

const messages = [
  "Generating 3 concepts from the survey entry…",
  "Rendering 3D models…",
  "Optimizing materials…",
  "Polishing surfaces…",
  "Setting up lighting…",
  "Finalizing scene…",
];

export default function GeneratingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLeft, setRight } = useHeader();

  useEffect(() => {
    setLeft(null);
    setRight(null);
    return () => {
      setLeft(null);
      setRight(null);
    };
  }, [setLeft, setRight]);

  const totalDuration = useMemo(() => 5000 + Math.floor(Math.random() * 5000), []);
  
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    let animationFrameId;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      // Calcola la percentuale (max 100%)
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      
      setProgress(newProgress);

      if (elapsed < totalDuration) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [totalDuration]);

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const cycle = setInterval(() => setIdx((i) => (i + 1) % messages.length), 1200);
    return () => clearInterval(cycle);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      navigate("/concepts", { state: { ...location.state, from: "survey" }, replace: true });
    }, totalDuration);
    return () => clearTimeout(t);
  }, [navigate, location.state, totalDuration]);

  return (
    <div className="generating-page">
      <div className="generating-card" role="alert" aria-live="polite">
        
        <div className="diamond-container">
           <div className="diamond-rotator">
            <svg viewBox="0 0 100 100" className="diamond-svg" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <path id="sparkle-shape" d="M0,-5 L1,-1 L5,0 L1,1 L0,5 L-1,1 L-5,0 L-1,-1 Z" />
              </defs>
              <g className="diamond-structure">
                 <path className="diamond-path" d="M30,30 L70,30 L90,50 L50,95 L10,50 L30,30 Z" />
                 <path className="diamond-path" d="M30,30 L50,50 L70,30" />
                 <path className="diamond-path" d="M10,50 L50,50 L90,50" />
                 <path className="diamond-path" d="M50,50 L50,95" />
                 <path className="diamond-path" d="M10,50 L30,30" />
                 <path className="diamond-path" d="M90,50 L70,30" />
              </g>
              <use href="#sparkle-shape" x="30" y="30" className="sparkle-path" style={{ animationDelay: "0s" }} />
              <use href="#sparkle-shape" x="90" y="50" className="sparkle-path" style={{ animationDelay: "0.8s" }} />
              <use href="#sparkle-shape" x="50" y="95" className="sparkle-path" style={{ animationDelay: "1.5s" }} />
            </svg>
          </div>
        </div>

        <div className="gp-text">{messages[idx]}</div>

        <div className="elegant-progress-track">
            <div 
              className="elegant-progress-fill" 
              style={{ width: `${progress}%` }}
            >
              <div className="progress-gem"></div>
            </div>
        </div>

        <div className="gp-subtext">This usually takes a few seconds…</div>
      </div>
    </div>
  );
}