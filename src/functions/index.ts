import * as BABYLON from "babylonjs";

const textureUScale = 1;
const textureVScale = 1;

export const calculateMeshUVs = (mesh: BABYLON.Mesh) => {
  const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  const uvs = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
  const normals = mesh.getFacetLocalNormals();

  const faceNormalsForCube = normals.filter((_, i) => i % 2 === 0);

  if (!positions || !uvs || !normals) return;

  for (let face = 0; face < 6; face++) {
    const faceVertices: BABYLON.Vector3[] = [];
    let minA = Number.POSITIVE_INFINITY;
    let minB = Number.POSITIVE_INFINITY;
    let maxA = Number.NEGATIVE_INFINITY;
    let maxB = Number.NEGATIVE_INFINITY;
    const faceNormal = faceNormalsForCube[face];

    const isXFace = Math.abs(faceNormal.x) === 1;
    const isYFace = Math.abs(faceNormal.y) === 1;
    const isZFace = Math.abs(faceNormal.z) === 1;

    for (let vertexIdx = 0; vertexIdx < 4; vertexIdx++) {
      const vertex = BABYLON.Vector3.FromArray(
        positions,
        (face * 4 + vertexIdx) * 3
      );
      faceVertices.push(vertex);
      // faceNormal.x === 1 -> y, z
      let a = vertex.y;
      let b = vertex.z;
      if (isYFace) {
        a = vertex.x;
        b = vertex.z;
      } else if (isZFace) {
        a = vertex.x;
        b = vertex.y;
      }

      minA = Math.min(minA, a);
      minB = Math.min(minB, b);
      maxA = Math.max(maxA, a);
      maxB = Math.max(maxB, b);
    }
    let sizeA = maxA - minA;
    let sizeB = maxB - minB;

    if (isXFace) {
      sizeA = sizeA * mesh.scaling.y;
      sizeB = sizeB * mesh.scaling.z;
    } else if (isYFace) {
      sizeA = sizeA * mesh.scaling.x;
      sizeB = sizeB * mesh.scaling.z;
    } else if (isZFace) {
      sizeA = sizeA * mesh.scaling.x;
      sizeB = sizeB * mesh.scaling.y;
    }

    const uFaceSize = isYFace ? sizeB : sizeA;
    const vFaceSize = isYFace ? sizeA : sizeB;

    const uDiff = (textureUScale - uFaceSize) / 2;
    const vDiff = (textureVScale - vFaceSize) / 2;

    console.log(`\n\nFace: ${face}`);
    faceVertices.forEach((_, vertexIdx) => {
      const uIdx = (face * 4 + vertexIdx) * 2;
      const vIdx = uIdx + 1;
      let u = uvs[uIdx];
      let v = uvs[vIdx];

      switch (vertexIdx) {
        case 0:
          u = uDiff;
          v = vDiff;
          break;
        case 1:
          u = textureUScale - uDiff;
          v = vDiff;
          break;
        case 2:
          u = textureUScale - uDiff;
          v = textureVScale - vDiff;
          break;
        case 3:
          u = uDiff;
          v = textureVScale - vDiff;
          break;
      }

      uvs[uIdx] = u / textureUScale;
      uvs[vIdx] = v / textureVScale;
      console.log(
        `Vertex: ${vertexIdx}; u: ${uvs[uIdx]}; v: ${uvs[vIdx]}; sizeA: ${sizeA}; sizeB: ${sizeB}`
      );
    });
  }
  mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
};
