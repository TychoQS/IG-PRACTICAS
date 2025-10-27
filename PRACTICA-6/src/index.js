import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Global variables
let scene, renderer, generalCamera, shipCamera;
let currentCamera;
let camControls;
let flyControls;
let sun;
let planets = [];
let lunas = [];
let zplane;
let t0 = Date.now();
let fct0 = Date.now();
let accglobal = 0.001;
let timestamp = (Date.now() - t0) * accglobal;
let texture1;
let texture2;
let texture3;
let texture4;
let texture5;
let sunTexture;
let moonTexture;
let moonbump;
let grid;
let shadow = true;
let shipModel;

const raycaster = new THREE.Raycaster();
const click = new THREE.Vector2();
const nocolor = 0xffffff;

const zplaneSettings = {
  geometry: new THREE.PlaneGeometry(100, 100),
  material: new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  }),
};

const cameraSettings = {
  fov: 75,
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 1000,
  x: 0,
  y: 0,
  z: 10,
};

const shipCameraSettings = {
  fov: 75,
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 500,
  x: 0,
  y: -15,
  z: 5,
};

const renderSettings = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const sunSettings = {
  radius: 1.8,
  color: 0xffff00,
};

init();
animationLoop();

function init() {
  initTextures();
  initScene();
  initEventListeners();
  Estrella(sunSettings.radius, sunSettings.color, sunTexture);
  initPlanetas();
  initNave();
}

function initNave() {
  const loader = new GLTFLoader();
  loader.load(
    "src/pixel_space_ship.glb", // "Pixel Space Ship" (https://skfb.ly/o6qU6) by Bucky is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/). No changes
    (gltf) => {
      shipModel = gltf.scene;
      shipModel.scale.set(0.002, 0.002, 0.002);
      shipCamera.add(shipModel);
      shipModel.position.set(0, -0.5, -2);
    },
    undefined,
    (error) => console.error("Error cargando modelo:", error)
  );
}

function initPlanetas() {
  Planeta(4, 2, 0.4, 0.8, 0.008, nocolor, 9, 3, texture3);

  Planeta(0, 6, 0.5, 0.6, -0.003, nocolor, 2, 2, texture2);
  Luna(planets[1], 0.15, 1.2, 2, 0.01, nocolor, 0, moonTexture);

  Planeta(-5, 3, 0.35, 1.2, 0.003, nocolor, 2, 5, texture5);

  Planeta(7, -2, 0.6, 0.5, 0.001, nocolor, 3, 3, texture4);
  Luna(
    planets[3],
    0.2,
    1.5,
    1.5,
    0.05,
    nocolor,
    Math.PI / 4,
    undefined,
    moonbump
  );

  Planeta(-4, -6, 0.45, 0.1, 0.01, nocolor, 5, 1, texture1);
  Luna(
    planets[4],
    0.18,
    1.3,
    1.8,
    -0.02,
    nocolor,
    Math.PI / 6,
    moonTexture,
    moonbump
  );
}

function animationLoop() {
  timestamp = (Date.now() - t0) * accglobal;
  requestAnimationFrame(animationLoop);
  /**/
  for (let object of planets) {
    // Animating planets
    const angle =
      timestamp * object.userData.speed + object.userData.angleOffset;
    object.position.x =
      Math.cos(angle) * object.userData.f1 * object.userData.scaleFactor;
    object.position.y =
      Math.sin(angle) * object.userData.f2 * object.userData.scaleFactor;
    object.rotation.z += object.userData.rotSpeed;
  }

  for (let object of lunas) {
    object.position.x =
      Math.cos(timestamp * object.userData.speed) * object.userData.dist;
    object.position.y =
      Math.sin(timestamp * object.userData.speed) * object.userData.dist;
    object.rotation.z += object.userData.rotSpeed;
  }

  if (currentCamera == shipCamera) {
    let fct1 = new Date();
    let secs = (fct1 - fct0) / 1000;
    flyControls.update(1 * secs);
    fct0 = fct1;
  }
  renderer.render(scene, currentCamera);
}

function initScene() {
  scene = new THREE.Scene();

  shipCamera = new THREE.PerspectiveCamera(
    shipCameraSettings.fov,
    shipCameraSettings.aspect,
    shipCameraSettings.near,
    shipCameraSettings.far
  );

  shipCamera.position.set(
    shipCameraSettings.x,
    shipCameraSettings.y,
    shipCameraSettings.z
  );

  shipCamera.lookAt(0, 0, 0);
  scene.add(shipCamera);

  generalCamera = new THREE.PerspectiveCamera(
    cameraSettings.fov,
    cameraSettings.aspect,
    cameraSettings.near,
    cameraSettings.far
  );
  generalCamera.position.set(
    cameraSettings.x,
    cameraSettings.y,
    cameraSettings.z
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(renderSettings.width, renderSettings.height);
  renderer.shadowMap.enabled = true; // Enabling shadows
  document.body.append(renderer.domElement);

  camControls = new OrbitControls(generalCamera, renderer.domElement);
  flyControls = new FlyControls(shipCamera, renderer.domElement);
  flyControls.dragToLook = true;
  flyControls.movementSpeed = 1;
  flyControls.rollSpeed = 0.5;
  flyControls.enabled = false;

  currentCamera = generalCamera;
  initLights();

  zplane = new THREE.Mesh(zplaneSettings.geometry, zplaneSettings.material);
  zplane.visible = false;
  scene.add(zplane);
  /*
  grid = new THREE.GridHelper(20, 40);
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.05);
  scene.add(grid);
  */
}

function initLights() {
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 3, 100); // Luz del sol
  pointLight.position.set(0, 0, 0);
  pointLight.castShadow = true; // Activando que la luz del sol pueda generar sombras
  pointLight.shadow.mapSize.width = 4096; // Propiedades obtenidas de: https://threejs.org/docs/#api/en/lights/shadows/PointLightShadow como dice aqui, cuanto mayores son, mejores las sombras https://threejs.org/docs/index.html#api/en/lights/shadows/LightShadow
  pointLight.shadow.mapSize.height = 4096;
  scene.add(pointLight);
}

function initTextures() {
  texture1 = new THREE.TextureLoader().load("src/pluto.jpg");
  texture2 = new THREE.TextureLoader().load("src/jupiter.jpg");
  texture3 = new THREE.TextureLoader().load("src/neptune.jpg");
  texture4 = new THREE.TextureLoader().load("src/mars.jpg");
  texture5 = new THREE.TextureLoader().load("src/venus.jpg");
  sunTexture = new THREE.TextureLoader().load("src/sun.jpg");
  moonbump = new THREE.TextureLoader().load("src/moonbump.jpg");
  moonTexture = new THREE.TextureLoader().load("src/moonmap4k.jpg");
}

function initEventListeners() {
  document.addEventListener("mousedown", onDocumentMouseDown); // Gestión de evento de clic de ratón
  document.addEventListener("keydown", (e) => {
    // Gestión de evento para pulsaciones en teclado
    if (e.key === "G" || e.key === "g") generalView();
    if (e.key === "N" || e.key === "n") shipView();
  });
}

function Estrella(rad, col, texture = undefined) {
  let geometry = new THREE.SphereGeometry(rad, 32, 32);
  let material = new THREE.MeshBasicMaterial({ color: col, wireframe: false });
  if (texture) {
    material.map = texture;
  }
  sun = new THREE.Mesh(geometry, material);
  scene.add(sun);
}

function Planeta(
  x,
  y,
  radioPlaneta,
  vel,
  rotVel,
  col,
  f1,
  f2,
  texture = undefined
) {
  const scaleFactor = Math.sqrt(Math.pow(x / f1, 2) + Math.pow(y / f2, 2)); // Distancia para la elipse, que no tiene ambos ejes del mismo tamaño
  let geom = new THREE.SphereGeometry(radioPlaneta, 10, 10);
  let mat = new THREE.MeshPhongMaterial({ color: col });
  if (texture != undefined) {
    mat.map = texture;
  }
  let planeta = new THREE.Mesh(geom, mat);
  planeta.userData.angleOffset =
    Math.atan2(y / (scaleFactor * f2), x / (scaleFactor * f1)) -
    timestamp * vel; // timestampt varia constantemente aun cuando no hemos añadido ningún planeta, por eso debemos de hacer la resta. Además dividimos entre los radios de los semiejes, ya que es una trayectoria de elipse no de circunferencia
  planeta.userData.scaleFactor = scaleFactor;
  planeta.userData.speed = vel;
  planeta.userData.rotSpeed = rotVel;
  planeta.userData.f1 = f1;
  planeta.userData.f2 = f2;
  planeta.position.set(x, y, 0);
  if (shadow) planeta.castShadow = true;
  planeta.receiveShadow = true;
  planets.push(planeta);
  scene.add(planeta);

  let curve = new THREE.EllipseCurve(
    0,
    0, // centro
    scaleFactor * f1,
    scaleFactor * f2 // radios elipse
  );

  let points = curve.getPoints(50);
  let geome = new THREE.BufferGeometry().setFromPoints(points);
  let mate = new THREE.LineBasicMaterial({ color: 0xffffff });

  let orbita = new THREE.Line(geome, mate);
  scene.add(orbita);
}

function Luna(
  padre,
  radio,
  dist,
  vel,
  rotVel,
  col,
  angle,
  texture = undefined,
  textbump = undefined
) {
  var pivote = new THREE.Object3D();
  pivote.rotation.x = angle;
  padre.add(pivote);
  var geom = new THREE.SphereGeometry(radio, 10, 10);
  var mat = new THREE.MeshPhongMaterial({
    color: col,
  });
  if (texture != undefined) {
    mat.map = texture;
  }
  if (textbump != undefined) {
    mat.bumpMap = textbump;
    mat.bumpScale = 0.01;
  }
  var luna = new THREE.Mesh(geom, mat);
  luna.userData.dist = dist;
  luna.userData.speed = vel;
  luna.userData.rotSpeed = rotVel;
  const initialAngle = timestamp * vel;
  luna.position.set(Math.cos(160) * dist, Math.sin(160) * dist, 0);
  luna.receiveShadow = true;
  luna.castShadow = true;
  lunas.push(luna);
  pivote.add(luna);
}

function onDocumentMouseDown(event) {
  event.preventDefault();
  if (event.which != 2 || currentCamera == shipCamera) return;
  const rect = renderer.domElement.getBoundingClientRect();
  click.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  click.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(click, generalCamera);

  const intersects = raycaster.intersectObject(zplane);
  if (intersects.length > 0) {
    // Intersection Coordinates
    const intersectionPoints = intersects[0].point;

    // Distance from sun to clicked point
    const f1 = Math.random() * 1.5 + 0.5;
    const f2 = Math.random() * 1.5 + 0.5;
    Planeta(
      intersectionPoints.x,
      intersectionPoints.y,
      0.5,
      Math.random() * 3,
      Math.random(),
      randomHexColor(),
      f1,
      f2
    );
  }
}

function randomHexColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function generalView() {
  currentCamera = generalCamera;
  camControls.enabled = true;
  flyControls.enabled = false;
}

function shipView() {
  currentCamera = shipCamera;
  camControls.enabled = false;
  flyControls.enabled = true;
  fct0 = new Date();
}
