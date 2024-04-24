import * as BABYLON from "babylonjs";

import { useEffect, useRef } from "react";
import { calculateMeshUVs } from "../functions";

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
  const previousScaling = useRef<BABYLON.Vector3>(BABYLON.Vector3.Zero());

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
      material.emissiveTexture = texture;
      box.material = material;

      box.onBeforeRenderObservable.add((mesh) => {
        if (!mesh.scaling.equalsWithEpsilon(previousScaling.current, 0.0001)) {
          calculateMeshUVs(mesh);
          previousScaling.current = mesh.scaling.clone();
        }
      });

      engine.runRenderLoop(() => {
        scene.render();
      });

      return () => {
        engine.dispose();
      };
    }
  }, []);

  return <canvas ref={canvasRef} />;
}
