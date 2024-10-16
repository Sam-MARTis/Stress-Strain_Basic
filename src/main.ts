import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const makeRender = (t = 0) => {
  // obj.rotation.y = 0.001*t
  console.log(t);

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

const maxx = 5;
const maxy = 5;
const maxz = 5;
const step = 0.1;

const countX = Math.floor(maxx / step);
const countY = Math.floor(maxx / step);
const countZ = Math.floor(maxx / step);
const size = 0.1;

const light = new THREE.AmbientLight("#ffffff", 1);

const geometry = new THREE.BufferGeometry();

const vertices = new Float32Array([
  -1, -1, 0, 3, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
]);
const colours = new Float32Array([
  0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
]);

let xVals: number[][][] = [];
let yVals: number[][][] = [];
let zVals: number[][][] = [];
const colourVals: number[][][][] = [];

const create3DArray = (
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

xVals = create3DArray(countX, countY, countZ, 1);
yVals = create3DArray(countX, countY, countZ, 2);
zVals = create3DArray(countX, countY, countZ, 3);

// for (let j = 0; j < countX; j++) {
//   xVals.push([]);
//   yVals.push([]);
//   colourVals.push([]);

//   for (let i = 0; i < countY; i++) {
//     yVals[j].push(j*step);
//     xVals[j].push(i*step);
//     colourVals[j].push([1, 0, i / countX]);
//   }
// }
console.log("xvals: ", xVals.length, xVals[0].length);
console.log("yVals: ", yVals.length, yVals[0].length);

// const createVertices = (xArr: number[][][], yArr: number[][][] ) => {
//   const vertices = [];
//   for (let j = 0; j < yArr.length - 1; j++) {
//     for (let i = 0; i < xArr[0].length - 1; i++) {
//       vertices.push(xArr[j][i][0], yArr[j][i][0], 0);
//       vertices.push(xArr[j][i + 1][0], yArr[j][i + 1][0], 0);
//       vertices.push(xArr[j + 1][i][0], yArr[j + 1][i][0], 0); //Triangle 1

//       vertices.push(xArr[j + 1][i + 1][0], yArr[j + 1][i + 1][0], 0);
//       vertices.push(xArr[j + 1][i][0], yArr[j + 1][i][0], 0);
//       vertices.push(xArr[j][i + 1][0], yArr[j][i + 1][0], 0); // T2
//       // Just 10 more to go ...*dies*

//     }
//   }
//   return new Float32Array(vertices);
// };

const createVertices = (
  xArr: number[][][],
  yArr: number[][][],
  zArr: number[][][]
) => {
  const vertices = [];

  for (let j = 0; j < yArr.length - 1; j++) {
    for (let i = 0; i < xArr[0].length - 1; i++) {
      for (let k = 0; k < zArr[0][0].length - 1; k++) {
        // Coordinates of the cube corners

        // cyxz
        const c000 = [xArr[j][i][k], xArr[j][i][k], xArr[j][i][k]];
        const c001 = [xArr[j][i][k + 1], xArr[j][i][k + 1], xArr[j][i][k + 1]];
        const c010 = [xArr[j][i + 1][k], xArr[j][i + 1][k], xArr[j][i + 1][k]];
        const c011 = [
          xArr[j][i + 1][k + 1],
          xArr[j][i + 1][k + 1],
          xArr[j][i + 1][k + 1],
        ];
        const c100 = [xArr[j + 1][i][k], xArr[j + 1][i][k], xArr[j + 1][i][k]];
        const c101 = [
          xArr[j + 1][i][k + 1],
          xArr[j + 1][i][k + 1],
          xArr[j + 1][i][k + 1],
        ];
        const c110 = [
          xArr[j + 1][i + 1][k],
          xArr[j + 1][i + 1][k],
          xArr[j + 1][i + 1][k],
        ];
        const c111 = [
          xArr[j + 1][i + 1][k + 1],
          xArr[j + 1][i + 1][k + 1],
          xArr[j + 1][i + 1][k + 1],
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

const createColourVertices = (colourVals: number[][][]) => {
  const vertices = [];
  for (let j = 0; j < colourVals.length; j++) {
    for (let i = 0; i < colourVals[0].length; i++) {
      for (let k = 0; k < 36; k++) {
        vertices.push(
          colourVals[i][j][0],
          colourVals[i][j][1],
          colourVals[i][j][2]
        );
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

const displacementFunction = (x: number, y: number, z: number): Vector => {
  const multiplier = 1;
  const dx = (y * y) / 4;
  const dy = -z / 10;
  const dz = 0;
  return { x: dx * multiplier, y: dy * multiplier, z: dz * multiplier };
};

type Positions = {
  xVals: number[][][];
  yVals: number[][][];
  zVals: number[][][];
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

  for (let j = 0; j < y1.length; j++) {
    for (let i = 0; i < x1[0].length; i++) {
      for (let k = 0; k < z1[0][0].length; k++) {
        const ds = displacementFunction(x1[j][i][k], y1[j][i][k], z1[j][i][k]);
        x1[j][i][k] += ds.x;
        y1[j][i][k] += ds.y;
        z1[j][i][k] += ds.z;
      }
    }
  }

  return { xVals: x1, yVals: y1, zVals: z1 };
};

const newPos = displaceStuff(xVals, yVals);
const xNew = newPos.xVals;
const yNew = newPos.yVals;

const v2 = createVertices(xNew, yNew);
// const v2 = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])
console.log(v2);
const c2 = createColourVertices(colourVals);

geometry.setAttribute("position", new THREE.BufferAttribute(v2, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(c2, 3));
// geometry.setIndex(new THREE.BufferAttribute(indices, 1));

const material = new THREE.MeshStandardMaterial({
  vertexColors: true,
  // color: "white",
  wireframe: false,
  side: THREE.DoubleSide,
});

const obj = new THREE.Mesh(geometry, material);

scene.add(obj);

camera.position.z = 2;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

scene.add(light);

makeRender();
