import * as BABYLON from "babylonjs";
import earcut from "earcut";

import { useEffect, useRef } from "react";
import { getFaceUVFromShape } from "../functions";

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
  // const boxPrevScale = useRef<BABYLON.Vector3>(BABYLON.Vector3.Zero());
  // const planePrevScale = useRef<BABYLON.Vector3>(BABYLON.Vector3.Zero());

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new BABYLON.Engine(canvasRef.current, true);
      const scene = new BABYLON.Scene(engine);
      scene.debugLayer.show();
      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2,
        5,
        BABYLON.Vector3.Zero(),
        scene
      );
      camera.setTarget(BABYLON.Vector3.Zero());
      camera.attachControl(canvasRef.current, true);
      camera.position = new BABYLON.Vector3(0, 5, 5);

      createAxes(scene);

      const shape = [
        BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(1, 0, 0),
        new BABYLON.Vector3(1, 0, 1),
        new BABYLON.Vector3(0.5, 0, 1),
        new BABYLON.Vector3(0.5, 0, 1.5),
        new BABYLON.Vector3(0, 0, 1.5),
      ].map((v) => v.scale(2));

      const faceUv = getFaceUVFromShape(shape);

      const extruded = BABYLON.MeshBuilder.ExtrudePolygon(
        "extruded",
        { shape, depth: 2, faceUV: faceUv },
        scene,
        earcut
      );

      const texture = new BABYLON.Texture(
        // "./textures/Wood/Wood Floor Dark/T_WoodFloorDark_D.png"
        // "./textures/Wood/Wood Floor Dark/T_WoodFloorDark_D_Half.png"
        "./textures/colors.png"
      );

      const material = new BABYLON.StandardMaterial("texture", scene);
      material.emissiveTexture = texture;
      extruded.material = material;

      // turnTexture(extruded, "90");

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

// const createBoxAndPlane = () => {
//   const box = BABYLON.MeshBuilder.CreateBox(
//     "box",
//     {
//       size: 1,
//     },
//     scene
//   );

//   const plane = BABYLON.MeshBuilder.CreatePlane(
//     "plane",
//     {
//       size: 5,
//     },
//     scene
//   );

//   const material = new BABYLON.StandardMaterial("texture", scene);

//   const texture = new BABYLON.Texture(
//     // "./textures/Wood/Wood Floor Dark/T_WoodFloorDark_D.png",
//     // "./textures/Wood/Wood Floor Dark/T_WoodFloorDark_D_Half.png",
//     "./textures/colors.png"
//   );
//   material.emissiveTexture = texture;
//   box.material = material;

//   // box.onBeforeRenderObservable.add((mesh) => {
//   //   if (!mesh.scaling.equalsWithEpsilon(boxPrevScale.current)) {
//   //     calculateMeshUVs(mesh);
//   //     boxPrevScale.current = mesh.scaling.clone();
//   //   }
//   // });

//   plane.material = material.clone("planeMaterial");
//   plane.position = new BABYLON.Vector3(0, -2, 0);
//   plane.rotation = BABYLON.Vector3.Right().scale(Math.PI / 2);

//   // plane.onBeforeRenderObservable.add((mesh) => {
//   //   if (!mesh.scaling.equalsWithEpsilon(planePrevScale.current)) {
//   //     calculateMeshUVs(mesh, true);
//   //     planePrevScale.current = mesh.scaling.clone();
//   //   }
//   // });
// };
