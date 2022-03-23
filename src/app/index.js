import * as THREE from "three";

/**
 * ! Constants
 */

const Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xf5986e,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
};

let scene,
  camera,
  fieldOfView,
  aspectRatio,
  nearPlane,
  farPlane,
  HEIGHT,
  WIDTH,
  renderer,
  container,
  clock;

let hemisphereLight, shadowLight;

let sea, cloud, sky, airplane;

let mousePos = { x: 0, y: 0 };

/**
 * ! Init
 */

window.addEventListener("load", init, false);

function init() {
  // Setup scene, camera, renderer
  createScene();

  // Setup lights
  createLights();

  // Setup objects
  createPlane();
  createSea();
  createSky();

  // Clock
  clock = new THREE.Clock();

  // Event Listener
  window.addEventListener("mousemove", handleMouseMove, false);

  // update object position and render
  loop();
}

/**
 * ! Create Scene
 */

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function createScene() {
  //Get with and height of the scene
  // Use them to setup the aspect ratio of camera
  // and the size of renderer
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  // Create scene
  scene = new THREE.Scene();

  // Add fog effect
  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

  // Create the camera
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );

  // Set position of camera
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

  // Create the renderer
  renderer = new THREE.WebGLRenderer({
    // allow transparency to show the gradient bg
    alpha: true,

    // activate the anti-aliasing
    antialias: true,
  });

  // Define the size of the renderer
  renderer.setSize(WIDTH, HEIGHT);

  // Enabled shadow rendering
  renderer.shadowMap.enabled = true;

  // Add DOM Element of the renderer
  container = document.getElementById("world");
  container.appendChild(renderer.domElement);

  // Listen to the screen
  window.addEventListener("resize", handleWindowResize, false);
}

/**
 * ! Create Lights
 */
function createLights() {
  // A hemisphere light is a gradient colored Light
  // 1: sky Color, 2: ground Color, 3: intensity of the light
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);

  // A directional light shines from a specific direction
  // it acts like the sun
  shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

  // Set the position of the light
  shadowLight.position.set(150, 350, 350);

  // Allow shadow casting
  shadowLight.castShadow = true;

  // Define the visible area
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  // Define the resolution of the shadow
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  // To activate the lights, just add them to the scene
  scene.add(hemisphereLight);
  scene.add(shadowLight);
}

/**
 * Sea
 */

function Sea() {
  // create Geometry of the cylinder
  const geometry = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
  geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

  // create Material
  const material = new THREE.MeshPhongMaterial({
    color: Colors.blue,
    transparent: true,
    opacity: 0.6,
    flatShading: true,
  });

  const l = geometry.attributes.position.array.length / 3;
  this.waves = [];

  for (let i = 0; i < l; i++) {
    this.waves.push({
      ang: Math.random() * Math.PI * 2,
      amp: 5 + Math.random() * 15,
      speed: 0.016 + Math.random() * 0.032,
    });
  }

  // create Mesh
  this.mesh = new THREE.Mesh(geometry, material);

  // setup Mesh
  this.mesh.receiveShadow = true;
}

Sea.prototype.moveWaves = function () {
  const verts = this.mesh.geometry.attributes.position.array;
  const l = verts.length / 3;

  for (let i = 0; i < l; i++) {
    const vProps = this.waves[i];

    this.mesh.geometry.attributes.position.array[l * i + 0] +=
      Math.cos(vProps.ang) * vProps.amp;
    this.mesh.geometry.attributes.position.array[l * i + 1] +=
      Math.sin(vProps.ang) * vProps.amp;

    vProps.ang += vProps.speed;
  }

  this.mesh.geometry.attributes.position.needsUdpate = true;
};

function createSea() {
  sea = new Sea();

  sea.mesh.position.y = -600;

  scene.add(sea.mesh);
}

/**
 * Sky
 */

function Cloud() {
  // crate an empty container
  this.mesh = new THREE.Object3D();

  // create a cube geometry
  const geometry = new THREE.BoxGeometry(20, 20, 20);

  // create a material
  const material = new THREE.MeshPhongMaterial({
    color: Colors.white,
  });

  // duplicate the geometery a random number of times
  const nBlocs = 3 + Math.floor(Math.random() * 3);

  for (let i = 0; i < nBlocs; i++) {
    // create the Mesh
    const m = new THREE.Mesh(geometry, material);

    // set the Position
    m.position.x = i * 15;
    m.position.y = Math.random() * 10;
    m.position.z = Math.random() * 10;
    m.rotation.z = Math.random() * Math.PI * 2;
    m.rotation.y = Math.random() * Math.PI * 2;

    // set the size of cube
    const s = 0.1 + Math.random() * 0.9;
    m.scale.set(s, s, s);

    m.castShadow = true;
    m.receiveShadow = true;

    // add cube to the container
    this.mesh.add(m);
  }
}

function Sky() {
  // Empty Container
  this.mesh = new THREE.Object3D();

  // Number of clouds
  this.nClouds = 20;

  // To distribute the clouds consistently,
  // place them according to a uniform angle
  const stepAngle = (Math.PI * 2) / this.nClouds;

  // Create the clouds
  for (let i = 0; i < this.nClouds; i++) {
    const c = new Cloud();

    // set the Rotation and the Position of each cloud
    const a = stepAngle * i; // final angle of cloud
    const h = 750 + Math.random() * 200; // distance between the center of the axis and the cloud itself

    // convert Polar coordinates(angle, distance) into Cartesian coordinates (x, y)
    c.mesh.position.y = Math.sin(a) * h;
    c.mesh.position.x = Math.cos(a) * h;

    // Rotate the cloud according to its position
    c.mesh.rotation.z = a + Math.PI / 2;

    // for a better result, we position the clouds
    // at random depths inside of the scene;
    c.mesh.position.z = -400 - Math.random() * 400;

    // set a random scale for each cloud
    const s = 1 + Math.random() * 2;
    c.mesh.scale.set(s, s, s);

    // Add the mesh in the scene
    this.mesh.add(c.mesh);
  }
}

function createSky() {
  sky = new Sky();
  sky.mesh.position.y = -600;
  scene.add(sky.mesh);
}

/**
 * Airplane
 */
function Airplane() {
  this.mesh = new THREE.Object3D();

  // create the cabin
  const geoCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
  const matCockpit = new THREE.MeshPhongMaterial({
    color: Colors.red,
    flatShading: true,
  });

  const cockpit = new THREE.Mesh(geoCockpit, matCockpit);

  cockpit.castShadow = true;
  cockpit.receiveShadow = true;
  this.mesh.add(cockpit);

  // create the engine
  const geoEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
  const matEngine = new THREE.MeshPhongMaterial({
    color: Colors.white,
    flatShading: true,
  });

  const engine = new THREE.Mesh(geoEngine, matEngine);

  engine.position.x = 40;
  engine.castShadow = true;
  engine.receiveShadow = true;
  this.mesh.add(engine);

  // create the tail
  const geoTail = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
  const matTail = new THREE.MeshPhongMaterial({
    color: Colors.red,
    flatShading: true,
  });

  const tailPlane = new THREE.Mesh(geoTail, matTail);

  tailPlane.position.set(-35, 25, 0);
  tailPlane.castShadow = true;
  tailPlane.receiveShadow = true;
  this.mesh.add(tailPlane);

  // create the wing
  const geoSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
  const matSideWing = new THREE.MeshPhongMaterial({
    color: Colors.red,
    flatShading: true,
  });
  const sideWing = new THREE.Mesh(geoSideWing, matSideWing);

  sideWing.castShadow = true;
  sideWing.receiveShadow = true;
  this.mesh.add(sideWing);

  // create propeller and blades
  const geoPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
  const matPropeller = new THREE.MeshPhongMaterial({
    color: Colors.brown,
    flatShading: true,
  });
  this.propeller = new THREE.Mesh(geoPropeller, matPropeller);

  this.propeller.castShadow = true;
  this.propeller.receiveShadow = true;

  const geoBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
  const matBlade = new THREE.MeshPhongMaterial({
    color: Colors.brownDark,
    flatShading: true,
  });
  const blade = new THREE.Mesh(geoBlade, matBlade);

  blade.position.set(8, 0, 0);
  blade.castShadow = true;
  blade.receiveShadow = true;

  this.propeller.add(blade);
  this.propeller.position.set(50, 0, 0);
  this.mesh.add(this.propeller);

  this.pilot = new Pilot();
  this.pilot.mesh.position.set(-10, 27, 0);
  this.mesh.add(this.pilot.mesh);
}

function createPlane() {
  airplane = new Airplane();
  airplane.mesh.scale.set(0.25, 0.25, 0.25);
  airplane.mesh.position.y = 100;

  scene.add(airplane.mesh);
}

/**
 * Pilot
 */
function Pilot() {
  this.mesh = new THREE.Object3D();
  this.mesh.name = "pilot";

  this.angleHairs = 0;

  // Face
  const bodyGeom = new THREE.BoxGeometry(15, 15, 15);
  const bodyMat = new THREE.MeshPhongMaterial({
    color: Colors.brown,
    flatShading: true,
  });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(2, -12, 0);
  this.mesh.add(body);

  const faceGeom = new THREE.BoxGeometry(10, 10, 10);
  const faceMat = new THREE.MeshLambertMaterial({ color: Colors.pink });
  const face = new THREE.Mesh(faceGeom, faceMat);
  this.mesh.add(face);

  // Hair Element
  const hairGeom = new THREE.BoxGeometry(4, 4, 4);
  const hairMat = new THREE.MeshLambertMaterial({ color: Colors.brown });
  const hair = new THREE.Mesh(hairGeom, hairMat);

  // Align the shape of the hair to its bottom boundary, that will make it easier to scale.
  hair.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 2, 0));

  // Create a container for hair
  const hairs = new THREE.Object3D();

  // Create a container for the hairs
  this.hairsTop = new THREE.Object3D();

  // Create the hairs at the top of the head
  // And Position them on a 3 x 4 grid
  for (let i = 0; i < 12; i++) {
    const h = hair.clone();
    const col = i % 3;
    const row = Math.floor(i / 3);
    const startPosZ = -4;
    const startPosX = -4;
    h.position.set(startPosX + row * 4, 0, startPosZ + col * 4);

    this.hairsTop.add(h);
  }

  hairs.add(this.hairsTop);

  // Create Hairs at the side of the face
  const hairSideGeom = new THREE.BoxGeometry(12, 4, 2);
  hairSideGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(-6, 0, 0));
  const hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
  const hairSideL = hairSideR.clone();
  hairSideR.position.set(8, -2, 6);
  hairSideL.position.set(8, -2, -6);
  hairs.add(hairSideR);
  hairs.add(hairSideL);

  // Create Hairs ar the back of the head
  const hairBackGeom = new THREE.BoxGeometry(2, 8, 10);
  const hairBack = new THREE.Mesh(hairBackGeom, hairMat);
  hairBack.position.set(-1, -4, 0);
  hairs.add(hairBack);
  hairs.position.set(-5, 5, 0);

  this.mesh.add(hairs);

  const glassGeom = new THREE.BoxGeometry(5, 5, 5);
  const glassMat = new THREE.MeshLambertMaterial({ color: Colors.brown });
  const glassR = new THREE.Mesh(glassGeom, glassMat);
  glassR.position.set(6, 0, 3);
  const glassL = glassR.clone();
  glassL.position.z = -glassR.position.z;

  const glassAGeom = new THREE.BoxGeometry(11, 1, 11);
  const glassA = new THREE.Mesh(glassAGeom, glassMat);
  this.mesh.add(glassR);
  this.mesh.add(glassL);
  this.mesh.add(glassA);

  const earGeom = new THREE.BoxGeometry(2, 3, 2);
  const earL = new THREE.Mesh(earGeom, faceMat);
  earL.position.set(0, 0, -6);
  const earR = earL.clone();
  earR.position.set(0, 0, 6);
  this.mesh.add(earL);
  this.mesh.add(earR);
}

Pilot.prototype.updateHairs = function () {
  const hairs = this.hairsTop.children;

  const l = hairs.length;

  for (let i = 0; i < l; i++) {
    const h = hairs[i];
    // each hair element will scale on cyclical basis between 75% and 100% of its original size
    h.scale.y = 0.75 + Math.cos(this.angleHairs + i / 3) * 0.25;
  }

  // increment the angle for the next frame
  this.angleHairs += 0.16;
};

/**
 * Rendering
 */
function loop() {
  const delta = clock.getDelta();
  const elapsedTime = clock.elapsedTime;

  // Rotate the propeller, sea, sky
  updatePlane(elapsedTime);
  sea.mesh.rotation.z = elapsedTime * 0.8;
  sky.mesh.rotation.z = elapsedTime * 1.1;

  sea.moveWaves();

  // Render scene
  renderer.render(scene, camera);

  // call the loop
  requestAnimationFrame(loop);
}

/**
 * Update Plane
 */
function normalize(v, vMin, vMax, tMin, tMax) {
  const nv = Math.max(Math.min(v, vMax), vMin);
  const dv = vMax - vMin;
  const pc = (nv - vMin) / dv;
  const dt = tMax - tMin;
  const tv = tMin + pc * dt;

  return tv;
}

function updatePlane(elapsedTime) {
  // let's move the airplane between -100 and 100 on the horizontal axis,
  // and between 25 and 175 on the vertical axis,
  // depending on the mouse position which ranges between -1 and 1 on both axes;
  // to achieve that we use a normalize function (see below)
  const targetX = normalize(mousePos.x, -1, 1, -100, 100);
  const targetY = normalize(mousePos.y, -1, 1, 25, 175);

  // update the airplane's position

  airplane.propeller.rotation.x = elapsedTime * 50;

  // airplane.mesh.position.y = targetY;
  // airplane.mesh.position.x = targetX;

  airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * 0.1;
  airplane.mesh.rotation.z = (targetY - airplane.mesh.position.y) * 0.0128;
  airplane.mesh.rotation.x = (airplane.mesh.position.y - targetY) * 0.0064;

  airplane.pilot.updateHairs();
}

/**
 * Event handler
 */
function handleMouseMove(event) {
  // here we are converting the mouse position value received
  // to a normalized value varying between -1 and 1;
  // this is the formula for the horizontal axis:
  const tx = -1 + (event.clientX / WIDTH) * 2;

  // for the vertical axis, we need to inverse the formula
  // because the 2D y-axis goes the opposite direction of the 3D y-axis

  const ty = 1 - (event.clientY / HEIGHT) * 2;

  mousePos = {
    x: tx,
    y: ty,
  };
}
