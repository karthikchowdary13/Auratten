'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore - Ignore type error if module resolution fails in specific Next.js setups
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function ThreeBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#000000');

        // Camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Premium Glass/Metal Material
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.1,
            transmission: 0.6, // Glass effect
            thickness: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            emissive: 0xc8f560, // Electric lime glow
            emissiveIntensity: 0.2,
        });

        // Create a Stylized Humanoid Figure (Fallback)
        const character = new THREE.Group();

        // Torso
        const torsoGeom = new THREE.CylinderGeometry(0.4, 0.2, 1.8, 16);
        const torso = new THREE.Mesh(torsoGeom, material);
        character.add(torso);

        // Head
        const headGeom = new THREE.SphereGeometry(0.25, 16, 16);
        const head = new THREE.Mesh(headGeom, material);
        head.position.y = 1.2;
        character.add(head);

        // Right Arm (Holding Phone)
        const armGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16);
        const rightArm = new THREE.Mesh(armGeom, material);
        rightArm.position.set(0.5, 0.4, 0.3);
        rightArm.rotation.z = -Math.PI / 4;
        rightArm.rotation.x = Math.PI / 4;
        character.add(rightArm);

        // Phone
        const phoneGeom = new THREE.BoxGeometry(0.1, 0.2, 0.02);
        const phoneMat = new THREE.MeshPhysicalMaterial({
            color: 0xc8f560, // Electric lime
            emissive: 0xc8f560,
            emissiveIntensity: 1.0, 
        });
        const phone = new THREE.Mesh(phoneGeom, phoneMat);
        phone.position.set(0.7, 0.7, 0.5);
        phone.rotation.y = -Math.PI / 4;
        character.add(phone);

        // Left Arm (Relaxed)
        const leftArm = new THREE.Mesh(armGeom, material);
        leftArm.position.set(-0.5, 0.2, 0);
        leftArm.rotation.z = Math.PI / 12;
        character.add(leftArm);

        scene.add(character);

        // Load Realistic Model if available
        const loader = new GLTFLoader();
        loader.load(
            '/man_holding_phone.glb', // Path to the file you will add
            (gltf: any) => {
                // Remove fallback
                scene.remove(character);
                
                // Add realistic model
                const model = gltf.scene;
                model.scale.set(1.5, 1.5, 1.5); // Adjust scale
                model.position.y = -1; // Adjust position
                
                // Apply glass material to all meshes in the model for that Oryzo look
                model.traverse((child: any) => {
                    if ((child as THREE.Mesh).isMesh) {
                        (child as THREE.Mesh).material = material;
                    }
                });
                
                scene.add(model);
                
                // Reference for animation
                (window as any).active3DModel = model;
            },
            undefined,
            (error: any) => {
                console.log('Using fallback 3D model. Add a file to public/man_holding_phone.glb to replace it.');
                (window as any).active3DModel = character;
            }
        );
        
        // Adjust camera to fit the character
        camera.position.z = 4;
        camera.position.y = 0.5;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xc8f560, 2, 10);
        pointLight1.position.set(2, 3, 4);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x00ffff, 1, 10);
        pointLight2.position.set(-2, -3, -4);
        scene.add(pointLight2);

        // Animation
        const clock = new THREE.Clock();

        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            const model = (window as any).active3DModel || character;

            // Auto rotation
            model.rotation.y = elapsedTime * 0.2;

            // Scroll interaction (Read from window)
            const scrollY = window.scrollY;
            model.position.y = 0.5 - scrollY * 0.002; // Keep camera offset
            model.rotation.y = elapsedTime * 0.2 + scrollY * 0.001;

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        // Handle Resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
