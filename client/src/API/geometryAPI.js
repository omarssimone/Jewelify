/**
 * Geometry API Utilities
 * 
 * HYBRID RENDERING STRATEGY:
 * This module handles communication with the server for geometry changes.
 * Instant material changes (color, polish) are handled client-side in ThreeCanvas.jsx
 * Only geometry, material type, and style changes go through this API.
 */

const SERVER_URL = "http://localhost:3001";

/**
 * Update Geometry
 * 
 * Called when:
 * - Design changes (geometric, organic, delicate, bold)
 * - Material type changes (palladium, gold, silver, platinum)
 * - Style changes (pavé, solitaire, halo, three-stone)
 * - Engraving type changes (laser, hand, machine, etched, deep)
 * 
 * These changes require mesh manipulation on the server and return
 * a new GLB model path.
 * 
 * @param {Object} config - Current design configuration
 * @returns {Promise<Object>} Updated config with new model path and pricing
 */
export async function updateGeometry(config) {
  try {
    const response = await fetch(`${SERVER_URL}/api/geometry-update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update geometry");
    }

    return data;
  } catch (error) {
    console.error("Geometry update failed:", error);
    throw error;
  }
}

/**
 * Validate Material Compatibility
 * 
 * Checks if a material can be used with the current settings.
 * Returns warnings or blocking errors.
 * 
 * @param {string} material - Material type
 * @param {string} style - Style type
 * @param {string} engraving - Engraving type
 * @returns {Promise<Object>} Validation result with compatibility info
 */
export async function validateMaterials(material, style, engraving) {
  try {
    const response = await fetch(`${SERVER_URL}/api/validate-materials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ material, style, engraving }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Material validation failed:", error);
    throw error;
  }
}

/**
 * Get Pricing Info
 * 
 * Fetches current pricing breakdown and estimated crafting time.
 * 
 * @returns {Promise<Object>} Pricing breakdown
 */
export async function getPricing() {
  try {
    const response = await fetch(`${SERVER_URL}/api/pricing`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch pricing:", error);
    throw error;
  }
}

/**
 * Calculate Price
 * 
 * Simple client-side price calculation based on configuration.
 * This is for UI estimation only - server returns actual price.
 * 
 * @param {Object} config - Design configuration
 * @returns {number} Estimated price
 */
export function calculateEstimatedPrice(config) {
  const materialPrices = {
    palladium: 100,
    gold: 80,
    silver: 50,
    platinum: 150,
  };

  const styleMultipliers = {
    pavé: 1.5,
    solitaire: 1.0,
    halo: 1.8,
    "three-stone": 1.6,
  };

  const engravingCosts = {
    laser: 50,
    hand: 100,
    machine: 40,
    etched: 60,
    deep: 120,
  };

  const basePrice = materialPrices[config.material] || 100;
  const stylePrice = basePrice * (styleMultipliers[config.style] || 1.0) * 10;
  const engravingPrice = engravingCosts[config.engraving] || 0;

  return Math.round(stylePrice + engravingPrice + 1000);
}
