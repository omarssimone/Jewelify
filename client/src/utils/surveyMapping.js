// Deterministically map survey answers to a jewel configuration used by DesignIterator.
const clamp01 = (value, min = 0.3, max = 0.95) => {
  if (typeof value !== "number" || Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const defaultConfig = {
  design: "delicate",
  material: "gold",
  style: "solitaire",
  materialColor: "gold",
  metalFinish: "polished",
  stoneColor: "clear",
  polish: 0.7,
  clarity: 0.7,
  bandDesign: "Classic",
  stoneShape: "brilliant",
  modelPath: "/models/ring/BAND_CLASSIC.glb",
};

const materialColorFromMaterial = (material) => {
  const map = {
    gold: "gold",
    silver: "silver",
    rose: "rose",
    platinum: "platinum",
    palladium: "platinum",
  };
  return map[material] || "gold";
};

const setPolishClarity = (config, polish, clarity) => {
  if (polish !== undefined) config.polish = clamp01(polish);
  if (clarity !== undefined) config.clarity = clamp01(clarity);
};

export function deriveConfigFromSurveyAnswers(payload = {}) {
  const survey = payload.survey || {};
  const config = { ...defaultConfig };
  let materialLocked = false;

  const setMaterial = (material) => {
    if (materialLocked) return;
    config.material = material;
    config.materialColor = materialColorFromMaterial(material);
  };

  // q1: Typical style
  switch (survey.q1) {
    case "classic":
      config.design = "delicate";
      config.style = "solitaire";
      config.bandDesign = "Classic";
      config.stoneShape = "brilliant";
      config.metalFinish = "polished";
      break;
    case "modern":
      config.design = "geometric";
      config.style = "pavé";
      config.bandDesign = "Knife";
      config.stoneShape = "diamond";
      config.metalFinish = "polished";
      break;
    case "vintage":
      config.design = "organic";
      config.style = "vintage";
      config.bandDesign = "Flat";
      config.stoneShape = "gem";
      config.metalFinish = "matte";
      break;
    case "bold":
      config.design = "statement";
      config.style = "halo";
      config.bandDesign = "Flat";
      config.stoneShape = "gem";
      config.metalFinish = "polished";
      break;
    default:
      break;
  }

  // q2: Wardrobe colors -> stone color
  switch (survey.q2) {
    case "warm":
      config.stoneColor = "red";
      break;
    case "cool":
      config.stoneColor = "blue";
      break;
    case "neutral":
      config.stoneColor = "clear";
      break;
    case "vibrant":
      config.stoneColor = "pink";
      break;
    default:
      break;
  }

  // q3: Preferred shapes -> design/band hints
  switch (survey.q3) {
    case "curves":
      config.design = "organic";
      config.bandDesign = "Classic";
      break;
    case "leaves":
      config.design = "organic";
      config.bandDesign = "Flat";
      break;
    case "organic":
      config.design = "organic";
      config.metalFinish = "hammered";
      break;
    case "asymmetrical":
      config.design = "statement";
      config.bandDesign = "Knife";
      config.stoneShape = "gem";
      break;
    default:
      break;
  }

  // q4: Metal color preference
  switch (survey.q4) {
    case "yellow":
      setMaterial("gold");
      materialLocked = true;
      break;
    case "white":
      setMaterial("silver");
      materialLocked = true;
      break;
    case "pink":
      setMaterial("rose");
      materialLocked = true;
      break;
    case "mixed":
      setMaterial("palladium");
      materialLocked = true;
      break;
    default:
      break;
  }

  // q5: Finish preference
  switch (survey.q5) {
    case "matte":
      config.metalFinish = "matte";
      break;
    case "textured":
      config.metalFinish = "hammered";
      break;
    case "polished":
      config.metalFinish = "polished";
      break;
    case "hammered":
      config.metalFinish = "hammered";
      break;
    default:
      break;
  }

  // q6: Stones preference
  switch (survey.q6) {
    case "accent":
      config.style = "pavé";
      setPolishClarity(config, 0.65, 0.65);
      break;
    case "lots":
      config.style = "halo";
      setPolishClarity(config, 0.8, 0.8);
      break;
    case "none":
      config.style = "solitaire";
      config.stoneColor = "clear";
      setPolishClarity(config, 0.55, 0.5);
      break;
    case "centerpiece":
      config.style = "solitaire";
      config.stoneShape = "gem";
      setPolishClarity(config, 0.75, 0.75);
      break;
    default:
      break;
  }

  // q7: Mood
  switch (survey.q7) {
    case "passionate":
      config.design = "statement";
      config.stoneColor = "red";
      setPolishClarity(config, 0.8, config.clarity);
      break;
    case "royal":
      setMaterial("gold");
      config.style = "halo";
      setPolishClarity(config, config.polish, 0.85);
      break;
    case "happy":
      config.design = "delicate";
      config.stoneColor = "pink";
      break;
    case "calm":
      config.design = "organic";
      config.stoneColor = "blue";
      config.metalFinish = "matte";
      break;
    default:
      break;
  }

  // q8: Occasion
  switch (survey.q8) {
    case "birthday":
      config.style = "solitaire";
      break;
    case "wedding":
      setMaterial("platinum");
      config.style = "halo";
      config.design = "delicate";
      break;
    case "achievement":
      config.design = "statement";
      setMaterial("gold");
      break;
    case "justbecause":
      break;
    default:
      break;
  }

  // q9: Wear frequency
  switch (survey.q9) {
    case "daily":
      setMaterial("platinum");
      config.bandDesign = "Classic";
      config.metalFinish = "matte";
      setPolishClarity(config, 0.6, 0.6);
      break;
    case "frequently":
      setPolishClarity(config, 0.7, 0.7);
      break;
    case "occasionally":
      config.style = "halo";
      setPolishClarity(config, 0.75, config.clarity);
      break;
    case "special":
      config.design = "statement";
      config.style = "halo";
      setPolishClarity(config, 0.8, 0.8);
      break;
    default:
      break;
  }

  // q10: Activity level
  switch (survey.q10) {
    case "veryactive":
      config.bandDesign = "Classic";
      config.stoneShape = "brilliant";
      config.metalFinish = "matte";
      setPolishClarity(config, 0.55, 0.55);
      break;
    case "average":
      break;
    case "light":
      config.bandDesign = "Knife";
      setPolishClarity(config, 0.75, config.clarity);
      break;
    case "noactivity":
      config.design = "delicate";
      config.metalFinish = "polished";
      setPolishClarity(config, 0.85, 0.85);
      break;
    default:
      break;
  }

  // q11: Defining word
  switch (survey.q11) {
    case "meaningful":
      config.design = "organic";
      config.metalFinish = "hammered";
      break;
    case "timeless":
      config.design = "delicate";
      config.style = "solitaire";
      break;
    case "simple":
      config.design = "delicate";
      config.style = "solitaire";
      config.bandDesign = "Classic";
      config.metalFinish = "matte";
      break;
    case "impressive":
      config.design = "statement";
      config.style = "halo";
      config.stoneShape = "gem";
      setPolishClarity(config, 0.85, 0.85);
      break;
    default:
      break;
  }

  // Keep metal color consistent with chosen material
  config.materialColor = materialColorFromMaterial(config.material);
  setPolishClarity(config, config.polish, config.clarity);

  return config;
}

export function withSurveyDefaults(config = {}) {
  const merged = { ...defaultConfig, ...config };
  merged.polish = clamp01(merged.polish);
  merged.clarity = clamp01(merged.clarity);
  merged.materialColor = materialColorFromMaterial(merged.material);
  return merged;
}
