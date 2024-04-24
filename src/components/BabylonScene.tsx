import * as BABYLON from "babylonjs";

import { useEffect, useRef } from "react";

const createAxisWithArrow = (
  direction: BABYLON.Vector3,
  color: BABYLON.Color3,
  scene: BABYLON.Scene
) => {
  const axis = BABYLON.MeshBuilder.CreateLines(
    "axis",
    {
      points: [BABYLON.Vector3.Zero(), direction.scale(3)],
      updatable: true,
    },
    scene
  );
  axis.color = color;

  const arrow = BABYLON.MeshBuilder.CreateBox("arrow", { size: 0.1 }, scene);
  arrow.position = direction.scale(3);
  arrow.rotation = direction;
  arrow.scaling = new BABYLON.Vector3(0.5, 0.5, 1);
  const material = new BABYLON.StandardMaterial("arrowMaterial", scene);
  material.emissiveColor = color;
  arrow.material = material;
};

const createAxes = (scene: BABYLON.Scene) => {
  createAxisWithArrow(BABYLON.Axis.X, BABYLON.Color3.Red(), scene);
  createAxisWithArrow(BABYLON.Axis.Y, BABYLON.Color3.Green(), scene);
  createAxisWithArrow(BABYLON.Axis.Z, BABYLON.Color3.Blue(), scene);
};

export function BabylonScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new BABYLON.Engine(canvasRef.current, true);
      const scene = new BABYLON.Scene(engine);
      scene.debugLayer.show();
      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2,
        2,
        BABYLON.Vector3.Zero(),
        scene
      );
      camera.setTarget(BABYLON.Vector3.Zero());
      camera.attachControl(canvasRef.current, true);

      createAxes(scene);

      const box = BABYLON.MeshBuilder.CreateBox("box", {}, scene);
      const material = new BABYLON.StandardMaterial("texture", scene);

      const texture = new BABYLON.Texture(
        "./textures/Wood/Wood Floor Dark/T_WoodFloorDark_D.png",
        scene
      );
      // texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
      // texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
      material.emissiveTexture = texture;
      box.material = material;

      const positions = box.getVerticesData(BABYLON.VertexBuffer.PositionKind)!;
      const uvs = box.getVerticesData(BABYLON.VertexBuffer.UVKind)!;

      uvs.forEach((uv, index) => {
        if (uv >= 1) {
          uvs[index] = uv * 1;
        }
      });
      console.log({ positions, uvs });

      for (let i = 0; i < 24; i++) {
        const pos = {
          x: positions[i * 3],
          y: positions[i * 3 + 1],
          z: positions[i * 3 + 2],
        };
        const uv = { u: uvs[i * 2], v: uvs[i * 2 + 1] };
        console.log(
          `Vertex ${i}: ${JSON.stringify(pos)} - UV: ${JSON.stringify(uv)}`
        );
      }

      box.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);

      engine.runRenderLoop(() => {
        scene.render();
      });

      // const initialBoxSize = box.scaling.clone();
      // box.scaling = new BABYLON.Vector3(2, 2, 2);
      // // Calculate the initial size of the box

      // // Update texture UVs when scaling the box
      // scene.onBeforeRenderObservable.add(() => {
      //   const scaleFactor = box.scaling.divide(initialBoxSize);
      //   console.log(scaleFactor);
      //   if (!texture) return;
      //   texture.uScale = scaleFactor.x;
      //   texture.vScale = scaleFactor.y;
      //   material.emissiveTexture = texture;
      // });

      return () => {
        engine.dispose();
      };
    }
  }, []);

  return <canvas ref={canvasRef} />;
}
