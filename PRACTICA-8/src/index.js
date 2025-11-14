import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer, camera;
let mapsx, mapsy;
let terremotos = [];
let plane;
let circleContainer;
let wavesContainer;
let pointsContainer;
let currentDate;
let fecha2show;
let legend;
let audit;
let tooltip;
let camcontrols;
const DURACION_TOTAL = 5000;
let initialYear = 1965;
let lastYear = 2016;
let animationInterval;

const opciones = {
  year: "numeric",
  month: "long",
};

const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.1;
const mouse = new THREE.Vector2();

init();
animate();

function initDateDisplay() {
  fecha2show = document.createElement("div");
  fecha2show.style.position = "absolute";
  fecha2show.style.top = "50px";
  fecha2show.style.width = "100%";
  fecha2show.style.textAlign = "center";
  fecha2show.style.color = "#fff";
  fecha2show.style.fontWeight = "bold";
  fecha2show.style.backgroundColor = "transparent";
  fecha2show.style.zIndex = "1";
  fecha2show.style.fontFamily = "Monospace";
  fecha2show.innerHTML = "";
  document.body.appendChild(fecha2show);
}

function initToolTip() {
  tooltip = document.createElement("div");
  tooltip.style.position = "absolute";
  tooltip.style.backgroundColor = "rgba(0,0,0,0.7)";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "5px 10px";
  tooltip.style.borderRadius = "4px";
  tooltip.style.pointerEvents = "none";
  tooltip.style.display = "none";
  tooltip.style.fontFamily = "Monospace";
  tooltip.style.fontSize = "13px";
  document.body.appendChild(tooltip);
}

function initAuditDisplay() {
  audit = document.createElement("div");
  audit.style.position = "absolute";
  audit.style.bottom = "10px";
  audit.style.left = "10px";
  audit.style.color = "#fff";
  audit.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  audit.style.padding = "5px 10px";
  audit.style.borderRadius = "4px";
  audit.style.zIndex = "100";
  audit.style.fontFamily = "Monospace";
  audit.style.fontSize = "14px";
  audit.innerHTML =
    "<b>Tycho Quintana Santana - Práctica S8 Visualización de datos: Terremotos a lo largo de los años.</b>";
  document.body.appendChild(audit);
}

function initLegend() {
  legend = document.createElement("div");
  legend.style.position = "absolute";
  legend.style.top = "35px";
  legend.style.right = "10px";
  legend.style.color = "#fff";
  legend.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  legend.style.padding = "5px 10px";
  legend.style.borderRadius = "4px";
  legend.style.zIndex = "100";
  legend.style.fontFamily = "Monospace";
  legend.style.fontSize = "14px";
  legend.innerHTML = `
      <b>Leyenda de Magnitud Sísmica</b>
      <ul>
          <li><b>Color del Círculo (Magnitud):</b> La intensidad sísmica se representa con un gradiente de color: <span style="color: yellow;">amarillo</span> (menor magnitud) a <span style="color: red;">rojo</span> (mayor magnitud).</li>
          <li><b>Ondas:</b> El tamaño de expansión es directamente proporcional a la magnitud del terremoto.</li>
      </ul>
      <b>Pasa el cursor por encima del terremoto para obtener más información.</b>
      `;
  document.body.appendChild(legend);
}

function init() {
  initAuditDisplay();
  initLegend();
  initDateDisplay();
  initToolTip();
  const button = document.querySelector("button");
  button.addEventListener("click", changeInterval);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 14;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  camcontrols = new OrbitControls(camera, renderer.domElement);
  camcontrols.enableRotate = false;

  const light = new THREE.AmbientLight();
  scene.add(light);

  const tx1 = new THREE.TextureLoader().load("src/earthmap1k.jpg");

  mapsx = (21.6 / 2.5) * 4;
  mapsy = (10.8 / 2.5) * 4;

  const material = new THREE.MeshBasicMaterial({
    map: tx1,
    transparent: true,
  });

  plane = new THREE.Mesh(new THREE.PlaneGeometry(mapsx, mapsy), material);
  scene.add(plane);

  circleContainer = new THREE.Group();
  circleContainer.position.z = 0.01;
  scene.add(circleContainer);

  wavesContainer = new THREE.Group();
  wavesContainer.position.z = 0.01;
  scene.add(wavesContainer);

  pointsContainer = new THREE.Group();
  pointsContainer.position.z = 0.02;
  scene.add(pointsContainer);

  fetch("src/earthquakes.csv")
    .then((r) => r.text())
    .then((csv) => procesarCSV(csv))
    .then(() => iniciarAnimacion())
    .then(() => window.addEventListener("mousemove", onMouseMove))
    .catch((err) => console.error("Error CSV:", err));
}

function procesarCSV(csv) {
  const filas = csv.split("\n").slice(1);
  terremotos = filas
    .map((linea) => {
      const c = linea.split(",");
      if (c.length < 9) return null;
      const fecha = c[0].trim();
      const hora = c[1].trim();
      const lat = parseFloat(c[2]);
      const lon = parseFloat(c[3]);
      const dep = parseFloat(c[5]);
      const mag = parseFloat(c[8]);
      if (isNaN(lat) || isNaN(lon) || isNaN(mag)) return null;

      const [mm, dd, yy] = fecha.split("/");
      const [hh, min, ss] = hora.split(":");
      const d = new Date(parseInt(yy), mm - 1, dd, hh, min, ss);
      return { fecha: d, lat, lon, mag, depth: dep };
    })
    .filter((d) => d !== null)
    .sort((a, b) => a.fecha - b.fecha);

  currentDate = new Date(terremotos[0].fecha);
  currentDate.setDate(1);
  currentDate.setHours(0, 0, 0, 0);
}

function dibujarTerremoto(lat, lon, mag, depth, fecha) {
  const x = ((lon + 180) / 360 - 0.5) * mapsx;
  const y = ((90 - lat) / 180 - 0.5) * mapsy;

  const intensidad = Math.min(1, mag / 8.5);
  const color = new THREE.Color(0 + intensidad, 1 - intensidad, 0);

  // CREAMOS EL CIRCULO
  const geometry = new THREE.CircleGeometry(mag / 100, 32);
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    sizeAttenuation: false,
    depthWrite: false,
  });

  const circle = new THREE.Mesh(geometry, material);
  circle.position.set(x, y, 0);
  circleContainer.add(circle);

  // CREAMOS EL PUNTO CON LA INFORMACIÓN
  const pointMaterial = new THREE.PointsMaterial({
    color: new THREE.Color(0x000000), // Only for debugging purposes
    size: Math.max(mag / 50),
    transparent: true,
    opacity: 0,
    sizeAttenuation: true,
  });
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([x, y, 0], 3)
  );
  const point = new THREE.Points(pointGeometry, pointMaterial);
  point.userData = {
    lat,
    lon,
    mag,
    depth,
    fecha,
  };
  pointsContainer.add(point);
  crearOndas(x, y, mag, color);
}

function crearOndas(x, y, mag, color) {
  const numOndas = 3;

  for (let i = 0; i < numOndas; i++) {
    setTimeout(() => {
      const onda = {
        radio: 0.05,
        maxRadio: 0.5 + mag / 15,
        opacity: 0.6,
        mesh: null,
      };

      const geometry = new THREE.RingGeometry(0.05, 0.08, 32);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: onda.opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      onda.mesh = new THREE.Mesh(geometry, material);
      onda.mesh.position.set(x, y, 0.01);
      wavesContainer.add(onda.mesh);

      animarOnda(onda);
    }, (i * DURACION_TOTAL) / 3);
  }
}

function animarOnda(onda) {
  const startTime = Date.now();

  const animate = () => {
    if (!onda.mesh.parent) return;
    const elapsed = Date.now() - startTime;
    const progress = elapsed / DURACION_TOTAL;

    if (progress >= 1) {
      onda.mesh.geometry.dispose();
      onda.mesh.material.dispose();
      wavesContainer.remove(onda.mesh);
      return;
    }

    onda.radio = Math.min(
      0.05 + (onda.maxRadio - 0.2) * progress,
      onda.maxRadio
    );
    onda.opacity = 0.6 * (1 - progress);

    onda.mesh.geometry.dispose();
    const grosor = 0.03 + onda.radio * 0.05;
    onda.mesh.geometry = new THREE.RingGeometry(
      onda.radio - grosor,
      onda.radio + grosor,
      32
    );
    onda.mesh.material.opacity = onda.opacity;

    requestAnimationFrame(animate);
  };

  animate();
}

function borrarPuntos() {
  while (pointsContainer.children.length > 0) {
    const child = pointsContainer.children[0];
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
    pointsContainer.remove(child);
  }
}

function borrarCirculos() {
  while (circleContainer.children.length > 0) {
    const child = circleContainer.children[0];
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
    circleContainer.remove(child);
  }
}

function borrarOndas() {
  while (wavesContainer.children.length > 0) {
    const child = wavesContainer.children[0];
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
    wavesContainer.remove(child);
  }
}

function borrarTerremotos() {
  borrarPuntos();
  borrarCirculos();
  borrarOndas();
}

function iniciarAnimacion() {
  if (animationInterval) {
    clearInterval(animationInterval);
  }

  animationInterval = setInterval(() => {
    borrarTerremotos();
    if (currentDate.getFullYear() > lastYear) {
      currentDate = new Date(initialYear, 0, 1);
    }
    displayDate(currentDate);
    const terremotosIteracion = terremotos.filter(
      (t) =>
        t.fecha.getFullYear() === currentDate.getFullYear() &&
        t.fecha.getMonth() === currentDate.getMonth()
    );
    terremotosIteracion.forEach((t) =>
      dibujarTerremoto(t.lat, t.lon, t.mag, t.depth, t.fecha)
    );

    currentDate.setMonth(currentDate.getMonth() + 1);
  }, DURACION_TOTAL);
}

function displayDate(currentDate) {
  fecha2show.innerHTML = currentDate.toLocaleString("es-ES", opciones);
}

function onMouseMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const clientXRelativeToCanvas = event.clientX - rect.left;
  const clientYRelativeToCanvas = event.clientY - rect.top;
  mouse.x = (clientXRelativeToCanvas / rect.width) * 2 - 1;
  mouse.y = -(clientYRelativeToCanvas / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(pointsContainer.children);
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    const data = clickedObject.userData;
    if (data.fecha) {
      tooltip.style.display = "block";
      tooltip.style.left = event.clientX + 10 + "px";
      tooltip.style.top = event.clientY + 10 + "px";
      tooltip.innerHTML = `
        <b>Fecha:</b> ${data.fecha.toLocaleString("es-ES")}<br>
        <b>Lat:</b> ${data.lat.toFixed(3)}, <b>Lon:</b> ${data.lon.toFixed(
        3
      )}<br>
        <b>Magnitud:</b> ${data.mag}<br>
        <b>Profundidad:</b> ${data.depth} km
      `;
    }
  } else {
    tooltip.style.display = "none";
  }
}

function changeInterval() {
  const inputInf = document.querySelector('input[name="inf"]');
  const inputSup = document.querySelector('input[name="sup"]');

  const valorInferior = inputInf.value.trim();
  const valorSuperior = inputSup.value.trim();

  if (!valorInferior || !valorSuperior) {
    alert("Inserte números");
    return;
  }

  const from = Number(valorInferior);
  const to = Number(valorSuperior);

  if (isNaN(from) || isNaN(to)) {
    alert("Inserte números válidos");
    return;
  }

  if (to < from) {
    alert("Inserte un rango válido");
    return;
  }

  initialYear = from;
  lastYear = to;
  currentDate = new Date(initialYear, 0, 1);
  iniciarAnimacion();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
