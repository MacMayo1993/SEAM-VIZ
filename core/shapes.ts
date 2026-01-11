
import { Mesh, Vec3 } from "./types";

export type ShapeId = "circle" | "disk" | "triangle" | "square" | "sphere" | "cube" | "pyramid" | "torus";

export function makeShapeMesh(shape: ShapeId, detail = 40): Mesh {
  switch (shape) {
    case "circle": return makeCircle(detail);
    case "disk": return makeDisk(detail);
    case "triangle": return makeTriangle(detail);
    case "square": return makeSquare();
    case "sphere": return makeSphere(detail);
    case "cube": return makeCube();
    case "pyramid": return makePyramid();
    case "torus": return makeTorus(detail);
    default: throw new Error(`Unknown shape: ${shape}`);
  }
}

function makeSphere(detail: number): Mesh {
  const vertices: Vec3[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= detail; i++) {
    const theta = Math.PI * i / detail;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    for (let j = 0; j <= detail; j++) {
      const phi = 2 * Math.PI * j / detail;
      vertices.push([sinTheta * Math.cos(phi), sinTheta * Math.sin(phi), cosTheta]);
    }
  }
  for (let i = 0; i < detail; i++) {
    for (let j = 0; j < detail; j++) {
      const a = (i * (detail + 1)) + j;
      const b = a + (detail + 1);
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }
  return { vertices, indices };
}

function makeDisk(detail: number): Mesh {
  const vertices: Vec3[] = [[0, 0, 0]]; // Origin reference
  const indices: number[] = [];
  const zHalf = 0.005; // Ultra-thin planar

  for (let s = -1; s <= 1; s += 2) {
    const start = vertices.length;
    vertices.push([0, 0, s * zHalf]); // Center for this side
    for (let i = 0; i <= detail; i++) {
      const theta = (2 * Math.PI * i) / detail;
      vertices.push([Math.cos(theta), Math.sin(theta), s * zHalf]);
    }
    for (let i = 0; i < detail; i++) {
      const a = start;
      const b = start + 1 + i;
      const c = start + 1 + (i + 1);
      if (s === 1) indices.push(a, b, c);
      else indices.push(a, c, b);
    }
  }
  // Connection rim
  for (let i = 0; i < detail; i++) {
    const t1 = 2 + i;
    const t2 = 2 + (i + 1);
    const b1 = (detail + 3) + 1 + i;
    const b2 = (detail + 3) + 1 + (i + 1);
    indices.push(t1, b1, b2, t1, b2, t2);
  }
  return { vertices, indices };
}

function makeCircle(detail: number): Mesh {
  const vertices: Vec3[] = [];
  const indices: number[] = [];
  const r = 1.0;
  const width = 0.08;
  const zHalf = 0.005;

  for (let s = -1; s <= 1; s += 2) {
    const start = vertices.length;
    for (let i = 0; i <= detail; i++) {
      const theta = (2 * Math.PI * i) / detail;
      const x1 = (r - width / 2) * Math.cos(theta);
      const y1 = (r - width / 2) * Math.sin(theta);
      const x2 = (r + width / 2) * Math.cos(theta);
      const y2 = (r + width / 2) * Math.sin(theta);
      vertices.push([x1, y1, s * zHalf], [x2, y2, s * zHalf]);
    }
    for (let i = 0; i < detail; i++) {
      const a = start + i * 2;
      const b = start + i * 2 + 1;
      const c = start + (i + 1) * 2;
      const d = start + (i + 1) * 2 + 1;
      if (s === 1) indices.push(a, b, d, a, d, c);
      else indices.push(a, d, b, a, c, d);
    }
  }
  // Rim connections
  const offset = (detail + 1) * 2;
  for (let i = 0; i < detail; i++) {
    const tInnerA = i * 2;
    const tInnerB = (i + 1) * 2;
    const tOuterA = i * 2 + 1;
    const tOuterB = (i + 1) * 2 + 1;
    const bInnerA = offset + tInnerA;
    const bInnerB = offset + tInnerB;
    const bOuterA = offset + tOuterA;
    const bOuterB = offset + tOuterB;

    indices.push(tInnerA, bInnerA, bInnerB, tInnerA, bInnerB, tInnerB);
    indices.push(tOuterA, bOuterB, bOuterA, tOuterA, tOuterB, bOuterB);
  }
  return { vertices, indices };
}

function makeTorus(detail: number): Mesh {
  const vertices: Vec3[] = [];
  const indices: number[] = [];
  const R = 1.0;
  const r = 0.4;
  const rDetail = 24;

  for (let i = 0; i <= detail; i++) {
    const theta = (2 * Math.PI * i) / detail;
    for (let j = 0; j <= rDetail; j++) {
      const phi = (2 * Math.PI * j) / rDetail;
      const x = (R + r * Math.cos(phi)) * Math.cos(theta);
      const y = (R + r * Math.cos(phi)) * Math.sin(theta);
      const z = r * Math.sin(phi);
      vertices.push([x, y, z]);
    }
  }
  for (let i = 0; i < detail; i++) {
    for (let j = 0; j < rDetail; j++) {
      const a = i * (rDetail + 1) + j;
      const b = (i + 1) * (rDetail + 1) + j;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { vertices, indices };
}

function makeTriangle(detail: number): Mesh {
  const vertices: Vec3[] = [];
  const indices: number[] = [];
  const zHalf = 0.005;
  const side = 1.8;
  const h = (Math.sqrt(3) / 2) * side;
  const p1: Vec3 = [0, h * (2 / 3), 0];
  const p2: Vec3 = [-side / 2, -h / 3, 0];
  const p3: Vec3 = [side / 2, -h / 3, 0];

  const getB = (i: number, j: number, k: number, det: number): Vec3 => [
    (i / det) * p1[0] + (j / det) * p2[0] + (k / det) * p3[0],
    (i / det) * p1[1] + (j / det) * p2[1] + (k / det) * p3[1],
    (i / det) * p1[2] + (j / det) * p2[2] + (k / det) * p3[2]
  ];

  for (let s = -1; s <= 1; s += 2) {
    const start = vertices.length;
    for (let i = 0; i <= detail; i++) {
      for (let j = 0; j <= detail - i; j++) {
        const k = detail - i - j;
        const b = getB(i, j, k, detail);
        vertices.push([b[0], b[1], s * zHalf]);
      }
    }
    let rowStart = start;
    for (let i = 0; i < detail; i++) {
      let nextRowStart = rowStart + (detail - i + 1);
      for (let j = 0; j < detail - i; j++) {
        const a = rowStart + j;
        const b = rowStart + j + 1;
        const c = nextRowStart + j;
        const d = nextRowStart + j + 1;
        if (s === 1) {
          indices.push(a, b, c);
          if (j < detail - i - 1) indices.push(b, d, c);
        } else {
          indices.push(a, c, b);
          if (j < detail - i - 1) indices.push(b, c, d);
        }
      }
      rowStart = nextRowStart;
    }
  }
  return { vertices, indices };
}

function makeSquare(): Mesh {
  const vertices: Vec3[] = [];
  const indices: number[] = [];
  const s = 0.9;
  const z = 0.005;

  for (let side = -1; side <= 1; side += 2) {
    const start = vertices.length;
    vertices.push([-s, -s, side * z], [s, -s, side * z], [s, s, side * z], [-s, s, side * z]);
    if (side === 1) indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
    else indices.push(start, start + 2, start + 1, start, start + 3, start + 2);
  }
  for (let i = 0; i < 4; i++) {
    const a = i, b = (i + 1) % 4, c = i + 4, d = ((i + 1) % 4) + 4;
    indices.push(a, c, d, a, d, b);
  }
  return { vertices, indices };
}

function makeCube(): Mesh {
  const vertices: Vec3[] = [];
  const indices: number[] = [];
  const s = 0.8;
  const coords = [[-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],[-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]];
  coords.forEach(c => vertices.push(c as Vec3));
  const faces = [[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
  faces.forEach((f, i) => {
    if (i % 2 === 0) indices.push(f[0], f[1], f[2], f[0], f[2], f[3]);
    else indices.push(f[0], f[2], f[1], f[0], f[3], f[2]);
  });
  return { vertices, indices };
}

function makePyramid(): Mesh {
  const vertices: Vec3[] = [
    [0, 0, 1.2], [1, 1, -0.6], [1, -1, -0.6], [-1, -1, -0.6], [-1, 1, -0.6]
  ];
  const indices: number[] = [
    0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1,
    1, 3, 2, 1, 4, 3
  ];
  return { vertices, indices };
}
