# Link to CodeSandBox
https://codesandbox.io/p/sandbox/entrega-p6-ig-tycho-quintana-santana-forked-dvjm7m

# Descripción de entrega
El trabajo consiste en la creación de un sistema planetario en 3D mediante el uso de la biblioteca _Three.js_ para trabajar conceptos propios de los gráficos por ordenador como lo son la iluminación, las sombras, las texturas, el control de cámara y modelos 3D. 

El proyecto se debe ejecutar mediante el enlace al proyecto en CodeSandbox del apartado anterior, no obstante  el código está disponible en el repositorio dentro de la carpeta ```src```. Sin embargo para ejecutarlo en local puede ser necesario realizar algún cambio ya que el formato con el que trabaja CodeSandBox no es compatible con todos los entornos de desarrollo. 

# Trabajo realizado
El código principal tiene dos funciones, ```ìnit()```, que se encarga de inicializar todo lo necesario para la ejecución del programa, y ```animationLoop()``` que se encarga de manejar toda la lógica relacionada con la animación.   

En la función ```init()``` lo primero que se hace es llamar a ```initTextures()``` es cargar las diferentes texturas que se van a usar para que estén totalmente disponibles para el resto de la ejecución sin problemas. En este caso se cargan las texturas para 5 planetas, el sol y dos para la luna, una de ellas la textura normal y la otra la de relieve. Todas ellas obtenidas de la [esta página de aquí](https://planetpixelemporium.com/planets.html).
```js
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
```


# Controles
- G: Activar "Vista general"
  - Vista general:
    - Clic izquierdo y mover ratón: Rotar escena
    - Clic derecho y mover ratón: Trasladar escena
    - Rueda ratón: Zoom escena
    - Clic rueda ratón: Añadir un planeta con color aleatorio y órbita elíptica donde está el cursor si está sobre el plano Z
- N: Activar "Vista de nave"  
  - Vista de nave:
    - Clic izquierdo y derecho mientras se mueve el ratón: Mover la cámara
    - W: Desplazarse hacia delante
    - S: Desplazarse hacia detrás
    - A: Desplazarse a la izquierda
    - D: Desplazarse a la derecha
    - Q/E: Rotar
   
# Vídeo de demostración

[Ver vídeo de ejecución del sistema planetario](./DEMO.mp4)
