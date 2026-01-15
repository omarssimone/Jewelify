import React from "react";
import { useNavigate, useParams } from "react-router";
import "../styles/InspirationPage.css";
import { useHeader } from "./HeaderContext";
import ringIcon from "../../images/ring.png";
import braceletIcon from "../../images/bracelet.png";
import necklaceIcon from "../../images/necklace.png";
import earringsIcon from "../../images/earrings.png";

const categories = {
  rings: {
    label: "Rings",
    icon: ringIcon,
    filePrefix: "ring",
  },
  bracelets: {
    label: "Bracelets",
    icon: braceletIcon,
    filePrefix: "bracelet",
  },
  necklaces: {
    label: "Necklaces",
    icon: necklaceIcon,
    filePrefix: "necklace",
  },
  earrings: {
    label: "Earrings",
    icon: earringsIcon,
    filePrefix: "earrings",
  },
};

const makeImages = (prefix) => {
  // For rings we show a curated set of 8 images (2 rows x 4 per row).
  if (prefix === 'ring') {
    const ringIndexes = [6, 22, 9, 10, 14, 13, 16, 7];
    const modelFile = `/models/${prefix}.obj`;
    return ringIndexes.map((i) => ({ imageFile: `/images/${prefix}${i}.png`, modelFile }));
  }

  // Build 8 image objects for inspirations grid (default)
  const arr = [];
  const modelFile = `/models/${prefix}.obj`; // Use same model for all
  for (let i = 1; i <= 8; i++) {
    const imageFile = `/images/${prefix}${i}.png`;
    arr.push({ imageFile, modelFile });
  }
  return arr;
};

const InspirationPage = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const current = categories[category] || categories["rings"];

  const images = makeImages(current.filePrefix);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSelect = (item) => {
    // Go directly to the designer for now
    navigate("/design", { state: { modelPath: item.modelFile, from: 'inspiration' } });
  };

  const { setLeft, setRight } = useHeader();
  React.useEffect(() => {
    setLeft(<button className="back-btn btn-back-small" onClick={handleBack}>← Back</button>);
    setRight(null);
    return () => {
      setLeft(null);
      setRight(null);
    };
  }, []);

  return (
    <div className="inspiration-page">
      <main className="inspiration-main">
        <h2>{current.label} Inspiration</h2>
        <div className="inspiration-grid">
          {images.map((item, idx) => {
            const isRing = current.filePrefix === 'ring';
            return (
              <div
                key={idx}
                className={`inspiration-tile ${isRing ? '' : 'not-clickable'}`}
                onClick={() => isRing && handleSelect(item)}
                aria-disabled={!isRing}
                tabIndex={isRing ? 0 : -1}
              >
                <img
                  src={item.imageFile}
                  alt={`${current.filePrefix} ${idx + 1}`}
                  onError={(e) => (e.currentTarget.src = current.icon)}
                />
                {!isRing && (
                  <div className="coming-soon-badge">Available Soon</div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default InspirationPage;
