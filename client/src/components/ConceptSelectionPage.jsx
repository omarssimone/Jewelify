import React, { Suspense } from "react";
import { useNavigate, useLocation } from "react-router";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import "../styles/ConceptSelectionPage.css";
import braceletImg from "../../images/bracelet.png";
import { useHeader } from "./HeaderContext";
import { deriveConfigFromSurveyAnswers, withSurveyDefaults } from "../utils/surveyMapping";
// Images are referenced directly from /images/ path; replace when ready

const colorMap = {
  gold: 0xffd700,
  silver: 0xf5f3e7,
  rose: 0xb76e79,
  platinum: 0xc0e0ff,
};

const stoneColorMap = {
  clear: 0xe0f7ff,
  pink: 0xffc0cb,
  blue: 0x0000ff,
  green: 0x00ff00,
  red: 0xff0000,
  yellow: 0xffe066,
};

const PreviewModel = ({ bandPath, stonePath, config }) => {
  const band = useGLTF(bandPath);
  const stone = useGLTF(stonePath);

  const applyMetal = React.useCallback((scene) => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const mat = Array.isArray(child.material) ? child.material[0] : child.material;
        mat.color.setHex(colorMap[config.materialColor] || colorMap.gold);
        mat.metalness = 1.0;
        mat.roughness = typeof config.polish === "number" ? 1 - config.polish : 0.2;
        mat.needsUpdate = true;
      }
    });
  }, [config.materialColor, config.polish]);

  const applyStone = React.useCallback((scene) => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const mat = Array.isArray(child.material) ? child.material[0] : child.material;
        mat.color.setHex(stoneColorMap[config.stoneColor] || stoneColorMap.clear);
        mat.metalness = 0;
        mat.roughness = 0.1;
        mat.transparent = true;
        mat.opacity = 0.5 + (config.clarity || 0.5) * 0.5;
        mat.needsUpdate = true;
      }
    });
  }, [config.stoneColor, config.clarity]);

  React.useEffect(() => {
    if (band?.scene) applyMetal(band.scene);
    if (stone?.scene) applyStone(stone.scene);
  }, [band, stone, applyMetal, applyStone]);

  useFrame((state) => {
    if (band?.scene) band.scene.rotation.y += 0.002;
    if (stone?.scene) stone.scene.rotation.y += 0.002;
  });

  return (
    <group position={[0, -0.6, 0]}>
      {band?.scene && <primitive object={band.scene} scale={1} />}
      {stone?.scene && <primitive object={stone.scene} scale={1} />}
    </group>
  );
};

const ConceptPreview = ({ concept }) => {
  const [fallbackImg, setFallbackImg] = React.useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const bandPath = concept.config?.bandPath || `${baseUrl}/models/ring/BAND_CLASSIC.glb`;
  const stonePath = concept.config?.stonePath || `${baseUrl}/models/ring/STONE_BRILLIANT.glb`;

  const supportsWebGL = React.useMemo(() => {
    try {
      const canvas = document.createElement("canvas");
      return !!window.WebGLRenderingContext && !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    } catch (e) {
      return false;
    }
  }, []);

  if (fallbackImg || !supportsWebGL || !concept.config) {
    const src = concept.image || "/images/concept_01.png";
    return (
      <div className="concept-preview placeholder-img">
        <img src={src} alt={concept.name} onError={() => setFallbackImg(true)} />
      </div>
    );
  }

  return (
    <div className="concept-preview">
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }} style={{ height: 220 }} onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 6, 6]} intensity={0.7} />
        <Suspense fallback={null}>
          <PreviewModel bandPath={bandPath} stonePath={stonePath} config={concept.config} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.7} />
      </Canvas>
    </div>
  );
};

const ConceptSelectionPage = ({ surveyAnswers }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location?.state?.from || null;

   const answers = surveyAnswers || location?.state?.surveyAnswers || null;

   const buildPaths = (baseConfig) => {
     let bandFile = "BAND_CLASSIC.glb";
     if (baseConfig.bandDesign === "Knife") bandFile = "BAND_KNIFE.glb";
     if (baseConfig.bandDesign === "Flat") bandFile = "BAND_FLAT.glb";

     let stoneFile = "STONE_BRILLIANT.glb";
     if (baseConfig.stoneShape === "diamond") stoneFile = "STONE_DIAMOND.glb";
     if (baseConfig.stoneShape === "gem") stoneFile = "STONE_GEM.glb";

     const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
     return {
       ...baseConfig,
       bandPath: `${baseUrl}/models/ring/${bandFile}`,
       stonePath: `${baseUrl}/models/ring/${stoneFile}`,
     };
   };

   const baseConfig = answers ? buildPaths(deriveConfigFromSurveyAnswers(answers)) : null;

   const concepts = React.useMemo(() => {
     if (!baseConfig) {
       return [
         { id: 1, name: "Concept 1", image: "/images/concept_01.png", modelPath: "/models/concept_01.obj" },
         { id: 2, name: "Concept 2", image: "/images/concept_02.png", modelPath: "/models/concept_02.obj" },
         { id: 3, name: "Concept 3", image: "/images/concept_03.png", modelPath: "/models/concept_03.obj" },
       ];
     }

     // Build three intentionally distinct variants
     const conceptA = withSurveyDefaults({
       ...baseConfig,
       label: "Signature match",
     });

     const conceptB = withSurveyDefaults({
       ...baseConfig,
       design: "delicate",
       style: "solitaire",
       bandDesign: "Classic",
       stoneShape: "brilliant",
       metalFinish: "polished",
       stoneColor: baseConfig.stoneColor === "clear" ? "clear" : baseConfig.stoneColor,
       polish: Math.max(baseConfig.polish, 0.85),
       clarity: Math.max(baseConfig.clarity, 0.85),
       material: baseConfig.material === "silver" ? "platinum" : baseConfig.material,
       label: "Refined minimal",
     });

     const conceptC = withSurveyDefaults({
       ...baseConfig,
       design: "statement",
       style: "halo",
       bandDesign: "Flat",
       stoneShape: "gem",
       metalFinish: baseConfig.metalFinish === "matte" ? "matte" : "hammered",
       stoneColor: baseConfig.stoneColor === "clear" ? "red" : baseConfig.stoneColor,
       material: baseConfig.material === "gold" ? "rose" : baseConfig.material,
       polish: Math.min(baseConfig.polish, 0.65),
       clarity: Math.min(baseConfig.clarity, 0.7),
       label: "Bold spotlight",
     });

     const cA = buildPaths(conceptA);
     const cB = buildPaths(conceptB);
     const cC = buildPaths(conceptC);

     return [
       { id: 1, name: "Concept 1", config: cA, modelPath: cA.bandPath, image: "/images/concept_01.png" },
       { id: 2, name: "Concept 2", config: cB, modelPath: cB.bandPath, image: "/images/concept_02.png" },
       { id: 3, name: "Concept 3", config: cC, modelPath: cC.bandPath, image: "/images/concept_03.png" },
     ];
    }, [baseConfig]);

  const handleSelect = (concept) => {
    const payload = {
      from: "concepts",
      modelPath: concept.modelPath,
      conceptConfig: concept.config,
      surveyAnswers: answers,
    };
    navigate("/design", { state: payload });
  };

  const handleBack = () => {
    // If we came here from the survey flow, go back to step 2; otherwise, go to home
    if (from === 'survey') {
      navigate('/survey', { state: { step: 2 } });
    } else {
      navigate('/');
    }
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
    <div className="concepts-page">
      <main className="concepts-main">
        <section className="concepts-hero">
          <h2>Jewels created for YOU</h2>
          <p>Choose a starting concept to begin customizing your piece.</p>
        </section>

        <section className="concepts-grid">
          {concepts.map((c) => (
            <div key={c.id} className="concept-card" onClick={() => handleSelect(c)}>
              <div className="concept-preview-wrapper">
                {c.config ? <ConceptPreview concept={c} /> : (
                  <div className="concept-icon">
                    <img src={braceletImg} alt={c.name} onError={(e) => (e.currentTarget.src = "/images/bracelet.png")} />
                  </div>
                )}
              </div>
              <h3 className="concept-label">{c.name}</h3>
              {c.config?.label && <p className="concept-subtitle">{c.config.label}</p>}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default ConceptSelectionPage;
