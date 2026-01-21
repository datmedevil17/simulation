import * as THREE from 'three';
import { AssetManager } from './assets/assetManager.js';
import { CameraManager } from './camera.js';
import { InputManager } from './input.js';
import { City } from './sim/city.js';
import { SimObject } from './sim/simObject.js';

/** 
 * Manager for the Three.js scene. Handles rendering of a `City` object
 */
export class Game {
  /**
   * @type {City}
   */
  city;
  /**
   * Object that currently hs focus
   * @type {SimObject | null}
   */
  focusedObject = null;
  /**
   * Class for managing user input
   * @type {InputManager}
   */
  inputManager;
  /**
   * Object that is currently selected
   * @type {SimObject | null}
   */
  selectedObject = null;

  constructor(container, city, onLoad) {
    this.city = city;
    this.onLoad = onLoad;
    
    // Callbacks for UI updates
    this.onSelectedObjectChanged = null;
    this.onSimulationChanged = null;

    // Simulation state
    this.isPaused = false;
    this.activeToolId = 'select';
    
    this.isDisposed = false;
    this.simulationInterval = null;

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true
    });
    this.scene = new THREE.Scene();

    this.inputManager = new InputManager(container);
    this.cameraManager = new CameraManager(container);

    // Configure the renderer
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // Add the renderer to the DOM
    container.appendChild(this.renderer.domElement);

    // Variables for object selection
    this.raycaster = new THREE.Raycaster();

    /**
     * Global instance of the asset manager
     */
    window.assetManager = new AssetManager(() => {
      // If the game was disposed before assets finished loading, stop here
      if (this.isDisposed) return;

      if (!this.city) {
        this.city = new City(16);
      }
      this.initialize(this.city);
      this.start();

      this.simulationInterval = setInterval(this.simulate.bind(this), 1000);

      if (this.onLoad) this.onLoad();
    });

    // Handle Resize
    this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            this.onResize(entry.contentRect.width, entry.contentRect.height);
        }
    });
    this.resizeObserver.observe(container);
  }

  /**
   * Initalizes the scene, clearing all existing assets
   */
  initialize(city) {
    this.scene.clear();
    this.scene.add(city);
    this.#setupLights();
    this.#setupGrid(city);
  }

  #setupGrid(city) {
    // Add the grid
    const gridMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      map: window.assetManager.textures['grid'],
      transparent: true,
      opacity: 0.2
    });
    gridMaterial.map.repeat = new THREE.Vector2(city.size, city.size);
    gridMaterial.map.wrapS = city.size;
    gridMaterial.map.wrapT = city.size;

    const grid = new THREE.Mesh(
      new THREE.BoxGeometry(city.size, 0.1, city.size),
      gridMaterial
    );
    grid.position.set(city.size / 2 - 0.5, -0.04, city.size / 2 - 0.5);
    this.scene.add(grid);
  }

  /**
   * Setup the lights for the scene
   */
  #setupLights() {
    const sun = new THREE.DirectionalLight(0xffffff, 2)
    sun.position.set(-10, 20, 0);
    sun.castShadow = true;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 50;
    sun.shadow.normalBias = 0.01;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  }
  
  /**
   * Starts the renderer
   */
  start() {
    this.renderer.setAnimationLoop(this.draw.bind(this));
  }

  /**
   * Stops the renderer
   */
  stop() {
    this.renderer.setAnimationLoop(null);
  }

  /**
   * Render the contents of the scene
   */
  draw() {
    this.city.draw();
    this.updateFocusedObject();

    if (this.inputManager.isLeftMouseDown) {
      console.log(`Mouse down detected. Active tool: ${this.activeToolId}, Focused object:`, this.focusedObject);
      this.useTool();
    }

    this.renderer.render(this.scene, this.cameraManager.camera);
  }

  /**
   * Moves the simulation forward by one step
   */
  simulate() {
    if (this.isPaused) return;

    // Update the city data model first, then update the scene
    this.city.simulate(1);

    if (this.onSimulationChanged) {
        this.onSimulationChanged(this.city);
    }
  }

  /**
   * Uses the currently active tool
   */
  /**
   * Updates the game state from Solana
   */
  updateFromSolana(account) {
      if (!account) return;
      this.city.updateFromSolana(account);
  }

  /**
   * Uses the currently active tool
   */
  useTool() {
    switch (this.activeToolId) {
      case 'select':
        this.updateSelectedObject();
        this.lastToolX = -1;
        this.lastToolY = -1;
        break;
      case 'bulldoze':
        if (this.focusedObject) {
          const { x, y } = this.focusedObject;
          
          // Check if we should use Solana integration
          const useSolana = this.simCity && 
                           typeof this.simCity.bulldoze === 'function' && 
                           this.simCity.cityAccount;
          
          if (useSolana) {
             // Prevent repeated placements on same tile while mouse is held down
             if (this.lastToolX === x && this.lastToolY === y && this.inputManager.isLeftMouseDown) return;
             this.lastToolX = x;
             this.lastToolY = y;
             
             console.log(`Bulldozing via Solana at [${x}, ${y}]`);
             this.simCity.bulldoze(x, y)
                .then(tx => console.log("Bulldoze successful, tx:", tx))
                .catch(err => {
                   console.error("Bulldoze failed:", err);
                   // Fallback to local bulldoze on error
                   this.city.bulldoze(x, y);
                });
          } else {
             console.log(`Bulldozing locally at [${x}, ${y}]`);
             this.city.bulldoze(x, y);
          }
        }
        break;
      default:
        if (this.focusedObject) {
          const { x, y } = this.focusedObject;
          
          // Check if we should use Solana integration
          const useSolana = this.simCity && 
                           typeof this.simCity.placeBuilding === 'function' && 
                           this.simCity.cityAccount;
          
          if (useSolana) {
             // Prevent repeated placements on same tile while mouse is held down
             if (this.lastToolX === x && this.lastToolY === y && this.inputManager.isLeftMouseDown) return;
             this.lastToolX = x;
             this.lastToolY = y;

             const toolIdMap = {
                 'residential': 2,
                 'commercial': 3,
                 'industrial': 4,
                 'road': 1,
                 'power-plant': 5,
                 'power-line': 6
             };
             const typeId = toolIdMap[this.activeToolId];
             
             if (typeId) {
                 console.log(`Placing building via Solana: ${this.activeToolId} (ID: ${typeId}) at [${x}, ${y}]`);
                 this.simCity.placeBuilding(x, y, typeId)
                    .then(tx => console.log("Placement successful, tx:", tx))
                    .catch(err => {
                       console.error("Placement failed:", err);
                       // Fallback to local placement on error
                       this.city.placeBuilding(x, y, this.activeToolId);
                    });
             } else {
                 console.warn("Unknown tool ID:", this.activeToolId);
             }
          } else {
             // Use local city placement
             console.log(`Placing building locally: ${this.activeToolId} at [${x}, ${y}]`);
             this.city.placeBuilding(x, y, this.activeToolId);
          }
        }
        break;
    }
  }
  
  /**
   * Sets the currently selected object and highlights it
   */
  updateSelectedObject() {
    this.selectedObject?.setSelected(false);
    this.selectedObject = this.focusedObject;
    this.selectedObject?.setSelected(true);

    if (this.onSelectedObjectChanged) {
        this.onSelectedObjectChanged(this.selectedObject);
    }
  }

  /**
   * Sets the object that is currently highlighted
   */
  updateFocusedObject() {  
    this.focusedObject?.setFocused(false);
    const newObject = this.#raycast();
    if (newObject !== this.focusedObject) {
      this.focusedObject = newObject;
    }
    this.focusedObject?.setFocused(true);
  }

  /**
   * Gets the mesh currently under the the mouse cursor. If there is nothing under
   * the the mouse cursor, returns null
   * @param {MouseEvent} event Mouse event
   * @returns {THREE.Mesh | null}
   */
  #raycast() {
    var coords = {
      x: (this.inputManager.mouse.x / this.renderer.domElement.clientWidth) * 2 - 1,
      y: -(this.inputManager.mouse.y / this.renderer.domElement.clientHeight) * 2 + 1
    };

    this.raycaster.setFromCamera(coords, this.cameraManager.camera);

    let intersections = this.raycaster.intersectObjects(this.city.root.children, true);
    if (intersections.length > 0) {
      // The SimObject attached to the mesh is stored in the user data
      const selectedObject = intersections[0].object.userData;
      return selectedObject;
    } else {
      return null;
    }
  }

  /**
   * Resizes the renderer to fit the current game window
   */
  onResize(width, height) {
    this.cameraManager.resize(width, height);
    this.renderer.setSize(width, height);
  }
  
  dispose() {
      this.isDisposed = true;
      this.stop();
      if (this.simulationInterval) {
        clearInterval(this.simulationInterval);
      }
      this.renderer.dispose();
      this.resizeObserver.disconnect();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
  }
}

// Window.onload removed in favor of React component initialization