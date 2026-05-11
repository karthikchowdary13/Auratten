'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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

        // Objects
        const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 120, 20);
        
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
        
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

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

            // Auto rotation
            mesh.rotation.y = elapsedTime * 0.2;
            mesh.rotation.x = elapsedTime * 0.1;

            // Scroll interaction (Read from window)
            const scrollY = window.scrollY;
            mesh.position.y = -scrollY * 0.002;
            mesh.rotation.z = scrollY * 0.001;

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
            geometry.dispose();
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
