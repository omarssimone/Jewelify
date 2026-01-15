import React, { useRef, useEffect, useState } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";

/**
 * JewelModel Component
 * Handles the 3D model with HYBRID rendering strategy:
 * - INSTANT changes: Material, Color, Polish (Frontend only)
 * - ASYNC changes: Geometry (Server API with loading state)
 */
const OBJModel = ({ modelPath }) => {
  const object = useLoader(OBJLoader, modelPath);
  return <primitive object={object} scale={0.01} />;
};

const GLTFModel = ({ modelPath, scale = 1, materialColor, config }) => {
  const { scene } = useGLTF(modelPath);

  // Applica colore metallo, polish e colore stone
  useEffect(() => {
    if (!scene) return;
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
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const mat = Array.isArray(child.material) ? child.material[0] : child.material;
        const childNameLower = child.name.toLowerCase();
        const isStone = childNameLower.includes("stone") || childNameLower.includes("gem");

        // METAL (solo se non è stone e materialColor è passato)
        if (!isStone && materialColor) {
          if (mat && mat.isMeshStandardMaterial) {
            mat.color.setHex(colorMap[materialColor] || 0xffd700);
            const MIN_ROUGHNESS = 0.08;
            const MAX_ROUGHNESS = 0.6;
            if (typeof config?.polish === 'number') {
              mat.roughness = MIN_ROUGHNESS + (1 - config.polish) * (MAX_ROUGHNESS - MIN_ROUGHNESS);
            }
            mat.metalness = 1.0;
            // Do NOT set opacity for metal
            mat.needsUpdate = true;
          }
        }

        // STONE (applica sempre colore stone a tutti i mesh del modello stone)
        if (!materialColor && config?.stoneColor) {
          // Se non c'è materialColor, questo è il modello stone: colora tutti i mesh
          if (mat && mat.isMeshStandardMaterial) {
            mat.color.setHex(stoneColorMap[config.stoneColor] || 0xffffff);
            mat.roughness = 0.0;
            mat.metalness = 0.0;
            mat.transparent = true;
            // Apply clarity (opacity) only to stone
            if (typeof config?.clarity === 'number') {
              // Set minimum opacity to 0.7 (so stone never gets too transparent)
              mat.opacity = 0.7 + config.clarity * 0.3; // 0.7 (min) to 1.0 (max)
            } else {
              mat.opacity = 0.9;
            }
            mat.needsUpdate = true;
          }
        }
      }
    });
  }, [scene, materialColor, config?.polish, config?.stoneColor, config?.clarity]);

  // Usa direttamente primitive per renderizzare la scene
  return <primitive object={scene} scale={scale} position={[0, -0.7, 0]} />;
};

const JewelModel = ({
  modelPath = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
  config,
  onMaterialUpdate,
}) => {
  const groupRef = useRef();
  const [materialStore, setMaterialStore] = useState({
    baseColor: new THREE.Color(0xffd700), // Gold default
    polishLevel: 1.0, // 0-1
    metalColor: "gold",
    stoneColor: new THREE.Color(0xffffff), // White default
  });

  // The model loading is handled by child components (GLTFModel/OBJModel)

  // previously we added the loaded glTF scene directly to the groupRef when it changed.
  // Now GLTF/OBJ models are rendered as children of this group, so there's no direct
  // reference to a scene object here.

  // INSTANT: Update material colors and properties (Frontend-only)
  useEffect(() => {

    // Debug: log ogni volta che cambia polish
    let foundMesh = false;
    if (groupRef.current) {
      groupRef.current.traverse((mesh) => {
        if (mesh.isMesh && mesh.material) {
          if (
            mesh.name.toLowerCase().includes("band") ||
            mesh.name.toLowerCase().includes("metal") ||
            mesh.name.toLowerCase().includes("head")
          ) {
            foundMesh = true;
          }
        }
      });
    }
    if (config?.polish !== undefined) {
      if (foundMesh) {
        console.log(`[JewelModel] Polish: ${config.polish}`);
      } else {
        console.log(`[JewelModel] Polish: ${config.polish} (no mesh found)`);
      }
    }
    if (!groupRef.current) return;

    groupRef.current.traverse((mesh) => {
      if (mesh.isMesh && mesh.material) {
        // --- METAL MATERIAL (band, head, ecc.) ---
        if (
          mesh.name.toLowerCase().includes("band") ||
          mesh.name.toLowerCase().includes("metal") ||
          mesh.name.toLowerCase().includes("head")
        ) {
          let material = mesh.material instanceof Array ? mesh.material[0] : mesh.material;
          // Se non è già MeshPhysicalMaterial, convertilo
          if (material && !material.isMeshPhysicalMaterial && THREE.MeshPhysicalMaterial) {
            const newMat = new THREE.MeshPhysicalMaterial();
            newMat.copy(material);
            mesh.material = newMat;
            material = newMat;
          }
          if (material && (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial)) {
            // Colore metallo
            if (config?.materialColor) {
              const colorMap = {
                gold: 0xffd700,
                silver: 0xf5f3e7,
                rose: 0xb76e79,
                platinum: 0xc0e0ff,
              };
              material.color.setHex(colorMap[config.materialColor] || 0xffd700);
            }
            // Aspetto metallico ancora più realistico
            material.metalness = 1.0;
            // Polish: 0 (matte) -> roughness 1, 1 (mirror) -> roughness 0
            if (typeof config?.polish === 'number') {
              material.roughness = 1 - config.polish;
              console.log(`[JewelModel] mesh: ${mesh.name}, polish: ${config.polish}, roughness: ${material.roughness}`);
            } else {
              material.roughness = 0.08;
              console.log(`[JewelModel] mesh: ${mesh.name}, polish: default, roughness: 0.08`);
            }
            material.clearcoat = 1.0;
            material.clearcoatRoughness = 0.05;
            material.reflectivity = 1.0;
            material.envMapIntensity = 1.5;
            material.needsUpdate = true;
            // Applica una envMap semplice per riflessi (se non già presente)
            if (!material.envMap) {
              const envMap = new THREE.TextureLoader().load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/cube/SwedishRoyalCastle/px.jpg");
              material.envMap = envMap;
              material.envMapIntensity = 1.5;
            }
          }
        }
        // --- STONE/GEM MATERIAL ---
        if (mesh.name.toLowerCase().includes("stone") || mesh.name.toLowerCase().includes("gem")) {
          const material = mesh.material instanceof Array ? mesh.material[0] : mesh.material;
          if (material && material.isMeshStandardMaterial) {
            // Update stone color instantly
            if (config?.stoneColor) {
              const stoneColorMap = {
                clear: 0xe0f7ff,   // Clear: azzurro molto chiaro
                pink: 0xffc0cb,
                blue: 0x0000ff,
                green: 0x00ff00,
                red: 0xff0000,
                yellow: 0xffe066,  // Yellow: più caldo, giallo intenso
              };
              material.color.setHex(
                stoneColorMap[config.stoneColor] || 0xffffff
              );
            }

            // Update stone transparency
            if (config?.clarity !== undefined) {
              material.transparent = true;
              material.opacity = 0.5 + config.clarity * 0.5; // 50-100% opacity
            }
          }
        }
      }
    });

    // Store for reference
    setMaterialStore({
      metalColor: config?.materialColor || "gold",
      stoneColor: config?.stoneColor || "clear",
      polishLevel: config?.polish || 1.0,
    });

    if (onMaterialUpdate) {
      onMaterialUpdate(materialStore);
    }
  }, [config?.materialColor, config?.polish, config?.stoneColor, config?.clarity, onMaterialUpdate, materialStore]);

  const cleanPath = (modelPath || "").split("?")[0].toLowerCase();
  const ext = cleanPath.split(".").pop();
  const isObj = ext === "obj";
  const isBraceletPlaceholder = cleanPath.includes("bracelet");

  // If using the placeholder Bracelet.obj, render a simple torus so the user sees a bracelet
  if (isBraceletPlaceholder) {
    return (
      <group ref={groupRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.6, 1.6, 1.6]}>
        <mesh name="band" castShadow receiveShadow position={[0, 0, 0]}>
          <torusGeometry args={[0.7, 0.14, 32, 160]} />
          <meshStandardMaterial
            metalness={0.95}
            roughness={0.12}
            color={
              ({ gold: 0xffd700, silver: 0xe8e8e8, rose: 0xb76e79 }[config?.materialColor] || 0xffd700)
            }
          />
        </mesh>
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 10, 10]} intensity={0.9} />
      </group>
    );
  }

  // Forza il remount del gruppo 3D quando cambia polish
  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, 0, 0]} key={`polish-${config?.polish}`}>
      {isObj ? (
        <OBJModel modelPath={modelPath} />
      ) : (
        <GLTFModel modelPath={modelPath} />
      )}
    </group>
  );
};

/**
 * ThreeCanvas Component
 * Main 3D rendering component with orbit controls and responsive sizing
 * Optimized for tablet touch interaction
 */
const ThreeCanvas = ({ config = {}, isLoading = false, onUndo, onRedo, canUndo = false, canRedo = false, onRecalculate, onConfirmOrder, onPartClick }) => {
  const canvasRef = useRef();
  const [zoomLevel, setZoomLevel] = useState(65);
  const MAX_ZOOM = 100;
  const raycastingRef = useRef({ raycaster: new THREE.Raycaster(), mouse: new THREE.Vector2() });
  const sceneRef = useRef();
  const cameraRef = useRef();
  const [hoveredPart, setHoveredPart] = useState(null);
  const [isExploded, setIsExploded] = useState(false);
  const meshesRef = useRef(new Map()); // Map per tracciare i materiali originali
  const originalPositionsRef = useRef(new Map()); // Map per tracciare le posizioni originali

  // Drag and interaction state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const clickTimeRef = useRef(0);
  const lastClickRef = useRef(null);
  const DOUBLE_CLICK_THRESHOLD = 300; // milliseconds

  // Combined ring models from local public folder
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const bandPath = config.bandPath || `${baseUrl}/models/ring/BAND_CLASSIC.glb`;
  const headPath = `${baseUrl}/models/ring/HEAD_4PRONGS.glb`;
  const stonePath = config.stonePath || `${baseUrl}/models/ring/STONE_BRILLIANT.glb`;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 2, MAX_ZOOM));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 2, 2));

  // Auto-reassemble ring when config changes (user modifies an element)
  useEffect(() => {
    if (isExploded) {
      console.log("Config changed - auto-reassembling ring");
      setIsExploded(false);
      applyExplosion(false);
    }
  }, [config?.materialColor, config?.bandMaterialColor, config?.stoneColor, config?.polish, config?.clarity, config?.bandPath, config?.stonePath]);

  // Funzione per applicare l'effetto esplosione
  const applyExplosion = (explode) => {
    if (!sceneRef.current) return;

    const explosionDistance = 0.002; // Distanza molto piccola perché i modelli sono scalati 65x

    sceneRef.current.traverse((obj) => {
      if (obj.isMesh) {
        const objectName = obj.name.toLowerCase();
        let originalPos = originalPositionsRef.current.get(obj.name);

        if (!originalPos) {
          // Salva la posizione originale al primo accesso
          originalPos = {
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z,
          };
          originalPositionsRef.current.set(obj.name, originalPos);
          console.log(`Saved original position for ${obj.name}:`, originalPos);
        }

        if (explode) {
          // Determina la direzione di separazione in base al tipo di pezzo
          let offsetY = 0;

          if (objectName.includes("stone") || objectName.includes("gem") || objectName.includes("brilliant") || objectName.includes("diamond")) {
            // Stone: sposta verso l'alto (aumentato)
            offsetY = explosionDistance * 3;
          } else if (objectName.includes("head") || objectName.includes("prong")) {
            // Head: sposta leggermente verso l'alto (meno della stone)
            offsetY = explosionDistance;
          } else if (objectName.includes("band") || objectName.includes("classic") || objectName.includes("knife") || objectName.includes("flat")) {
            // Band: sposta verso il basso
            offsetY = -explosionDistance;
          }

          obj.position.y = originalPos.y + offsetY;

          console.log(`Exploding ${obj.name}: Y from ${originalPos.y.toFixed(5)} to ${obj.position.y.toFixed(5)} (offset: ${offsetY.toFixed(5)})`);
        } else {
          // Ritorna alla posizione originale
          obj.position.x = originalPos.x;
          obj.position.y = originalPos.y;
          obj.position.z = originalPos.z;

          console.log(`Collapsing ${obj.name}: returned to Y=${originalPos.y.toFixed(5)}`);
        }
      }
    });
  };

  // Handle mouse move for hover detection
  const handleCanvasMouseMove = (e) => {
    if (!sceneRef.current || !cameraRef.current || !canvasRef.current) return;

    // If dragging, update model position instead of hovering
    if (isDragging) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      // Move camera/orbit controls based on drag
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Normalizza coordinate mouse
    raycastingRef.current.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    raycastingRef.current.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Esegui raycasting
    raycastingRef.current.raycaster.setFromCamera(raycastingRef.current.mouse, cameraRef.current);

    // Raccogli tutti gli oggetti della scena
    const allObjects = [];
    sceneRef.current.traverse((obj) => {
      if (obj.isMesh) {
        allObjects.push(obj);
      }
    });

    const intersects = raycastingRef.current.raycaster.intersectObjects(allObjects);

    // Reset tutti i mesh al colore originale
    meshesRef.current.forEach((originalMaterial, meshName) => {
      const mesh = sceneRef.current.getObjectByName(meshName);
      if (mesh && mesh.isMesh) {
        mesh.material.emissive.setHex(0x000000);
      }
    });

    let currentPart = null;
    if (intersects.length > 0) {
      const hoveredObject = intersects[0].object;
      const objectName = hoveredObject.name.toLowerCase();

      // Determina quale pezzo è sotto il cursore
      if (objectName.includes("band") || objectName.includes("classic") || objectName.includes("knife") || objectName.includes("flat")) {
        currentPart = "band";
      } else if (objectName.includes("head") || objectName.includes("prong")) {
        currentPart = "head";
      } else if (objectName.includes("stone") || objectName.includes("gem") || objectName.includes("brilliant") || objectName.includes("diamond")) {
        currentPart = "stone";
      }

      // Evidenzia il mesh con emissive color quando esploso
      if (currentPart && isExploded) {
        hoveredObject.material.emissive.setHex(0x444444);
      }

      canvas.style.cursor = isExploded ? 'pointer' : 'grab';
    } else {
      canvas.style.cursor = 'default';
    }

    setHoveredPart(currentPart);
  };

  // Handle click on canvas
  const handleCanvasClick = (e) => {
    console.log("handleCanvasClick triggered");

    if (!sceneRef.current || !cameraRef.current || isLoading) {
      console.log("Missing refs:", { scene: !!sceneRef.current, camera: !!cameraRef.current, isLoading });
      return;
    }

    if (!canvasRef.current) {
      console.log("No canvas ref");
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    console.log("Canvas clicked at:", e.clientX, e.clientY);

    // Normalizza coordinate mouse rispetto al canvas
    raycastingRef.current.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    raycastingRef.current.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    console.log("Normalized mouse:", raycastingRef.current.mouse);

    // Esegui raycasting
    raycastingRef.current.raycaster.setFromCamera(raycastingRef.current.mouse, cameraRef.current);

    // Raccogli tutti gli oggetti della scena
    const allObjects = [];
    sceneRef.current.traverse((obj) => {
      if (obj.isMesh) {
        allObjects.push(obj);
        console.log("Found mesh:", obj.name);
      }
    });

    console.log("Total meshes:", allObjects.length);

    const intersects = raycastingRef.current.raycaster.intersectObjects(allObjects);

    console.log("Intersects:", intersects.length);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      const objectName = clickedObject.name.toLowerCase();

      console.log("Clicked object:", clickedObject.name);

      let partName = null;
      // Riconosci i nomi dei mesh
      if (objectName.includes("band") || objectName.includes("classic") || objectName.includes("knife") || objectName.includes("flat")) {
        partName = "band";
      } else if (objectName.includes("head") || objectName.includes("prong")) {
        partName = "head";
      } else if (objectName.includes("stone") || objectName.includes("gem") || objectName.includes("brilliant") || objectName.includes("diamond")) {
        partName = "stone";
      }

      console.log("Part name:", partName);

      // Single click: open ring and allow modification
      if (!isExploded) {
        console.log("Single-click detected - exploding ring");
        setIsExploded(true);
        applyExplosion(true);
      } else if (partName && onPartClick) {
        // If ring is already open, handle part selection
        console.log("Part clicked while ring is open:", partName);
        onPartClick(partName);
      }
    }
  };

  // Handle mouse down for drag start
  const handleCanvasMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    console.log("Mouse down - drag started");
  };

  // Handle mouse up for drag end
  const handleCanvasMouseUp = (e) => {
    setIsDragging(false);
    console.log("Mouse up - drag ended");
  };

  // Aggiungi event listener al canvas al mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseLeave = () => {
      console.log("Mouse left canvas");
      setIsDragging(false);
      canvas.style.cursor = 'default';
    };

    console.log("Attaching click and mousemove listeners to canvas");
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
      canvas.removeEventListener('mousedown', handleCanvasMouseDown);
      canvas.removeEventListener('mouseup', handleCanvasMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      console.log("Removing listeners from canvas");
    };
  }, [isLoading, onPartClick, isExploded, isDragging]);

  return (
    <div className="three-canvas-container">
      {/* Undo/Redo controls - left side */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        alignItems: 'flex-start'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            style={{
              width: '48px',
              height: '48px',
              padding: '0',
              margin: '0',
              border: '2px solid #ddd',
              borderRadius: '50%',
              background: canUndo ? 'white' : '#f0f0f0',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              opacity: canUndo ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              flexShrink: 0,
              border: 'none'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
            </svg>
          </button>
          <span style={{
            fontSize: '11px',
            color: '#888',
            fontWeight: '500',
            textAlign: 'center',
            minWidth: '50px'
          }}>Undo</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            style={{
              width: '48px',
              height: '48px',
              padding: '0',
              margin: '0',
              border: '2px solid #ddd',
              borderRadius: '50%',
              background: canRedo ? 'white' : '#f0f0f0',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              opacity: canRedo ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              flexShrink: 0,
              border: 'none'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
            </svg>
          </button>
          <span style={{
            fontSize: '11px',
            color: '#888',
            fontWeight: '500',
            textAlign: 'center',
            minWidth: '50px'
          }}>Redo</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={onRecalculate}
            disabled={isLoading}
            title="Recalculate"
            style={{
              width: '48px',
              height: '48px',
              padding: '0',
              margin: '0',
              borderRadius: '50%',
              border: '2px solid #ddd',
              background: isLoading ? '#f0f0f0' : 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              opacity: isLoading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
          <span style={{
            fontSize: '11px',
            color: '#888',
            fontWeight: '500',
            textAlign: 'center',
            minWidth: '50px'
          }}>Recalculate</span>
        </div>
      </div>


      {/* Confirm Order button - top center */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10
      }}>
        {isExploded ? (
          <button
            onClick={() => {
              console.log("Reassemble button clicked");
              setIsExploded(false);
              applyExplosion(false);
            }}
            disabled={isLoading}
            title="Reassemble Ring"
            style={{
              padding: '12px 28px',
              fontSize: '0.95rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderRadius: '6px',
              border: 'none',
              background: isLoading ? '#999' : '#ff6b6b',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            Reassemble Ring
          </button>
        ) : (
          <button
            onClick={onConfirmOrder}
            disabled={isLoading}
            title="Confirm Order"
            style={{
              padding: '12px 28px',
              fontSize: '0.95rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderRadius: '6px',
              border: 'none',
              background: isLoading ? '#999' : '#000',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            Confirm Order
          </button>
        )}
      </div>

      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 4], fov: 50 }}
        className="canvas-main"
        gl={{ antialias: true, alpha: true }}
        onCreated={(state) => {
          sceneRef.current = state.scene;
          cameraRef.current = state.camera;
          console.log("Canvas created, refs set");
        }}
      >
        {/* HDRI Environment for realistic reflections */}
        <React.Suspense fallback={null}>
          <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr" background={false} />
        </React.Suspense>
        {/* Lighting setup for jewelry */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 7]} intensity={1} />
        <directionalLight position={[-5, -10, -7]} intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={0.8} />

        {/* Render combined ring model */}
        <React.Suspense fallback={null}>
          <GLTFModel modelPath={bandPath} scale={zoomLevel} materialColor={config.bandMaterialColor || config.materialColor} config={config} />
          <GLTFModel modelPath={headPath} scale={zoomLevel} materialColor={config.materialColor} config={config} />
          <GLTFModel modelPath={stonePath} scale={zoomLevel} config={config} />
        </React.Suspense>

        {/* Orbit controls for touch interaction */}
        <OrbitControls
          autoRotate
          autoRotateSpeed={2}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={100}
        />
      </Canvas>

      {/* Loading overlay for geometry changes */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p className="loading-text">Reshaping metal...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeCanvas;
