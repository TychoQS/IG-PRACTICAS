# Visualización de Terremotos con Three.js

## Link al proyecto
[Enlace CodeSandbox](https://codesandbox.io/p/sandbox/entrega-p8-ig-tycho-quintana-santana-cs73dq)

## Descripción de entrega
El trabajo consiste en la creación de una visualización interactiva de datos sísmicos históricos utilizando la biblioteca _Three.js_. El proyecto muestra terremotos ocurridos entre 1965 y 2016 sobre un mapa de la Tierra, representando la magnitud mediante colores y ondas expansivas, con tooltips informativos al pasar el cursor sobre cada evento.

El proyecto se debe ejecutar mediante el enlace al proyecto en CodeSandbox del apartado anterior. El código está disponible en el repositorio. Para ejecutarlo en local puede ser necesario realizar algún cambio ya que el formato con el que trabaja CodeSandBox no es compatible con todos los entornos de desarrollo.

## Trabajo realizado

### Descripción del trabajo realizado
Se implementa una visualización interactiva que muestra terremotos históricos mes a mes sobre un mapa plano de la Tierra. Cada terremoto se representa mediante un círculo coloreado según su magnitud y ondas expansivas. El usuario puede interactuar con los datos mediante tooltips que muestran información detallada al pasar el cursor, y puede modificar el rango temporal de visualización mediante controles de entrada en la parte superior.

Como posible mejora sería interesante añadir una línea temporal interactiva para poder pausar la animación y saltar a fechas específicas, así como permitir filtrar por magnitud o profundidad.

### Desarrollo principal

El código principal se estructura en dos funciones principales: `init()` que inicializa todos los elementos necesarios para la visualización, y `animate()` que maneja el bucle de renderizado principal.

La función `init()` comienza llamando a varias funciones de inicialización de elementos del DOM de _index.html_:

**initAuditDisplay()**: Crea un elemento en la esquina inferior izquierda que muestra la autoría del proyecto. Tiene posisición absoluta, por lo que siempre se verá en el mismo sitio independientemente de como navegue el usuario por la escena.

```javascript
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
```

**initLegend()**: Genera la leyenda explicativa en la esquina superior derecha que describe el esquema de colores y la representación de magnitud mediante ondas.

```javascript
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
```

**initDateDisplay()**: Crea el indicador de la fecha actual que se está representando, que se encuentra centrada en la parte superior de la pantalla.

```javascript
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
```

**initToolTip()**: Inicializa el tooltip que aparece al pasar el cursor sobre los terremotos, mostrando información detallada del evento. Se inicializa vacío ya que el contenido cambiará en función del terremoto del que se quiera obtener la información.

```javascript
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
```  

Tras añadir estos componentes al DOM, y agregar un _listener_ al botón de la página se configura la escena _Three.js_:

```javascript
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
```

Se crea la cámara perspectiva, el renderizador y los controles `OrbitControls` (con la rotación deshabilitada para mantener el mapa en orientación fija). Se añade iluminación ambiental y se carga la textura del mapa terrestre:

```javascript
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
```

Se crean tres contenedores separados para organizar los elementos visuales en diferentes capas Z:

```javascript
circleContainer = new THREE.Group();
circleContainer.position.z = 0.01;
scene.add(circleContainer);

wavesContainer = new THREE.Group();
wavesContainer.position.z = 0.01;
scene.add(wavesContainer);

pointsContainer = new THREE.Group();
pointsContainer.position.z = 0.02;
scene.add(pointsContainer);
```

Finalmente se carga y procesa el archivo CSV de terremotos:

```javascript
fetch("src/earthquakes.csv")
  .then((r) => r.text())
  .then((csv) => procesarCSV(csv))
  .then(() => iniciarAnimacion())
  .then(() => window.addEventListener("mousemove", onMouseMove))
  .catch((err) => console.error("Error CSV:", err));
```

La función `procesarCSV()` lee el archivo CSV línea por línea, extrayendo la información de fecha, hora, latitud, longitud, profundidad y magnitud de cada terremoto. Filtra datos inválidos y ordena los eventos cronológicamente:

```javascript
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
```

Tras leerse el fichero CSV se invoca la función `iniciarAnimacion()`.

La función `iniciarAnimacion()` gestiona el bucle temporal de la visualización. A intervalos dictados por el contenido de la constante `DURACION_TOTAL`, limpia la visualización de los terremotos del mes anterior (eliminando los elementos de todos los contenedores usando la función `borrarTerremotos()`) y dibuja los del mes actual, actualizando también el componente que muestra el mes y año. Cuando llega a superar el mes indicado por `lastYear` vuelve a ' initialYear' repitiendo la animación para ese intervalo.

Para ello se hace uso de la función `setInterval()` que se ejecuta cada vez que pasa el intervalo que se le pasa como segundo parámetro:

```javascript
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
```

La función `dibujarTerremoto()` es responsable de crear la representación visual de cada evento sísmico. Calcula la posición en el mapa mediante proyección de coordenadas geográficas, crea un círculo coloreado según la magnitud, un punto invisible para un _raycasting_ más preciso y llama a la función de creación de ondas:

```javascript
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
    color: new THREE.Color(0x000000),
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
```

El gradiente de color va desde amarillo (magnitud baja) hasta rojo (magnitud alta), proporcionando una representación visual intuitiva de la intensidad sísmica.

La función `crearOndas()` genera tres ondas expansivas con intervalos escalonados que intentan simular la propagación de las ondas sísmicas visualmente. Cada onda es un anillo que se expande y desvanece:

```javascript
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
```

El intervalo de generación de ondas está diseñado para que sigan apareciendo durante todo el periodo en el que se reproducen los terremotos de un mes concreto. De este modo, la animación nunca queda “muerta” mostrando únicamente los puntos en el mapa, sino que mantiene actividad visual constante.

La función `animarOnda()` que se aplica a cada onda desde la función anterior, maneja la animación de cada onda individual (con su propio bucle de animación), expandiendo su radio y reduciendo su opacidad progresivamente. Una vez completada la animación, libera los recursos:

```javascript
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
```

Para mantener el rendimiento óptimo, se implementan funciones de limpieza que eliminan y liberan recursos cuando se cambia de mes. Estas son invocadas desde la función `borrarTerremotos()`:

```javascript
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
```

## Otros añadidos y funciones auxiliares

La función `onMouseMove()` implementa la interactividad mediante _raycasting_. Detecta cuando el cursor está sobre un terremoto y muestra un tooltip con información detallada que se genera en ese momento con la información que fue almacenada en el punto cuando se creó:

```javascript
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
        <b>Lat:</b> ${data.lat.toFixed(3)}, <b>Lon:</b> ${data.lon.toFixed(3)}<br>
        <b>Magnitud:</b> ${data.mag}<br>
        <b>Profundidad:</b> ${data.depth} km
      `;
    }
  } else {
    tooltip.style.display = "none";
  }
}
```

Debido a como funciona el _raycasting_ con la geometría de los círculos en _Three.js_, hemos optado por en cada terremoto crear un punto invisible con el que aplicar _raycasting_. De esta manera se consigue un resultado más preciso que aplicando _raycasting_ directamente sobre una malla con geometría de círculo. Asimismo como el evento ocurre al mover el ratón si se deja el cursor sobre un terremoto que ha desaparecido y no se ha movido el ratón, su tooltip no desaparecerá, permitiendo ver todavía la información del mismo.

El raycaster está configurado con un threshold específico para puntos, que ayuda a disminuir los falsos aciertos:

```javascript
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.1;
```

La función `changeInterval()` permite al usuario modificar el rango temporal de visualización mediante inputs _HTML_. Valida las entradas y reinicia la animación con los nuevos parámetros:

```javascript
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
```

Esta función está conectada a un botón _HTML_:

```javascript
const button = document.querySelector("button");
button.addEventListener("click", changeInterval);
```

Para implementar esto en la función `iniciarAnimacion()` al principio hay un condicional que elimina el intervalo previo. De esta manera no hay varios intervalos para generar la animación ocurriendo simultáneamente.
```javascript
function iniciarAnimacion() {
    if (animationInterval) {
        clearInterval(animationInterval);
    }
    // Resto del código
} 
```


La función `displayDate()` actualiza el elemento _HTML_ que muestra la fecha actual en formato legible:

```javascript
function displayDate(currentDate) {
  fecha2show.innerHTML = currentDate.toLocaleString("es-ES", opciones);
}
```

Finalmente, `animate()` mantiene el loop de renderizado constante, actualizando la escena:

```javascript
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
```

## Página web
En la página principal simplemente se ha creado una zona en la que aparecerán los gráficos generados por _Three.js_:
```html
<div id="app"></div>
```

Y otra para los _inputs_ que permitirán elegir el rango de fechas:

```html
    <div style="flex: auto; display: flex; gap: 10px; justify-content: center">
    <label>
        Desde:
        <input
                type="number"
                name="inf"
                placeholder="Desde"
                min="1965"
                max="2016"
        />
    </label>
    <label>
        Hasta:
        <input
                type="number"
                name="sup"
                placeholder="Hasta"
                min="1965"
                max="2016"
        />
    </label>
    <button id="button">Apply</button>
</div>
```

Esta zona tiene unas pocas reglas de estilo para que se vea centrado en la página web

Y para la totalidad de la página se han aplicado otras pocas reglas de estilo para que esta ocupe lo máximo posible:

```html
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
      }
    </style>
```

## Controles

- **Clic derecho y arrastrar**: Desplazar el mapa (pan)
- **Rueda del ratón**: Zoom sobre el mapa
- **Pasar cursor sobre terremoto**: Mostrar tooltip con información detallada
- **Inputs de año + botón**: Modificar el rango temporal de visualización. Se deberá esperar a que termine la animación del mes actual para que se aplique el cambio.

## Capturas y demostración

### Vista general
![Vista general de terremotos](general_view.png)

### Tooltip informativo
![Tooltip con información detallada](sniping_tool_view.png)

### Ondas expansivas
![Ondas sísmicas expandiéndose](waves_view.png)

## Vídeo
[Ver vídeo de demostración](./DEMO.mp4)

## Posibles mejoras técnicas
Actualmente se utilizan los métodos `setInterval()` para manejar la animación de los terremotos en cada mes y múltiples `requestAnimatioFrame()` para cada onda, aparte del bucle principal que se encarga de actualizar la escena. Sería buena idea moverlo todo al propio bucle principal y tener solo uno en vez de tener múltiples bucles ya que _JavaScript_ solo tiene un único hilo y entonces estos bucles se están ejecutando todos secuencialmente. 

Con el número de terremotos que se muestran actualmente de manera simultánea no supone un problema, pero si se quisieran mostrar más terremotos (por ejemplo, para mostrar un intervalo mayor, en vez de por meses, por años o décadas) sí que podría ser problemático la cantidad de bucles diferentes que está gestionando el programa actualmente. 

## Referencias

- https://threejs.org/docs/#api/en/core/Raycaster
- [Dataset de terremotos](https://www.kaggle.com/datasets/usgs/earthquake-database?resource=download)
- https://github.com/otsedom/otsedom.github.io/tree/main/IG/S8

## Uso de IA

- Facilitación en la elaboración del README (corrección ortográfica, generación de la estructura basada en el README de la práctica anterior).
- Ayuda para optimizar la gestión de memoria mediante dispose() de geometrías y materiales.
- Ayuda para implementar el bucle de animación de las ondas