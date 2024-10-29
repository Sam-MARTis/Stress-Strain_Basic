import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const makeRender = () => {
  // obj.rotation.y = 0.001*t
  // console.log(t);
  
  renderer.render(scene, camera);
  controls.update();
  requestAnimationFrame(makeRender);
};

// Fix maxx and maxy not functioning properly

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
const fov = 75;
const AR = canvas.width / canvas.height;
const near = 0.1;
const far = 500;
const camera = new THREE.PerspectiveCamera(fov, AR, near, far);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

let COLOUR_STRENGTH = 0.5;
let COLOUR_SCALE = 20;
let DISPLACEMENT_MULTIPLIER = 3;

const maxx = 2;
const maxy = 2;
const maxz = 2;
const step = 0.1;





const countX = Math.ceil(maxx / step);
const countY = Math.ceil(maxy / step);
const countZ = Math.ceil(maxz / step);

const countR = 5;
const countTheta = 50;
const countPhi = 30;

const radius = 3;
const dr = radius / (countR-1);
const dtheta = 2 * Math.PI / (countTheta-1);
const dphi = Math.PI / (countPhi-1);


// const size = 0.1;

const displacementFunction = (x: number, y: number, z: number): Vector => {
  const multiplier = 0.03*DISPLACEMENT_MULTIPLIER;
  const dx = y*z ;
  const dy = -(z * z * z*x) / 2;
  const dz = -x*y / 2;
  return { x: dx * multiplier, y: dy * multiplier, z: dz * multiplier };
};

const create3DArrayCartesian = (
  a: number,
  b: number,
  c: number,
  axis: number
): number[][][] => {
  //Order of acces is y x z
  const array: number[][][] = [];
  for (let j = 0; j < b; j++) {
    array.push([]);
    for (let i = 0; i < a; i++) {
      array[j].push([]);
      for (let k = 0; k < c; k++) {
        array[j][i].push(0);
      }
    }
  }
  const isX: number = +(axis == 1); //Typescript be freaky. Add + and boolean gets converted to number
  const isY: number = +(axis == 2);
  const isZ: number = +(axis == 3);
  
  for (let j = 0; j < b; j++) {
    for (let k = 0; k < c; k++) {
      for (let i = 0; i < a; i++) {
        array[j][i][k] = (i * isX + j * isY + k * isZ) * step;
      }
    }
  }
  
  return array;
};
const polarToCartesian = (r: number, theta: number, phi: number): Vector => {
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return { x, y, z };
}
const create3DArrayPolar = (
  a: number,
  b: number,
  c: number,
): number[][][] => {
  //Order of acces is y x z
  const array: number[][][] = [];
  for (let j = 0; j < b; j++) {
    array.push([]);
    for (let i = 0; i < a; i++) {
      array[j].push([]);
      for (let k = 0; k < c; k++) {
        array[j][i].push(0);
      }
    }
  }

  return array;
};
let xVals: number[][][] = [];
let yVals: number[][][] = [];
let zVals: number[][][] = [];







/* Cartesian coordinates for cube. Comment below and uncomment polar for swicthing to sphere */

xVals = create3DArrayCartesian(countX, countY, countZ, 1);
yVals = create3DArrayCartesian(countX, countY, countZ, 2);
zVals = create3DArrayCartesian(countX, countY, countZ, 3);

/* Cartesian coordinates for cube end. */






/* Polar coordinates for sphere. Uncomment below and comment above for swicthing to sphere */
xVals = create3DArrayPolar( countTheta, countR, countPhi);
yVals = create3DArrayPolar( countTheta, countR, countPhi);
zVals = create3DArrayPolar( countTheta, countR, countPhi);
console.log("Count: ", countR, countTheta, countPhi);
console.log("xVals: ", xVals.length, xVals[0].length, xVals[0][0].length);

let rVals =     create3DArrayPolar( countTheta, countR, countPhi);
let thetaVals = create3DArrayPolar( countTheta, countR, countPhi);
let phiVals =   create3DArrayPolar( countTheta, countR, countPhi);
for(let j=0; j<rVals.length; j++){
  for(let i=0; i<thetaVals[0].length; i++){
    for(let k=0; k<phiVals[0][0].length; k++){
      const {x, y, z} = polarToCartesian(j*dr, i*dtheta, k*dphi);
      xVals[j][i][k] = x;
      yVals[j][i][k] = y;
      zVals[j][i][k] = z;

    }
  }
}

/* Polar coordinates for sphere end. */










const light = new THREE.AmbientLight("#ffffff", 1);

const geometry = new THREE.BufferGeometry();


// let rVals: number[][][][] = [];

let colourVals: number[][][][] = [];

const planeMat = new THREE.MeshStandardMaterial({
  color: "white",
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.1,
});

const planeXY = new THREE.PlaneGeometry(3, 3);

const planeXYMesh = new THREE.Mesh(planeXY, planeMat);
planeXYMesh.translateY(1.5);
planeXYMesh.translateX(1.5);
scene.add(planeXYMesh);

const planeYZ = new THREE.PlaneGeometry(3, 3);

const planeYZMesh = new THREE.Mesh(planeYZ, planeMat);
planeYZMesh.translateX(1.5);
planeYZMesh.translateZ(1.5);
planeYZMesh.rotateX(Math.PI / 2);
scene.add(planeYZMesh);

const planeXZ = new THREE.PlaneGeometry(3, 3);

const planeXZMesh = new THREE.Mesh(planeXZ, planeMat);
planeXZMesh.translateY(1.5);
planeXZMesh.translateZ(1.5);
planeXZMesh.rotateY(Math.PI / 2);
scene.add(planeXZMesh);


const create4DArray = (
  a: number,
  b: number,
  c: number,
  d: number
): number[][][][] => {
  //Order of acces is y x z
  const array: number[][][][] = [];
  for (let j = 0; j < b; j++) {
    array.push([]);
    for (let i = 0; i < a; i++) {
      array[j].push([]);
      for (let k = 0; k < c; k++) {
        array[j][i].push([]);
        for (let m = 0; m < d; m++) {
          array[j][i][k].push(0);
        }
      }
    }
  }
  return array;
};
































const createVertices = (
  xArr: number[][][],
  yArr: number[][][],
  zArr: number[][][]
): Float32Array => {
  const vertices = [];

  for (let j = 0; j < yArr.length - 1; j++) {
    for (let i = 0; i < xArr[0].length - 1; i++) {
      for (let k = 0; k < zArr[0][0].length - 1; k++) {
        // Coordinates of the hexahedron corners

        // cyxz
        const c000 = [xArr[j][i][k], yArr[j][i][k], zArr[j][i][k]];
        const c001 = [xArr[j][i][k + 1], yArr[j][i][k + 1], zArr[j][i][k + 1]];
        const c010 = [xArr[j][i + 1][k], yArr[j][i + 1][k], zArr[j][i + 1][k]];
        const c011 = [
          xArr[j][i + 1][k + 1],
          yArr[j][i + 1][k + 1],
          zArr[j][i + 1][k + 1],
        ];
        const c100 = [xArr[j + 1][i][k], yArr[j + 1][i][k], zArr[j + 1][i][k]];
        const c101 = [
          xArr[j + 1][i][k + 1],
          yArr[j + 1][i][k + 1],
          zArr[j + 1][i][k + 1],
        ];
        const c110 = [
          xArr[j + 1][i + 1][k],
          yArr[j + 1][i + 1][k],
          zArr[j + 1][i + 1][k],
        ];
        const c111 = [
          xArr[j + 1][i + 1][k + 1],
          yArr[j + 1][i + 1][k + 1],
          zArr[j + 1][i + 1][k + 1],
        ];

        // Front face
        vertices.push(...c000, ...c100, ...c010); // Triangle 1
        vertices.push(...c110, ...c100, ...c010); // Triangle 2

        // Back face
        vertices.push(...c100, ...c101, ...c110); // Triangle 1
        vertices.push(...c111, ...c101, ...c110); // Triangle 2

        // Left face
        vertices.push(...c101, ...c001, ...c111); // Triangle 1
        vertices.push(...c011, ...c111, ...c001); // Triangle 2

        // Right face
        vertices.push(...c001, ...c000, ...c011); // Triangle 1
        vertices.push(...c010, ...c011, ...c000); // Triangle 2

        // Top face
        vertices.push(...c010, ...c110, ...c011); // Triangle 1
        vertices.push(...c111, ...c011, ...c110); // Triangle 2

        // Bottom face
        vertices.push(...c001, ...c101, ...c000); // Triangle 1
        vertices.push(...c100, ...c000, ...c101); // Triangle 2
      }
    }
  }

  return new Float32Array(vertices);
};

const createColourVertices = (colourValues: number[][][][]) => {
  const vertices = [];

  for (let j = 0; j < colourValues.length-1; j++) {
    for (let i = 0; i < colourValues[0].length-1; i++) {
      for (let k = 0; k < colourValues[0][0].length-1; k++) {
        //Six faces and each face has two Triangles. Each triangle has three points which each need three frickin colours each
        const coloursToPush = [
          colourValues[j+0][i+0][k+0][0], colourValues[j+0][i+0][k+0][1], colourValues[j+0][i+0][k+0][2],
          colourValues[j+1][i+0][k+0][0], colourValues[j+1][i+0][k+0][1], colourValues[j+1][i+0][k+0][2],
          colourValues[j+0][i+1][k+0][0], colourValues[j+0][i+1][k+0][1], colourValues[j+0][i+1][k+0][2],
          colourValues[j+1][i+1][k+0][0], colourValues[j+1][i+1][k+0][1], colourValues[j+1][i+1][k+0][2],
          colourValues[j+1][i+0][k+0][0], colourValues[j+1][i+0][k+0][1], colourValues[j+1][i+0][k+0][2],
          colourValues[j+0][i+1][k+0][0], colourValues[j+0][i+1][k+0][1], colourValues[j+0][i+1][k+0][2],
          colourValues[j+1][i+0][k+0][0], colourValues[j+1][i+0][k+0][1], colourValues[j+1][i+0][k+0][2],
          colourValues[j+1][i+0][k+1][0], colourValues[j+1][i+0][k+1][1], colourValues[j+1][i+0][k+1][2],
          colourValues[j+1][i+1][k+0][0], colourValues[j+1][i+1][k+0][1], colourValues[j+1][i+1][k+0][2],
          colourValues[j+1][i+1][k+1][0], colourValues[j+1][i+1][k+1][1], colourValues[j+1][i+1][k+1][2],
          colourValues[j+1][i+0][k+1][0], colourValues[j+1][i+0][k+1][1], colourValues[j+1][i+0][k+1][2],
          colourValues[j+1][i+1][k+0][0], colourValues[j+1][i+1][k+0][1], colourValues[j+1][i+1][k+0][2],
          colourValues[j+1][i+0][k+1][0], colourValues[j+1][i+0][k+1][1], colourValues[j+1][i+0][k+1][2],
          colourValues[j+0][i+0][k+1][0], colourValues[j+0][i+0][k+1][1], colourValues[j+0][i+0][k+1][2],
          colourValues[j+1][i+1][k+1][0], colourValues[j+1][i+1][k+1][1], colourValues[j+1][i+1][k+1][2],
          colourValues[j+0][i+1][k+1][0], colourValues[j+0][i+1][k+1][1], colourValues[j+0][i+1][k+1][2],
          colourValues[j+1][i+1][k+1][0], colourValues[j+1][i+1][k+1][1], colourValues[j+1][i+1][k+1][2],
          colourValues[j+0][i+0][k+1][0], colourValues[j+0][i+0][k+1][1], colourValues[j+0][i+0][k+1][2],
          colourValues[j+0][i+0][k+1][0], colourValues[j+0][i+0][k+1][1], colourValues[j+0][i+0][k+1][2],
          colourValues[j+0][i+0][k+0][0], colourValues[j+0][i+0][k+0][1], colourValues[j+0][i+0][k+0][2],
          colourValues[j+0][i+1][k+1][0], colourValues[j+0][i+1][k+1][1], colourValues[j+0][i+1][k+1][2],
          colourValues[j+0][i+1][k+0][0], colourValues[j+0][i+1][k+0][1], colourValues[j+0][i+1][k+0][2],
          colourValues[j+0][i+1][k+1][0], colourValues[j+0][i+1][k+1][1], colourValues[j+0][i+1][k+1][2],
          colourValues[j+0][i+0][k+0][0], colourValues[j+0][i+0][k+0][1], colourValues[j+0][i+0][k+0][2],
          colourValues[j+0][i+1][k+0][0], colourValues[j+0][i+1][k+0][1], colourValues[j+0][i+1][k+0][2],
          colourValues[j+1][i+1][k+0][0], colourValues[j+1][i+1][k+0][1], colourValues[j+1][i+1][k+0][2],
          colourValues[j+0][i+1][k+1][0], colourValues[j+0][i+1][k+1][1], colourValues[j+0][i+1][k+1][2],
          colourValues[j+1][i+1][k+1][0], colourValues[j+1][i+1][k+1][1], colourValues[j+1][i+1][k+1][2],
          colourValues[j+0][i+1][k+1][0], colourValues[j+0][i+1][k+1][1], colourValues[j+0][i+1][k+1][2],
          colourValues[j+1][i+1][k+0][0], colourValues[j+1][i+1][k+0][1], colourValues[j+1][i+1][k+0][2],
          colourValues[j+0][i+0][k+1][0], colourValues[j+0][i+0][k+1][1], colourValues[j+0][i+0][k+1][2],
          colourValues[j+1][i+0][k+1][0], colourValues[j+1][i+0][k+1][1], colourValues[j+1][i+0][k+1][2],
          colourValues[j+0][i+0][k+0][0], colourValues[j+0][i+0][k+0][1], colourValues[j+0][i+0][k+0][2],
          colourValues[j+1][i+0][k+0][0], colourValues[j+1][i+0][k+0][1], colourValues[j+1][i+0][k+0][2],
          colourValues[j+0][i+0][k+0][0], colourValues[j+0][i+0][k+0][1], colourValues[j+0][i+0][k+0][2],
          colourValues[j+1][i+0][k+1][0], colourValues[j+1][i+0][k+1][1], colourValues[j+1][i+0][k+1][2],
        ];
        // for(let q=0; q<36; q++){
        vertices.push(...coloursToPush);
        // }
      }
    }
  }
  return new Float32Array(vertices);
};

type Vector = {
  x: number;
  y: number;
  z: number;
};



type Positions = {
  xVals: number[][][];
  yVals: number[][][];
  zVals: number[][][];
  colours: number[][][][];
};

const displaceStuff = (
  xVals: number[][][],
  yVals: number[][][],
  zVals: number[][][]
): Positions => {
  // arr.map(subArr2D => subArr2D.map(subArr1D => [...subArr1D]));

  const x1 = xVals.map((subArr2D) => subArr2D.map((subArr1D) => [...subArr1D]));
  const y1 = yVals.map((subArr2D) => subArr2D.map((subArr1D) => [...subArr1D]));
  const z1 = zVals.map((subArr2D) => subArr2D.map((subArr1D) => [...subArr1D]));
  const colours = create4DArray(y1.length, x1[0].length, z1[0][0].length, 3);

  for (let j = 0; j < y1.length; j++) {
    for (let i = 0; i < x1[0].length; i++) {
      for (let k = 0; k < z1[0][0].length; k++) {
        const ds = displacementFunction(x1[j][i][k], y1[j][i][k], z1[j][i][k]);
        x1[j][i][k] += ds.x;
        y1[j][i][k] += ds.y;
        z1[j][i][k] += ds.z;

        // const dispSquared = ds.x**2 + ds.y**2 + ds.z**2
        // const valueToPlot = Math.E**(-COLOUR_STRENGTH*dispSquared)
        // colours[j][i][k][0] = 1-valueToPlot;
        // colours[j][i][k][1] = 0;
        // colours[j][i][k][2] = valueToPlot;
      }
    }
  }

  return { xVals: x1, yVals: y1, zVals: z1, colours: colours };
};

const findColourMapping = (
  xOld: number[][][],
  yOld: number[][][],
  zOld: number[][][],
  xNew: number[][][],
  yNew: number[][][],
  zNew: number[][][]
): number[][][][] => {
  const colours = create4DArray(
    xOld[0].length,
    yOld.length,
    zOld[0][0].length,
    3
  );
  for (let j = 0; j < yOld.length; j++) {
    for (let i = 0; i < xOld[0].length; i++) {
      for (let k = 0; k < zOld[0][0].length; k++) {
        const val =
          COLOUR_SCALE *
          ((zNew[j][i][k] - zOld[j][i][k]) ** 2 +
            (yNew[j][i][k] - yOld[j][i][k]) ** 2 +
            (xNew[j][i][k] - xOld[j][i][k]) ** 2);
        const normVal = Math.E ** (-COLOUR_STRENGTH * val ** 2);
        // colours[j][i][k][0] = Math.max(2 - 2 * normVal, 1);
        colours[j][i][k][0] = 1 - 1 * normVal;
        // colours[j][i][k][1] = Math.min(1 - 2 * normVal, 0);
        colours[j][i][k][1] = 0;
        colours[j][i][k][2] = (normVal);
        // colours[j][i][k][0] = 1;
        // colours[j][i][k][1] = 1;
        // colours[j][i][k][2] = 1;
      }
    }
  }
  return colours;
};

const newPos = displaceStuff(xVals, yVals, zVals);
// const newPos = displaceStuff(rVals, thetaVals, phiVals);
const xNew = newPos.xVals;
const yNew = newPos.yVals;
const zNew = newPos.zVals;
colourVals = newPos.colours;
colourVals = findColourMapping(xVals, yVals, zVals, xNew, yNew, zNew);

const v2 = createVertices(xNew, yNew, zNew);
// const v2 = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])
// console.log(v2);
const c2 = createColourVertices(colourVals);

geometry.setAttribute("position", new THREE.BufferAttribute(v2, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(c2, 3));
// geometry.setIndex(new THREE.BufferAttribute(indices, 1));

const material = new THREE.MeshStandardMaterial({
  vertexColors: true,
  // color: "blue",
  // wireframe: false,
  side: THREE.DoubleSide,
});

const edges = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Black color for the outline
const line = new THREE.LineSegments(edges, lineMaterial);
scene.add(line);

const obj = new THREE.Mesh(geometry, material);

scene.add(obj);

camera.position.z = 10;
camera.position.x = 5;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

scene.add(light);

makeRender();
