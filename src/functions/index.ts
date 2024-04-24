import * as BABYLON from "babylonjs";

export const calculateMeshUVs = (mesh: BABYLON.Mesh) => {
  const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)!;
  const uvs = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind)!;
  const normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind)!;

  for (let i = 0; i < uvs.length / 2; i++) {
    let u = -0.5;
    let v = -0.5;
    if (i % 4 === 1) {
      u = 1.5;
      v = -0.5;
    } else if (i % 4 === 2) {
      u = 1.5;
      v = 1.5;
    } else if (i % 4 === 3) {
      u = -0.5;
      v = 1.5;
    }
    uvs[i * 2] = u;
    uvs[i * 2 + 1] = v;
  }

  for (let face = 0; face < 6; face++) {
    let msg = `Face ${face}: \n`;
    for (let vertex = 0; vertex < 4; vertex++) {
      const pos = {
        x: positions[(face * 4 + vertex) * 3],
        y: positions[(face * 4 + vertex) * 3 + 1],
        z: positions[(face * 4 + vertex) * 3 + 2],
      };
      const normal = {
        x: normals[(face * 4 + vertex) * 3],
        y: normals[(face * 4 + vertex) * 3 + 1],
        z: normals[(face * 4 + vertex) * 3 + 2],
      };
      const uv = {
        u: uvs[(face * 4 + vertex) * 2],
        v: uvs[(face * 4 + vertex) * 2 + 1],
      };
      msg += `\tVertex ${vertex}: \n\t\tPOS: ${JSON.stringify(
        pos
      )}\n\t\tNRML: ${JSON.stringify(normal)}\n\t\tUV: ${JSON.stringify(uv)}\n`;
    }
    console.log(msg);
  }
  mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
};
