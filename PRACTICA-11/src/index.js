import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

const CUBES_INITIAL_CONFIG = [
  { color: 0xff0000, name: "red", x: -5, y: 7, z: -11 },
  { color: 0x00ff00, name: "green", x: 2, y: -2, z: -10 },
  { color: 0x0000ff, name: "blue", x: 3, y: 9, z: -9 },
  { color: 0xffff00, name: "yellow", x: -2, y: -1, z: -10 },
];

const EASING = TWEEN.Easing.Quadratic.InOut;

const cubes = {};
const RED_CUBE_ANIMATION_PARAMETERS = {
  color: "red",
  startPos: new THREE.Vector3(-5, 7, -11),
  endPos: new THREE.Vector3(-0.3, 2.15, 1),
  midPoints: [
    new THREE.Vector3(-1.25, 7.0, -4.0),
    new THREE.Vector3(3, -5, -5),
    new THREE.Vector3(5, -2.5, -5),
    new THREE.Vector3(3, 2, -3),
    new THREE.Vector3(1, 5, -3),
    new THREE.Vector3(-1, 2.5, -1),
  ],
  duration: 7000,
  easing: EASING,
};

const GREEN_CUBE_ANIMATION_PARAMETERS = {
  color: "green",
  startPos: new THREE.Vector3(2, -2, -10),
  endPos: new THREE.Vector3(0.3, 2, 1),
  midPoints: [
    new THREE.Vector3(1, 6, -8),
    new THREE.Vector3(-4, 2, -5),
    new THREE.Vector3(0, -1, -1),
    new THREE.Vector3(1.5, 3, 0),
  ],
  duration: 7000,
  easing: EASING,
};

const BLUE_CUBE_ANIMATION_PARAMETERS = {
  color: "blue",
  startPos: new THREE.Vector3(3, 9, -9),
  endPos: new THREE.Vector3(-0.45, 1.5, 1),
  midPoints: [
    new THREE.Vector3(7, 8, -8),
    new THREE.Vector3(9, 4, -7),
    new THREE.Vector3(7, -4, -5),
    new THREE.Vector3(4, -4, -5),
    new THREE.Vector3(2, -2, -3.5),
    new THREE.Vector3(-1, 1, -2),
  ],

  duration: 7000,
  easing: EASING,
};

const YELLOW_CUBE_ANIMATION_PARAMETERS = {
  color: "yellow",
  startPos: new THREE.Vector3(-2, -1, -10),
  endPos: new THREE.Vector3(0.15, 1.35, 1),
  midPoints: [
    new THREE.Vector3(-2, 1, -10),
    new THREE.Vector3(-4, 2, -7),
    new THREE.Vector3(-1, 6, -4),
    new THREE.Vector3(1.5, 3, -2),
  ],

  duration: 7000,
  easing: EASING,
};

const ANIMATION_PARAMETERS = [
  RED_CUBE_ANIMATION_PARAMETERS,
  GREEN_CUBE_ANIMATION_PARAMETERS,
  BLUE_CUBE_ANIMATION_PARAMETERS,
  YELLOW_CUBE_ANIMATION_PARAMETERS,
];

let scene, camera, renderer;

function setIlumination() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  setIlumination();
  createAuditOverlay();
}

function crearCubo(color, x, y, z, name) {
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0,
  });
  const cubo = new THREE.Mesh(geometry, material);
  const pointLight = new THREE.PointLight(color, 0);
  cubo.add(pointLight);
  cubo.position.set(x, y, z);
  cubes[name] = cubo;
  scene.add(cubo);
}

function createAllCubes() {
  CUBES_INITIAL_CONFIG.forEach((cube) => {
    crearCubo(cube.color, cube.x, cube.y, cube.z, cube.name);
  });
}

function setCubesAnimation() {
  ANIMATION_PARAMETERS.forEach((animationParameters) =>
    setCubeAnimationWith(animationParameters)
  );
}

function setCubeAnimationWith(cubeAnimationParameters) {
  const duration = cubeAnimationParameters.duration;
  const cuboActual = cubes[cubeAnimationParameters.color];
  const startPos = cubeAnimationParameters.startPos;
  const endPos = cubeAnimationParameters.endPos;
  const midPoints = cubeAnimationParameters.midPoints;
  let pathCurve = createPathCurveWith(startPos, endPos, ...midPoints);
  const rt1 = new TWEEN.Tween({ progress: 0, rotationZ: cuboActual.rotation.z })
    .to(
      {
        progress: 1,
        rotationZ: cuboActual.rotation.z + 2 * Math.PI - Math.PI / 15,
      },
      duration
    )
    .easing(cubeAnimationParameters.easing)
    .onUpdate((params) => {
      const point = pathCurve.getPoint(params.progress);
      cuboActual.position.copy(point);
      cuboActual.rotation.z = params.rotationZ;
    });

  const pointLight = cuboActual.children[0];
  const glowProps = {
    emissiveValue: 0,
    lightValue: 0,
  };

  const rt_glow = new TWEEN.Tween(glowProps)
    .to(
      {
        emissiveValue: 100,
        lightValue: 50,
      },
      3000
    )
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      cuboActual.material.emissiveIntensity = glowProps.emissiveValue;
      pointLight.intensity = glowProps.lightValue;
    });

  rt1.chain(rt_glow);
  rt1.start();
}

function createPathCurveWith(startPos, endPos, ...midPoints) {
  const points = [startPos.clone()];
  points.push(...midPoints);
  points.push(endPos.clone());
  return new THREE.CatmullRomCurve3(points);
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  renderer.render(scene, camera);
}

function createAuditOverlay() {
  const textDiv = document.createElement("div");
  textDiv.style.position = "absolute";
  textDiv.style.top = "20px";
  textDiv.style.left = "20px";
  textDiv.style.color = "white";
  textDiv.style.fontSize = "24px";
  textDiv.style.fontFamily = "Arial, sans-serif";
  textDiv.style.pointerEvents = "none";
  textDiv.innerHTML = "P11 IG Tycho Quintana Santana";
  document.body.appendChild(textDiv);
}

function createWindowsText(id, text, bottom) {
  let textDiv = document.createElement("div");
  textDiv.id = id;
  textDiv.style.position = "absolute";
  textDiv.style.bottom = bottom;
  textDiv.style.width = "100%";
  textDiv.style.textAlign = "center";
  textDiv.style.color = "#e0e0e0";
  textDiv.style.fontSize = "48px";
  textDiv.style.fontFamily = "Segoe UI";
  textDiv.style.fontWeight = "300";
  textDiv.style.letterSpacing = "2px";
  textDiv.style.pointerEvents = "none";
  textDiv.style.opacity = "0";
  textDiv.innerHTML = text;
  document.body.appendChild(textDiv);
}

function showWindowsText() {
  const startingTextElement = document.getElementById("windows-text");
  const copyrightTextElement = document.getElementById("copyright-text");
  const texts = [startingTextElement, copyrightTextElement];
  texts.forEach((text) => {
    const textProps = { opacity: 0 };
    const fadeIn = new TWEEN.Tween(textProps)
      .to({ opacity: 1 }, 10000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        text.style.opacity = textProps.opacity;
      });
    fadeIn.start();
  });
}

init();
createAllCubes();
setCubesAnimation();
createWindowsText("copyright-text", "© Microsoft Corporation", "10%");
createWindowsText("windows-text", "Starting Windows", "35%");
showWindowsText();
animate();
