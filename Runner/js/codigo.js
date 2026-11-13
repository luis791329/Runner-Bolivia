
//*ELEMENTOS DEL HTML*/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const txtPuntos = document.getElementById("txt_puntos");
const txtVidas = document.getElementById("txt_vidas");
const txtNivel = document.getElementById("txt_nivel");
const mensaje = document.getElementById("mensaje");

//**VARIEBLES DEL JUEGO */
let recompensas = [];
let contadorRecompesa = 0;
let granizos = [];
let contadorGranizo = 0;

let obstaculos = [];
let contadorObstaculo = 0;
let puntos = 0;
let vidas = 3;
let nivel = 1;
let jugando = false;
let terminado=false;
//*NIVELES (ALTIPLANO, VALLES, ORIENTE)
const SUELO = 340;
const niveles =[
  {nombre: "Altiplano ", cielo: "#3f90ac", suelo: "#8b5a2b", velocidad:4, intervaloObstaculo: 100, intervaloGranizo: 80, meta: 6000},
  {nombre: "valles", cielo: "#7cc576", suelo: "#5a7d2b", velocidad:5, intervaloObstaculo: 85, intervaloGranizo: 60, meta: 8000 },
  {nombre: "oriente", cielo: "#1f6b4a", suelo: "#3b2a1a", velocidad:6, intervaloObstaculo: 70, intervaloGranizo: 45, meta: 10000 },
  
];
let config =niveles[0];
let velocidadMundo = config.velocidad;
let distancia=0;


//*MENSAJE Y PANEL
function mostrasMensaje(texto) {
  mensaje.textContent = texto;
}
function actualizarPanel() {
  txtPuntos.textContent = puntos;
  txtVidas.textContent = vidas;
  txtNivel.textContent = nivel;
}
//*CLASES
//*clase jugador
class Jugador {
  constructor() {
    this.x = 100;
    this.ancho = 30;
    this.alto = 50;
    this.y = SUELO - this.alto;
    this.velocidad = 5;
    this.vy = 0;
    this.gravedad = 0.6;
    this.fuerzaSalto = -13;
    this.enSuelo = true;
    this.invulnerable = 0;
  }
  saltar() {
    if (this.enSuelo) {
      this.vy = this.fuerzaSalto;
      this.enSuelo = false;
    }
  }
  actualizar() {
    if (this.invulnerable > 0) this.invulnerable--;
    if (teclas.izquierda) this.x -= this.velocidad;
    if (teclas.derecha) this.x += this.velocidad;
    if (this.x < 0) this.x = 0;
    if (this.x + this.ancho > canvas.width) this.x = canvas.width - this.ancho;
    this.vy += this.gravedad;
    this.y += this.vy;
    if (this.y + this.alto >= SUELO) {
      this.y = SUELO - this.alto;
      this.vy = 0;
      this.enSuelo = true;
    }
  }
  dibujar() {
    if (this.invulnerable > 0 && Math.floor(this.invulnerable / 5) % 2 === 0) return;
    ctx.fillStyle = "orange";
    ctx.fillRect(this.x, this.y, this.ancho, this.alto);
  }
}
//*clase obstaculo
class Obstaculo {
  constructor() {
    this.ancho = 30;
    this.alto = 40;
    this.x = canvas.width;
    this.y = SUELO - this.alto;
  }
  actualizar() {
    this.x -= velocidadMundo;
  }
  dibujar() {
    ctx.fillStyle = "black";
    ctx.fillRect(this.x, this.y, this.ancho, this.alto);
  }
}
//*clase granizo
class Granizo {
  constructor() {
    this.radio = 10;
    this.x = Math.random() * (canvas.width - 2 * this.radio) + this.radio;
    this.y = -this.radio;
    this.velocidad = 3 + Math.random() * 3;
  }

  actualizar() {
    this.y += this.velocidad;
  }

  dibujar() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
    ctx.fill();
  }
}
//*clase recompesa
class Recompensa {
  constructor() {
    this.radio = 12;
    this.x = canvas.width;
    this.y = SUELO - 30 - Math.random() * 90;
    this.puntos = 10;
  }

  actualizar() {
    this.x -= velocidadMundo;
  }

  dibujar() {
    ctx.fillStyle = "gold";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
    ctx.fill();
  }
}
//*CONTROLES DEL TECLADO
const jugador = new Jugador();
const teclas = { izquierda: false, derecha: false };
//*pulsar tecla
document.addEventListener("keydown", function (e) {

  if (e.code === "KeyA" || e.code === "ArrowLeft") teclas.izquierda = true;
  if (e.code === "KeyD" || e.code === "ArrowRight") teclas.derecha = true;
  if (e.code === "Space"|| e.code === "ArrowUp" || e.code === "KeyW") {
    e.preventDefault();
  if  (jugando) jugador.saltar();
  }
});
//*soltar tecla
document.addEventListener("keyup", function (e) {
  if (e.code === "KeyA" || e.code === "ArrowLeft") teclas.izquierda = false;
  if (e.code === "KeyD" || e.code === "ArrowRight") teclas.derecha = false;
});
//*DIBUJO DE FONDO Y PROGRESO
//*fondo(cielo y suelo)
function dibujarFondo() {
  ctx.fillStyle = config.cielo;
  ctx.fillRect(0, 0, canvas.width,  SUELO);
  ctx.fillStyle= config.suelo;
  ctx.fillRect(0,SUELO, canvas.width, canvas.height-SUELO);


}
//*barra de progeso y nombre de le region
function dibujarProgreso(){
  const avanze=Math.min(1,distancia/config.meta);
  ctx.fillStyle="rgba(0,0,0,0.4)";
  ctx.fillRect(20,15,200,12);
  ctx.fillStyle="white";
  ctx.fillRect(20,15,200*avanze,12);
  ctx.font="16px sans-serif";
  ctx.fillText(config.nombre,20,48);
}
//*GESTION DE OBSTACULOS, GRANIZOS Y RECONPENSAS
//*obstaculos
function gestionarObstaculos() {
  contadorObstaculo++;
  if (contadorObstaculo >= config.intervaloObstaculo) {
    obstaculos.push(new Obstaculo());
    contadorObstaculo = 0;
  }
  for (let i = 0; i < obstaculos.length; i++) {
    obstaculos[i].actualizar();
    obstaculos[i].dibujar();
  }
  obstaculos = obstaculos.filter(function (o) {
    return o.x + o.ancho > 0;
  });
}
//*granizos
function gestionarGranizos() {
  contadorGranizo++;
  if (contadorGranizo >= config.intervaloGranizo) {
    granizos.push(new Granizo());
    contadorGranizo = 0;
  }
  for (let i = 0; i < granizos.length; i++) {
    granizos[i].actualizar();
    granizos[i].dibujar();

  }

  granizos = granizos.filter(function (g) {
    return g.y - g.radio < SUELO;
  });
}
//*recompensas*//
function gestionarRecompensas() {

  contadorRecompesa++;
  if (contadorRecompesa >= 120) {
    recompensas.push(new Recompensa());
    contadorRecompesa = 0;
  }
  for (let i = 0; i < recompensas.length; i++) {
    recompensas[i].actualizar();
    recompensas[i].dibujar();

  }

  recompensas = recompensas.filter(function (r) {
    return r.x- r.radio > 0;
  });
}
//* COLISIONES Y VIDAS*
//* colision rectangulo con rectangulo
function chocaRect(a, b) {
  return (
    a.x < b.x + b.ancho &&
    a.x + a.ancho > b.x &&
    a.y < b.y + b.alto &&
    a.y + a.alto > b.y
  );
}
//*colision circulo con rectangulo
function chocaCirculo(c, r) {
  const cercanoX = Math.max(r.x, Math.min(c.x, r.x + r.ancho));
  const cercanoY = Math.max(r.y, Math.min(c.y, r.y + r.alto));
  const dx = c.x - cercanoX;
  const dy = c.y - cercanoY;
  return dx * dx + dy * dy < c.radio * c.radio;

}
//*perder vida 
function perderVida() {
  if (jugador.invulnerable > 0) return;
  vidas--;
  jugador.invulnerable = 90;
  actualizarPanel();
  if (vidas <= 0) {
    jugando = false;
    terminado=true;
    mostrasMensaje("Perdiste, Pulsa jugar para Intentarlo de nuevo");

  }
}
//*revisar todas las colisiones
function verificarColisiones() {
  for (let i = 0; i < obstaculos.length; i++) {
    if (chocaRect(jugador, obstaculos[i])) perderVida();

  }
  for (let i = granizos.length - 1; i >= 0; i--) {
    if (chocaCirculo(granizos[i], jugador)) {
      perderVida();
      granizos.splice(i, 1);
    }
  }
  for (let i = recompensas.length - 1; i >= 0; i--) {
    if (chocaCirculo(recompensas[i], jugador)) {
      puntos += recompensas[i].puntos;
      recompensas.splice(i, 1);
      actualizarPanel();
    }
  }
}
//*NIVELES Y META 
//*carga nivel
function cargaNivel(){
  config=niveles[nivel-1];
  velocidadMundo=config.velocidad;
  distancia=0;
  obstaculos=[];
  granizos=[];
  recompensas=[];
  actualizarPanel();

}
//*verificar meta
function verificarMeta(){
  if(!jugando)return;
  distancia+=velocidadMundo;
  if(distancia<config.meta) return;
  if(nivel<niveles.length){
    nivel++;
    cargaNivel();
    mostrasMensaje("nivel " +nivel+": "+config.nombre);
    setTimeout(function(){
      mostrasMensajeÇ("");
    },2500);
  }else{
    jugando=false;
    terminado=true;
    mostrasMensaje("ganaste recorriste todo bolivia " + puntos + "puntos");
  }
}
//*CONTROL DEL JUEGO
//*jugar
function iniciar(){
  if (terminado)reiniciar();
  jugando=true;
  mostrasMensaje("");
}
//*pausa
function pausar(){
  if (terminado)return;
  jugando=false;
  mostrasMensaje("pausa, pulsa para continuar");
}
//*reiniciar
function reiniciar(){
  puntos=0;
  vidas=3;
  nivel=1;
  terminado=false;
  teclas.izquierda=false;
  teclas.derecha=false;
  jugador.x=100;
  jugador.y=SUELO-jugador.alto;
  jugador.vy=0;
  jugador.enSuelo=true;
  jugador.invulnerable=0;
  cargaNivel();
  jugando=true;
  mostrasMensaje("");
}
//*BOTONES DE LA PANTALLA
//*jugar,pausa y reiniciar
document.getElementById("btn_jugar").addEventListener("click",iniciar);
document.getElementById("btn_pausa").addEventListener("click",pausar);
document.getElementById("btn_reiniciar").addEventListener("click",reiniciar);
//*botones tactiles de direccion(celular)
function conectarDireccion(id, direccion){
  const boton=document.getElementById(id);
  boton.addEventListener("pointerdown",function(){teclas[direccion]=true;});
  boton.addEventListener("pointerup",function(){teclas[direccion]=false;});
  boton.addEventListener("pointerleave",function(){teclas[direccion]=false;});
  boton.addEventListener("pointercancel",function(){teclas[direccion]=false;});
}
conectarDireccion("btn_izq", "izquierda");
conectarDireccion("btn_der", "derecha");
//*boton tactil del salto (celular)
document.getElementById("btn_salto").addEventListener("pointerdown",function(){
  if (jugando) jugador.saltar();
});
//*PANTALLA INICIAL
actualizarPanel();
mostrasMensaje("pulsa para jugar");
//*BUCLE PRINCIPAL
function bucle() {
  if (!jugando) {
    requestAnimationFrame(bucle);
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dibujarFondo();
  gestionarObstaculos();
  gestionarGranizos();
  gestionarRecompensas();
  jugador.actualizar();
  verificarColisiones();
  verificarMeta();
  jugador.dibujar();
  dibujarProgreso();
  requestAnimationFrame(bucle);
}
//*ARRANQUE DEL JUEGO*//
dibujarFondo();
jugador.dibujar();
dibujarProgreso();
bucle();



