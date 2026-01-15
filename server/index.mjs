import express from "express";
import morgan from "morgan";
import { check, validationResult } from "express-validator";
import cors from "cors";
import session from "express-session";

// init express
const app = new express();
const port = 3001;

// middleware
app.use(express.json());
app.use(morgan("dev"));

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessState: 200,
  credentials: true,
};

app.use(cors(corsOptions));

import fs from "fs";
import path from "path";

app.use("/static", express.static("public")); //for cards images
/**
 * GET /api/3dmodels-ring/parts
 * Restituisce la lista dei file BAND, HEAD, STONE disponibili
 */
app.get("/api/3dmodels-ring/parts", (req, res) => {
  const dir = path.join(process.cwd(), "public", "3Dmodels_ring");
  fs.readdir(dir, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, error: "Cannot read models directory" });
    }
    // Filtra per tipo
    const band = files.filter((f) => f.startsWith("BAND_"));
    const head = files.filter((f) => f.startsWith("HEAD_"));
    const stone = files.filter((f) => f.startsWith("STONE_"));
    res.json({ success: true, band, head, stone });
  });
});

/**
 * GET /api/3dmodels-ring/:type/:filename
 * Serve un file 3D specifico (BAND, HEAD, STONE)
 */
app.get("/api/3dmodels-ring/:type/:filename", (req, res) => {
  const { type, filename } = req.params;
  const allowedTypes = ["BAND", "HEAD", "STONE"];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ success: false, error: "Invalid type" });
  }
  if (!filename.startsWith(type + "_")) {
    return res
      .status(400)
      .json({ success: false, error: "Filename/type mismatch" });
  }
  const filePath = path.join(
    process.cwd(),
    "public",
    "3Dmodels_ring",
    filename
  );
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: "File not found" });
  }
  res.sendFile(filePath);
});
// you can access a file using http://localhost:3001/static/{filename}
// if the file is in a directory you have to specify the full path

app.use(
  session({
    secret: "shhhhh... it's a secret!",
    resave: false,
    saveUninitialized: false,
  })
);

/** ROUTES **/

/**
 * POST /api/geometry-update
 *
 * Simulates server-side geometry changes that require mesh manipulation.
 * HYBRID STRATEGY: This endpoint is only called for:
 * - Design changes (geometric, organic, delicate, bold)
 * - Material changes (affects physical properties)
 * - Style changes (pavé, solitaire, halo, three-stone)
 * - Engraving changes (requires mesh operations)
 *
 * Returns: Updated config with GLB model path and pricing
 * Delay: Simulates processing time (2-4 seconds)
 */
app.post("/api/geometry-update", async (req, res) => {
  try {
    const { design, material, style, engraving, ...otherConfig } = req.body;

    // Simulate processing delay (2-4 seconds)
    const delay = Math.random() * 2000 + 2000;

    // Simulate work with a promise
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Mock response: would normally return a new GLB file path
    // In production, you would:
    // 1. Generate/fetch the updated 3D model
    // 2. Apply geometry transformations
    // 3. Return the path to the new GLB file

    const priceCalculation = {
      palladium: 100,
      gold: 80,
      silver: 50,
      platinum: 150,
    };

    const styleMultiplier = {
      pavé: 1.5,
      solitaire: 1.0,
      halo: 1.8,
      "three-stone": 1.6,
    };

    const engravingCost = {
      laser: 50,
      hand: 100,
      machine: 40,
      etched: 60,
      deep: 120,
    };

    const basePricePerGram = priceCalculation[material] || 100;
    const weight = Math.random() * 5 + 10; // 10-15 grams simulated
    const stylePrice =
      basePricePerGram * weight * (styleMultiplier[style] || 1.0);
    const totalPrice = Math.round(
      stylePrice + (engravingCost[engraving] || 0) + 1000
    );

    // Simulated crafting time calculation
    const daysMin = Math.floor(Math.random() * 10 + 25);
    const daysMax = daysMin + 5;

    res.json({
      success: true,
      modelPath:
        "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb", // Placeholder until model generation is implemented
      design,
      material,
      style,
      engraving,
      price: totalPrice,
      days: `${daysMin}-${daysMax}`,
      weight: weight.toFixed(2),
      processingTime: `${(delay / 1000).toFixed(1)}s`,
      ...otherConfig,
    });
  } catch (error) {
    console.error("Geometry update error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update geometry",
      message: error.message,
    });
  }
});

/**
 * POST /api/validate-materials
 *
 * Validates material combinations (e.g., Palladium with certain settings).
 * Returns compatible materials and settings or restrictions.
 */
app.post("/api/validate-materials", async (req, res) => {
  try {
    const { material, style, engraving } = req.body;

    // Mock validation rules
    const restrictions = {
      palladium: {
        incompatible: ["deep"],
        warning: "Palladium is too soft for deep engraving",
      },
      silver: {
        incompatible: [],
        warning: null,
      },
      gold: {
        incompatible: [],
        warning: null,
      },
      platinum: {
        incompatible: [],
        warning: null,
      },
    };

    const rule = restrictions[material] || {};
    const isValid = !rule.incompatible?.includes(engraving);

    res.json({
      valid: isValid,
      material,
      message: rule.warning || "Material combination is compatible",
    });
  } catch (error) {
    console.error("Material validation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate materials",
      message: error.message,
    });
  }
});

/**
 * GET /api/pricing
 *
 * Returns a pricing breakdown for display in the UI.
 */
app.get("/api/pricing", async (req, res) => {
  try {
    res.json({
      basePrice: 1000,
      materialMultiplier: 1.2,
      styleMultiplier: 1.3,
      engravingCost: 50,
      estimatedTotal: 1500,
      estimatedDays: "30-35",
    });
  } catch (error) {
    console.error("Pricing error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pricing",
    });
  }
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log(`Available endpoints:`);
  console.log(`  POST /api/geometry-update - Update design geometry`);
  console.log(
    `  POST /api/validate-materials - Validate material compatibility`
  );
  console.log(`  GET /api/pricing - Get pricing breakdown`);
});
