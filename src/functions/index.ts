import * as BABYLON from "babylonjs";

export const calculateMeshUVs = (
  mesh: BABYLON.Mesh,
  textureUScale = 1,
  textureVScale = 1
) => {
  const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  const uvs = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
  const normals = mesh.getFacetLocalNormals();

  const faceNormalsForCube = normals.filter((_, i) => i % 2 === 0);

  if (!positions || !uvs || !normals) return;

  for (let face = 0; face < 6; face++) {
    const faceNormal = faceNormalsForCube[face];

    if (!faceNormal) break;
    const faceVertices: BABYLON.Vector3[] = [];

    const min = new BABYLON.Vector3(
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY
    );
    const max = new BABYLON.Vector3(
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY
    );

    for (let vertexIdx = 0; vertexIdx < 4; vertexIdx++) {
      const vertex = BABYLON.Vector3.FromArray(
        positions,
        (face * 4 + vertexIdx) * 3
      );
      faceVertices.push(vertex);
      min.x = Math.min(min.x, vertex.x);
      min.y = Math.min(min.y, vertex.y);
      min.z = Math.min(min.z, vertex.z);
      max.x = Math.max(max.x, vertex.x);
      max.y = Math.max(max.y, vertex.y);
      max.z = Math.max(max.z, vertex.z);
    }

    const isXFace = Math.abs(faceNormal.x) === 1;
    const isYFace = Math.abs(faceNormal.y) === 1;
    const isZFace = Math.abs(faceNormal.z) === 1;

    let width = 0;
    let height = 0;

    if (isXFace) {
      width = max.z - min.z;
      width = width * mesh.scaling.z;
      height = max.y - min.y;
      height = height * mesh.scaling.y;
    } else if (isYFace) {
      width = max.x - min.x;
      width = width * mesh.scaling.x;
      height = max.z - min.z;
      height = height * mesh.scaling.z;
    } else if (isZFace) {
      width = max.x - min.x;
      width = width * mesh.scaling.x;
      height = max.y - min.y;
      height = height * mesh.scaling.y;
    }

    const uDiff = (textureUScale - width) / 2;
    const vDiff = (textureVScale - height) / 2;

    const uvsPerFace = {
      lowerLeft: {
        u: uDiff,
        v: vDiff,
      },
      lowerRight: {
        u: textureUScale - uDiff,
        v: vDiff,
      },
      upperRight: {
        u: textureUScale - uDiff,
        v: textureVScale - vDiff,
      },
      upperLeft: {
        u: uDiff,
        v: textureVScale - vDiff,
      },
    };

    faceVertices.forEach((vertex, vertexIdx) => {
      const uIdx = (face * 4 + vertexIdx) * 2;
      const vIdx = uIdx + 1;

      let lower = false;
      let left = false;

      if (isXFace) {
        lower = vertex.y === min.y;
        left = faceNormal.x < 0 ? vertex.z === max.z : vertex.z === min.z;
      } else if (isYFace) {
        lower = faceNormal.y < 0 ? vertex.z === min.z : vertex.z === max.z;
        left = vertex.x === max.x;
      } else if (isZFace) {
        lower = vertex.y === min.y;
        left = faceNormal.z < 0 ? vertex.x === min.x : vertex.x === max.x;
      }

      const vertexLocation = lower
        ? left
          ? "lowerLeft"
          : "lowerRight"
        : left
        ? "upperLeft"
        : "upperRight";
      const { u, v } = uvsPerFace[vertexLocation];

      uvs[uIdx] = u / textureUScale;
      uvs[vIdx] = v / textureVScale;
    });
  }
  mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
};

export const getFaceUVFromShape = (
  shape: BABYLON.Vector3[],
  // rotation = 0,
  textureUScale = 1,
  textureVScale = 1
): BABYLON.Vector4[] => {
  const min = new BABYLON.Vector3(
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY
  );
  const max = new BABYLON.Vector3(
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY
  );

  shape.forEach((vertex) => {
    min.x = Math.min(min.x, vertex.x);
    min.y = Math.min(min.y, vertex.y);
    min.z = Math.min(min.z, vertex.z);
    max.x = Math.max(max.x, vertex.x);
    max.y = Math.max(max.y, vertex.y);
    max.z = Math.max(max.z, vertex.z);
  });

  //* Shape is defined in the XY plane
  const width = max.x - min.x;
  const depth = max.z - min.z;

  const uDiff = (textureUScale - width) / 2;
  const vDiff = (textureVScale - depth) / 2;

  const uBottomLeft = uDiff / textureUScale;
  const vBottomLeft = vDiff / textureVScale;
  const uToprRight = (textureUScale - uDiff) / textureUScale;
  const vTopRight = (textureVScale - vDiff) / textureVScale;

  const top = new BABYLON.Vector4(
    uBottomLeft,
    vBottomLeft,
    uToprRight,
    vTopRight
  ); // top

  const faceUV = [
    top,
    new BABYLON.Vector4(0, 0, 0, 0), // sides,
    top.clone(),
  ];

  return faceUV;
};

export const turnTexture = (
  mesh: BABYLON.Mesh,
  rotation?: "0" | "90" | "180" | "270"
) => {
  if (!rotation || rotation === "0") return;
  const normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
  const uvs = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);

  if (!uvs || !normals) return;
  const numVertices = normals.length / 3;

  const topUvs: { value: BABYLON.Vector2; idx: number }[] = [];
  const bottomUvs: { value: BABYLON.Vector2; idx: number }[] = [];

  for (let i = 0; i < numVertices; i++) {
    const vertexNormal = BABYLON.Vector3.FromArray(normals, i * 3);
    const vertexUV = BABYLON.Vector2.FromArray(uvs, i * 2);

    if (vertexNormal.y === 1) {
      topUvs.push({ value: vertexUV, idx: i });
    } else if (vertexNormal.y === -1) {
      bottomUvs.push({ value: vertexUV, idx: i });
    }
  }

  topUvs.forEach(({ value, idx }) => {
    let u = value.x;
    let v = value.y;

    if (rotation === "90") {
      u = 1 - value.y;
      v = value.x;
    } else if (rotation === "180") {
      u = 1 - value.x;
      v = 1 - value.y;
    } else if (rotation === "270") {
      u = value.y;
      v = 1 - value.x;
    }

    uvs[idx * 2] = u;
    uvs[idx * 2 + 1] = v;
  });
  // bottomUvs.forEach(({ value, idx }) => {
  //   let u = value.x;
  //   let v = value.y;

  //   if (rotation === "90") {
  //     u = 1 - value.y;
  //     v = value.x;
  //   } else if (rotation === "180") {
  //     u = 1 - value.x;
  //     v = 1 - value.y;
  //   } else if (rotation === "270") {
  //     u = value.y;
  //     v = 1 - value.x;
  //   }

  //   uvs[idx * 2] = u;
  //   uvs[idx * 2 + 1] = v;
  // });

  mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
};
