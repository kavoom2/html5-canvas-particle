import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

let canvas, camera, scene, renderer, clock;
const mixers = [];
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

function onWindowResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
}

function initApp() {
  // * Canvas
  canvas = document.querySelector("canvas");

  // * 카메라
  camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 1, 1000);
  camera.position.set(2, 3, -6);
  camera.lookAt(0, 1, 0);

  // * THREE JS Timer
  clock = new THREE.Clock();

  // * Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

  // * Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(-3, 10, -10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 4;
  dirLight.shadow.camera.bottom = -4;
  dirLight.shadow.camera.left = -4;
  dirLight.shadow.camera.right = 4;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  scene.add(dirLight);
  scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

  // * Ground Mesh
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // * Models
  const loader = new GLTFLoader();
  loader.load(
    "models/gltf/Soldier.glb",
    // on Success
    (gltf) => {
      gltf.scene.traverse((object) => {
        // console.log("Traverse Object", object);
        if (object.isMesh) object.castShadow = true;

        const model1 = SkeletonUtils.clone(gltf.scene);
        const model2 = SkeletonUtils.clone(gltf.scene);
        const model3 = SkeletonUtils.clone(gltf.scene);

        const mixer1 = new THREE.AnimationMixer(model1);
        const mixer2 = new THREE.AnimationMixer(model2);
        const mixer3 = new THREE.AnimationMixer(model3);

        mixer1.clipAction(gltf.animations[0]).play(); // idle
        mixer2.clipAction(gltf.animations[1]).play(); // run
        mixer3.clipAction(gltf.animations[3]).play(); // walk

        model1.position.x = -2;
        model2.position.x = 0;
        model3.position.x = 2;

        scene.add(model1, model2, model3);
        mixers.push(mixer1, mixer2, mixer3);

        // animate();
      });
    }
    // onProgress
    // (event) => console.log("Progress Event", event),
    // onError
    // (error) => console.error(error)
  );

  // * Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sizes.width, sizes.height);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;

  // * Event Listener
  window.addEventListener("resize", onWindowResize);
}

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();

  for (const mixer of mixers) mixer.update(dt);

  renderer.render(scene, camera);
}

initApp();
animate();
