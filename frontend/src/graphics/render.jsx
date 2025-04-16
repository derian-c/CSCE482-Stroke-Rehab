import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const PatientModel = ({file,token}) => {

  const containerReference = useRef(null);
  const isRendered = useRef(false);
  let lastFile = null;

  useEffect(() => {
    if(!file || !token) return
    if (isRendered.current && lastFile == file) return;
    isRendered.current = true;
    //Create a New Scene to render
    const scene = new THREE.Scene();

    //Create Camera to establish pov
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(10, 5, 5);

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
    controls.target = new THREE.Vector3(0, 0, -3);
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
    groundMesh.translateY(-2.85);
    groundMesh.translateZ(-3);
    groundMesh.castShadow = false;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    //Create Basic Light
    const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, Math.PI / 8, 1);
    spotLight.position.set(0, 25, 10);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const loader = new GLTFLoader();
    // if(!url){
    //   loader.setPath('/Models')
    // }
    let mixer;
    if(file && token){
      loader.load(
        `${file.url}?${token}`,
        (gltf) => {
          const mesh = gltf.scene;
          //Need to rotate model to be upright because opensim swaps z and y axis
          const rotationMatrix = new THREE.Matrix4();
          rotationMatrix.makeRotationX(-Math.PI / 2);
          mesh.applyMatrix4(rotationMatrix);
          mesh.scale.set(3, 3, 3);
          //Some models are broken into multiple meshes
          //This casts the shadow for each mesh part
          mesh.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          //Translates entire models initial position
          mesh.position.set(0, 0, 0);
          scene.add(mesh);

          mixer = new THREE.AnimationMixer(mesh);
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
        },
        (xhr) => {
          // Shows loading percentage
          const progress = (xhr.loaded / xhr.total) * 100;
          if(progress%10 <= .05){
            console.log(`Loading: ${progress.toFixed(2)}%`);
          }
        },
        (error) => {
          console.error(error);
        }
      );
    }

    //When window is resized adjust camera and render size
    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", resize);

    //Actually render the scene
    let stopAnimating = false
    function animate() {
      if(stopAnimating) return
      requestAnimationFrame(animate);
      //Updates keyframe for animation
      if (mixer) {
        mixer.update(0.01);
      }
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // Free up resources
    const disposeObject = (object) => {
      // If the object is a Mesh, dispose of its geometry and material
      if (object.isMesh) {
        if (object.geometry) {
          object.geometry.dispose();
        }
    
        if (object.material) {
          if (Array.isArray(object.material)) {
            // Dispose of each material in an array
            object.material.forEach((mat) => {
              if (mat.map) mat.map.dispose(); // Dispose of textures
              mat.dispose();
            });
          } else {
            if (object.material.map) object.material.map.dispose(); // Dispose of texture
            object.material.dispose();
          }
        }
      }
    
      // If the object has children, recursively dispose them
      if (object.children.length > 0) {
        object.children.forEach((child) => disposeObject(child));
      }
    }

    return () => {
      stopAnimating = true
      window.removeEventListener("resize", resize)
      if (containerReference.current) {
        containerReference.current.removeChild(renderer.domElement)
      }
      scene.traverse((object) => {
        disposeObject(object)
      })
      renderer.dispose()
      if(mixer){
        mixer.stopAllAction()
      }
      lastFile = file
    }
  
  }, [file]);
  return <div ref={containerReference} className="w-full h-full"></div>;
};

export default PatientModel;
