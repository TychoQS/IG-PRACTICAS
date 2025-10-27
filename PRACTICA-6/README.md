# Link to CodeSandBox
https://codesandbox.io/p/sandbox/entrega-p6-ig-tycho-quintana-santana-forked-dvjm7m

# Descripción de entrega
El trabajo consiste en la creación de un sistema planetario en 3D mediante el uso de la biblioteca _Three.js_ para trabajar conceptos propios de los gráficos por ordenador como lo son la iluminación, las sombras, las texturas, el control de cámara y modelos 3D. 

El proyecto se debe ejecutar mediante el enlace al proyecto en CodeSandbox del apartado anterior, no obstante  el código está disponible en el repositorio dentro de la carpeta ```src```. Sin embargo para ejecutarlo en local puede ser necesario realizar algún cambio ya que el formato con el que trabaja CodeSandBox no es compatible con todos los entornos de desarrollo. 

# Trabajo realizado
El código principal tiene dos funciones, ```ìnit()```, que se encarga de inicializar todo lo necesario para la ejecución del programa, y ```animationLoop()``` que se encarga de manejar toda la lógica relacionada con la animación.   

En la función ```init()``` lo primero que hace es llamar a ```initTextures()``` para cargar las diferentes texturas que se van a usar para que estén totalmente disponibles para el resto de la ejecución sin problemas. 

A continuación, ```initScene()``` se encarga de configurar la escena. Dentro de esta función se crean las cámaras (la cámara general y la cámara de la nave), se inicializa el renderizador de Three.js, se añaden los controles de cámara (OrbitControls y FlyControls) y se prepara un plano invisible que se usará para el _raycasting_. Además, se llama a ```initLights()``` para añadir las luces. En este caso como es un sistema solar, se ha optado por añadir solo dos tipos de luces. Luz ambiental para iluminar por igual a todos los objetos y una luz de tipo _PointLight_ que ilumina en todas las direcciones (como si fuese una bombilla) en el origen, para imitar el comportamiento del sol. En estos además se activa el sombreado en el _renderer_ y en la luz de tipo _Pointlight_, ya que queremos que si hay luces, se generen sombras.

```initEventListeners()``` configura los eventos del usuario. Se añade un listener para detectar clics de ratón, que permite crear nuevos planetas con raycasting, y un listener para el teclado, que permite cambiar entre la vista general y la vista desde la nave.

La función ```Estrella()``` se encarga de crear el sol de la escena. Para ello se genera una esfera a la que se le debe de pasar un radio, el color y opcionalmente una textura que se le puede aplicar.



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
