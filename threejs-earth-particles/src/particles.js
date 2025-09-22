import * as THREE from "three";

const createParticles = (pointsArray) => {
  console.log("making particles", pointsArray);
  const numParticles = 25000;
  const particles = [];

  //texture circle
  var canvas = document.createElement("CANVAS");
  canvas.width = 128;
  canvas.height = 128;
  var context = canvas.getContext("2d");
  context.globalAlpha = 0.3;
  context.filter = "blur(16px)";
  context.fillStyle = "white";
  context.beginPath();
  context.arc(64, 64, 40, 0, 2 * Math.PI);
  context.fill();
  context.globalAlpha = 1;
  context.filter = "blur(5px)";
  context.fillStyle = "white";
  context.beginPath();
  context.arc(64, 64, 16, 0, 2 * Math.PI);
  context.fill();

  var texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    color: 0x11ffff,
    size: 0.021,
    sizeAttenuation: true,
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
  });
  let geometry = new THREE.BufferGeometry();

  for (let i = 0; i < numParticles; i++) {
    let randomIndex = Math.floor(Math.random() * pointsArray.length);
    let position = pointsArray[randomIndex];
    const p = {};
    p.position = position;
    p.velocity = Math.random() * 0.1;
    p.lifetime = (Math.random() * 2000 + 200).toFixed(0); // seconds
    p.dob = performance.now();
    particles.push(p);
  }

  let positionsArray = [];
  let vArray = [];
  let lifeArray = [];
  let dobArray = [];

  particles.forEach((p) => {
    positionsArray.push(p.position.x, p.position.y, p.position.z);
    vArray.push(p.velocity);
    lifeArray.push(p.lifetime);
    dobArray.push(p.dob);
  });
  console.log(dobArray, lifeArray, positionsArray);
  const positionAttribute = new THREE.Float32BufferAttribute(positionsArray, 3);

  const velocityAttribute = new THREE.Float32BufferAttribute(vArray, 1);

  const lifeAttribute = new THREE.Float32BufferAttribute(lifeArray, 1);

  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("lifetime", lifeAttribute);

  let pParticles = new THREE.Points(geometry, material);
  console.log(pParticles);
  return pParticles;
};

const particle = (position) => {
  this.position = position;
  this.velocity = Math.random() * 0.1;
  this.lifetime = Math.random() * 2500 + 500; // millisec
  this.dob = performance.now();
};

const animateParticles = (particles, pointsArray) => {
  if (!particles) return;
  if (!particles.geometry) return;

  let positionAttribute = particles.geometry.getAttribute("position");
  let lifeAttribute = particles.geometry.getAttribute("lifetime");

  let now = performance.now();
  for (let i = 0; i < positionAttribute.count; i++) {
    //if particle still alive
    if (
      now % lifeAttribute.array[Math.floor(i / 3)] >
      lifeAttribute.array[i] * 0.95
    ) {
      //direction vector outwards
      let vOut = new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      ).normalize();

      let x = positionAttribute.getX(i) + vOut.x * 0.0005;
      let y = positionAttribute.getY(i) + vOut.y * 0.0005;
      let z = positionAttribute.getZ(i) + vOut.z * 0.0005;

      positionAttribute.setXYZ(i, x, y, z);
    } else {
      let resetPt =
        pointsArray[Math.floor(Math.random() * pointsArray.length - 1)];
      positionAttribute.setXYZ(i, resetPt.x, resetPt.y, resetPt.z);
    }
  }
  positionAttribute.needsUpdate = true;
};

export { createParticles, animateParticles };
