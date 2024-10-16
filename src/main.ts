import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const makeRender = (t = 0) => {
  // obj.rotation.y = 0.001*t
  console.log(t)


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

const countX = Math.floor(maxx/step)
const countY = Math.floor(maxx/step)
const countZ = Math.floor(maxx/step)
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
let zVals: number[][][] = []
const colourVals: number[][][][] = [];





const create3DArray = (a: number, b: number, c: number, axis: number): number[][][] => {
  //Order of acces is y x z
  const array: number[][][] = []
  for(let j=0; j<b; j++){
    array.push([])
    for(let i=0; i<a; i++){
      array[j].push([])
      for(let k = 0; k<c; k++){
        array[j][i].push(0)
      }
    }
  }
  const isX:number = +(axis==1) //Typescript be freaky. Add + and boolean gets converted to number
  const isY:number = +(axis==2)
  const isZ:number = +(axis==3)

    for(let j=0; j<b; j++){
      for(let k = 0; k<c; k++){
        for(let i=0; i<a; i++){
          array[j][i][k] = (i*isX + j*isY + k*isZ)*step
        }
      }
    }
  

  return array;
};

xVals = create3DArray(countX, countY, countZ, 1)
yVals = create3DArray(countX, countY, countZ, 2)
zVals = create3DArray(countX, countY, countZ, 3)



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

const createVertices = (xArr: number[][], yArr: number[][]) => {
  const vertices = [];
  for (let j = 0; j < yArr.length - 1; j++) {
    for (let i = 0; i < xArr[0].length - 1; i++) {
      vertices.push(xArr[j][i], yArr[j][i], 0);
      vertices.push(xArr[j][i + 1], yArr[j][i + 1], 0);
      vertices.push(xArr[j + 1][i], yArr[j + 1][i], 0);
      vertices.push(xArr[j + 1][i + 1], yArr[j + 1][i + 1], 0);
      vertices.push(xArr[j + 1][i], yArr[j + 1][i], 0);
      vertices.push(xArr[j][i + 1], yArr[j][i + 1], 0);
    }
  }
  return new Float32Array(vertices);
};
const createColourVertices = (colourVals: number[][][]) => {
  const vertices = [];
  for (let j = 0; j < colourVals.length; j++) {
    for (let i = 0; i < colourVals[0].length; i++) {
      for (let k = 0; k < 6; k++) {
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

const displacementFunction = (x: number, y:number, z: number): Vector => {
  const multiplier = 1
  const dx = y*y/4;
  const dy = 0
  const dz = 0
  return {x: dx*multiplier, y: dy*multiplier, z: dz*multiplier}

};

type Positions = {
  xVals: number[][];
  yVals: number[][];
};

const displaceStuff = (xVals: number[][], yVals: number[][]): Positions => {
  const x1 = xVals.map((innerArray) => [...innerArray]);
  const y1 = yVals.map((innerArray) => [...innerArray]);
  for(let j=0; j<y1.length; j++){
    for(let i = 0; i< x1[0].length; i++){
      const ds = displacementFunction(x1[j][i], y1[j][i], 0)
      x1[j][i] += ds.x
      y1[j][i] += ds.y
    }
  }

  return {xVals: x1, yVals: y1 };
};

const newPos = displaceStuff(xVals, yVals)
const xNew = newPos.xVals
const yNew = newPos.yVals

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
  side: THREE.DoubleSide
});

const obj = new THREE.Mesh(geometry, material);

scene.add(obj);

camera.position.z = 2;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

scene.add(light);

makeRender();
