import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui'

import nebula from '/img/nebula.jpg';
import suelo from '/img/suelo.jpeg';
//Creació de l'escena
var escena = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
escena.background = textureLoader.load(nebula);

//Creació del render
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setClearColor("#000000");
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );



//Creació de l'objecte
var geometry_floor = new THREE.BoxGeometry(5,0.1,5);
var material_floor = new THREE.MeshPhongMaterial( { 
  map: textureLoader.load(suelo) 
} );
var floor = new THREE.Mesh( geometry_floor, material_floor );
floor.castShadow = false;
floor.receiveShadow = true; 
escena.add(floor);

var geometry_aro = new THREE.RingGeometry( 1.1, 1.5, 6 );
var material_aro = new THREE.MeshPhongMaterial({ color: "#9b9b9b", side: THREE.DoubleSide});
var aro = new THREE.Mesh( geometry_aro, material_aro );
aro.castShadow = true; //default is false
aro.receiveShadow = true; //default
aro.rotation.x = Math.PI / 2;
aro.position.y = 1; 
escena.add(aro);


const monkeyUrl = new URL('assets/monkey.glb', import.meta.url);
const assetLoader = new GLTFLoader();
assetLoader.load(monkeyUrl.href, function(gltf) {
  const model = gltf.scene;
  escena.add(model);
  model.position.set(0, 1, 0);
  model.scale.set(0.75,0.75,0.75);
  model.traverse(function(node) {
    if(node.isMesh){
      node.castShadow = true;
    }
  });
  //model.castShadow = true; //default is false
  //model.receiveShadow = true; //default
}, undefined, function(error) {
  console.error(error);
});

pivotPoint = new THREE.Object3D();
pivotPoint.position.set(0,1.1,0);
escena.add( pivotPoint );

var model_bat;
const batUrl = new URL('assets/Bat.gltf', import.meta.url);
const assetLoader2 = new GLTFLoader();
assetLoader2.load(batUrl.href, function(gltf) {
  model_bat = gltf.scene;
  //escena.add(model_bat);
  pivotPoint.add(model_bat);
  model_bat.position.set(1.2, 0, 0);
  model_bat.scale.set(0.25,0.25,0.25);
  model_bat.traverse(function(node) {
    if(node.isMesh){
      node.castShadow = true;
    }
  });
  //model.castShadow = true; //default is false
  //model.receiveShadow = true; //default
}, undefined, function(error) {
  console.error(error);
});

var model_ghost;
const ghostUrl = new URL('assets/Ghost.gltf', import.meta.url);
const assetLoader3 = new GLTFLoader();
assetLoader3.load(ghostUrl.href, function(gltf) {
  model_ghost = gltf.scene;
  //escena.add(model_ghost);
  pivotPoint.add(model_ghost);
  model_ghost.rotation.y += Math.PI;
  model_ghost.position.set(-1.2, 0, 0);
  model_ghost.scale.set(0.25,0.25,0.25);
  model_ghost.traverse(function(node) {
    if(node.isMesh){
      node.castShadow = true;
    }
  });
  //model.castShadow = true; //default is false
  //model.receiveShadow = true; //default
}, undefined, function(error) {
  console.error(error);
});

/* 
Pruebas camara helper para visualizar como funciona la camara
*/
//Creació de la camera
var controls_cam = { //Parametres inicials de la camera
  fov:75,
  near: 0.1,
  far:10
}

//Controls per modificar FOV, near , far
const gui = new GUI()
const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(controls_cam, 'fov', 0, 100)
cameraFolder.add(controls_cam, 'near', 0.1, 15)
cameraFolder.add(controls_cam, 'far', 0.1, 15)
cameraFolder.open()

//Creació de la camera en perspectiva , colocació i enfocat a un punt
var camera = new THREE.PerspectiveCamera( controls_cam.fov, window.innerWidth/window.innerHeight, controls_cam.near, controls_cam.far );
camera.position.z = 4;
camera.position.y = 2;
camera.lookAt(0,1,0);

//Control orbital per poder moure la camera respecte un punt amb el ratolí
const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0, 1, 0);
controls.update();

const helper = new THREE.CameraHelper( camera );
escena.add( helper );

//Creacion segunda camara y segundo render

var div_camera = document.getElementById("camara2"); //Div donde se coloca la segunda camara
var DIV_WIDTH = div_camera.clientWidth;
var DIV_HEIGHT = div_camera.clientHeight;

camera2 = new THREE.PerspectiveCamera(75, DIV_WIDTH / DIV_HEIGHT, 0.1, 1000);
camera2.position.x = 6;
camera2.position.y = 2;
camera2.lookAt(0,1,0);

var renderer2 = new THREE.WebGLRenderer({antialias:true});
renderer2.setClearColor("#000000");
renderer2.setSize( DIV_WIDTH,  DIV_HEIGHT);
renderer2.shadowMap.enabled = true;
renderer2.shadowMap.type = THREE.PCFSoftShadowMap;
div_camera.appendChild(renderer2.domElement);

//llum de l'escena
const spotLight = new THREE.SpotLight(0xFFFFFF);  // Llum de font de focus
escena.add(spotLight);
// Colocacio , permetre ombre, angle de projeccio, penombra y decadencia de la llum 
spotLight.position.set(8, 8, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2;
spotLight.penumbra = 0.25;
spotLight.decay = 0.5;

escena.add( new THREE.AmbientLight(0xffffff, 0.5)); // Llum ambient


//Redimensionat de la pagina
window.onresize = function(){
	renderer.setSize(window.innerWidth,window.innerHeight);
	var aspectRatio = window.innerWidth/window.innerHeight;
  camera.aspect = aspectRatio;
	camera.updateProjectionMatrix();

  var div_camera = document.getElementById("camara2");
  var DIV_WIDTH = div_camera.clientWidth;
  var DIV_HEIGHT = div_camera.clientHeight;
  renderer2.setSize(DIV_WIDTH,DIV_HEIGHT);
  var aspectRatio2 = DIV_WIDTH/DIV_HEIGHT;
  camera2.aspect = aspectRatio2;
  camera2.updateProjectionMatrix();
}


// Loop de renderitzat per a les animacions
var arriba = true;
var render = function () {
  requestAnimationFrame( render );
  camera.fov = controls_cam.fov;
  camera.near = controls_cam.near;
  camera.far = controls_cam.far;
  camera.updateProjectionMatrix();
  camera2.updateProjectionMatrix();
  helper.update();

  aro.rotation.z -= 0.01;
  pivotPoint.rotation.y -= 0.02;
  if(arriba){
    pivotPoint.position.y += 0.02;
    if(pivotPoint.position.y > 1.8)
      arriba= false; 
  }
  else{
    pivotPoint.position.y -= 0.02;
    if (pivotPoint.position.y < 1.1)
      arriba= true;
  }

  // Render the scene
  {
  renderer.render(escena, camera);
  helper.visible = true;
  }
  {
  renderer2.render(escena, camera2);
  helper.visible = false;
  }
};

render();