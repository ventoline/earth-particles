import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";
import { createParticles, animateParticles } from "./src/particles.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
// THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const earthGroup = new THREE.Group(); //
//earthGroup.rotation.z = (-23.4 * Math.PI) / 180;
scene.add(earthGroup);
new OrbitControls(camera, renderer.domElement);

const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, 512);
const texture = new THREE.TextureLoader().load("./textures/02_earthspec1k.jpg");

const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/02_earthspec1k.jpg", () => {
    console.log("texture loaded");
    creaTexData();
  }),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
  wireframe: true,
  //  vertexColors: true,
});
const earthMesh = new THREE.Mesh(geometry, material);
//earthGroup.add(earthMesh);
console.log(material.map.source);

console.log(earthMesh.geometry.attributes);

var ptPos = [];
var ptColors = [];
var particles = THREE.Points;
// Store image data lookup function
function savePointsAsText(ptString, filename = "points.txt") {
  // Convert the array of points to a JSON string.
  // This handles nested arrays or objects within the points.

  // Create a Blob object from the string data.
  const blob = new Blob([ptString], { type: "text/plain" });
  //  const blob = new Blob([dataString], { type: "text/plain" });

  // Create a URL for the Blob.
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element.
  const a = document.createElement("a");
  a.href = url;
  a.download = filename; // Set the desired filename for the download.

  // Programmatically click the anchor to trigger the download.
  document.body.appendChild(a); // Append to body is required for Firefox
  a.click();

  // Clean up by revoking the object URL and removing the anchor.
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// make continents positions Array
const creaTexData = () => {
  //get texture image data
  console.log(material.map.source);
  let width = material.map.source.data.width;
  let height = material.map.source.data.height;
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  let ptString = "";
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(material.map.source.data, 0, 0);
  let imgData = ctx.getImageData(0, 0, width, height).data;

  let getColor = (u, v) => {
    let x = Math.ceil(u * width);
    let y = Math.ceil((1 - v) * height); // Flip V coordinate
    let index = (y * width + x) * 4;
    let grey =
      (imgData[index] / 255 +
        imgData[index + 1] / 255 +
        imgData[index + 2] / 255) /
      3;
    return grey;
  };

  for (
    let i = 0;
    i < earthMesh.geometry.attributes.position.array.length;
    i += 3
  ) {
    var vertex = new THREE.Vector3();
    let u = earthMesh.geometry.attributes.uv.array[Math.floor(i / 3) * 2];
    let v = earthMesh.geometry.attributes.uv.array[Math.floor(i / 3) * 2 + 1];

    //ignore if white -oceans-
    let grey = getColor(u, v);
    if (grey < 0.1) {
      vertex.x = earthMesh.geometry.attributes.position.array[i];
      vertex.y = earthMesh.geometry.attributes.position.array[i + 1];
      vertex.z = earthMesh.geometry.attributes.position.array[i + 2];
      ptPos.push(vertex);
    } else {
    }
  }
  if (ptPos.length > 1) {
  }

  //add particles
  particles = createParticles(ptPos);
  scene.add(particles);
};
const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
//earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load("./textures/05_earthcloudmaptrans.jpg"),
  // alphaTest: 0.3,
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
//earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

const stars = getStarfield({ numStars: 2000 });
//scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

function animate() {
  requestAnimationFrame(animate);
  if (particles !== undefined) animateParticles(particles, ptPos);
  //add rotation
  /*   earthMesh.rotation.y += 0.002;
  lightsMesh.rotation.y += 0.002;
  cloudsMesh.rotation.y += 0.0023;
  glowMesh.rotation.y += 0.002;
  stars.rotation.y -= 0.0002; */
  renderer.render(scene, camera);
}
animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
