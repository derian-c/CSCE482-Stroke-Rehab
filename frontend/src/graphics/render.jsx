import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const PatientModel = () => {
  const containerReference = useRef(null);

  useEffect(() => {
    //Create a New Scene to render
    const scene = new THREE.Scene();

    //Create Camera to establish pov
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(4, 5, 11);

    //Create Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); //Sets background color for each frame
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; //Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; //Use specific shadow map

    //Adds basic controls to move the scene around
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; //Adds a sliding effect to the camera feels smoother
    controls.enablePan = false; //disables ability to move camera without rotating

    //Zoom distance
    controls.minDistance = 5;
    controls.maxDistance = 20;
    //Max and min camera angles
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2;
    //Sets point of rotation
    controls.target = new THREE.Vector3(0, 1, 0);
    controls.update();

    //Dynamically set container width and height
    if (containerReference.current) {
      const width = containerReference.current.clientWidth;
      const height = containerReference.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      containerReference.current.appendChild(renderer.domElement);
    }

    //Create Ground
    const ground = new THREE.PlaneGeometry(20, 20, 32, 32);
    ground.rotateX(-Math.PI / 2); //Planes default to vertical so we need to rotate it so its horizontally flat
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      side: THREE.DoubleSide,
    });
    const groundMesh = new THREE.Mesh(ground, groundMaterial);
    groundMesh.castShadow = false;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    //Create Basic Light
    const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, Math.PI / 8, 1);
    spotLight.position.set(0, 25, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);

    //Load model (Note: Models must be in public folder)
    const loader = new GLTFLoader().setPath("/Models");
    loader.load(
      "/RemyV2/RemyV2.gltf",
      (gltf) => {
        console.log("loading model");
        const mesh = gltf.scene;

        //Some models are broken into multiple meshes
        //This casts the shadow for each mesh part
        mesh.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        //Translates entire models initial position
        mesh.position.set(0, 0, -1);
        scene.add(mesh);
      },
      (error) => {
        console.error(error);
      }
    );

    //When window is resized adjust camera and render size
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    //Actually render the scene
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  }, []);
  return <div ref={containerReference} className="w-full h-full"></div>;
};

export default PatientModel;
