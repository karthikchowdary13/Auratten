'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ParticleBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef(new THREE.Vector2(-1000, -1000));

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      3000
    );
    camera.position.z = 800;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, // Optimization for high density
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    containerRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x60a5fa, 3.5, 1500);
    scene.add(pointLight);

    // --- Engine Optimization: InstancedMesh ---
    const particleCount = 3500; // Ultra-high density
    const geometry = new THREE.BoxGeometry(1.4, 6.5, 1.4); // Larger for better visibility
    
    const colors = [
      new THREE.Color(0x60a5fa), // Blue
      new THREE.Color(0xa78bfa), // Purple
      new THREE.Color(0xf472b6), // Pink
      new THREE.Color(0xffffff), // White
      new THREE.Color(0x3b82f6), // Deeper Blue
    ];

    const material = new THREE.MeshPhongMaterial({
      shininess: 150,
      transparent: true,
      opacity: 0.9,
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, material, particleCount);
    
    const meta: { 
      baseX: number; 
      baseY: number; 
      baseZ: number;
      curX: number; 
      curY: number; 
      curZ: number;
      vx: number; 
      vy: number; 
      vz: number; 
      rvx: number; 
      rvy: number; 
      rvz: number;
      rx: number;
      ry: number;
      rz: number;
      offset: number;
    }[] = [];

    const dummy = new THREE.Object3D();
    const colorAttribute = new THREE.InstancedBufferAttribute(new Float32Array(particleCount * 3), 3);

    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * window.innerWidth * 2.2;
        const y = (Math.random() - 0.5) * window.innerHeight * 2.2;
        const z = (Math.random() - 0.5) * 1000;

        meta.push({
          baseX: x, baseY: y, baseZ: z,
          curX: x, curY: y, curZ: z,
          vx: 0, vy: 0, vz: 0,
          rvx: (Math.random() - 0.5) * 0.08,
          rvy: (Math.random() - 0.5) * 0.08,
          rvz: (Math.random() - 0.5) * 0.08,
          rx: Math.random(), ry: Math.random(), rz: Math.random(),
          offset: Math.random() * Math.PI * 2,
        });

        const color = colors[Math.floor(Math.random() * colors.length)];
        colorAttribute.setXYZ(i, color.r, color.g, color.b);
    }
    
    instancedMesh.instanceColor = colorAttribute;
    scene.add(instancedMesh);

    // --- Interaction ---
    const animate = (time: number) => {
      const vector = new THREE.Vector3(mouseRef.current.x, mouseRef.current.y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distToPlane = -camera.position.z / dir.z;
      const mouseTarget = camera.position.clone().add(dir.multiplyScalar(distToPlane));
      
      pointLight.position.copy(mouseTarget);
      pointLight.position.z = 400;

      for (let i = 0; i < particleCount; i++) {
        const m = meta[i];

        // 1. Rotation Shimmer
        m.rx += m.rvx;
        m.ry += m.rvy;
        m.rz += m.rvz;

        // 2. Breathing Drift (Realistic 1-2m feel)
        const breatheX = Math.cos(time * 0.0008 + m.offset) * 2.5;
        const breatheY = Math.sin(time * 0.0008 + m.offset) * 2.5;
        const targetX = m.baseX + breatheX;
        const targetY = m.baseY + breatheY;

        // 3. Vortex Repulsion
        const dx = mouseTarget.x - m.curX;
        const dy = mouseTarget.y - m.curY;
        const dz = mouseTarget.z - m.curZ;
        const mouseDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const radius = 250;

        if (mouseDist < radius) {
          const force = (radius - mouseDist) / radius;
          const repulsionAngle = Math.atan2(dy, dx);
          m.curX -= Math.cos(repulsionAngle) * force * 15;
          m.curY -= Math.sin(repulsionAngle) * force * 15;
        }

        // 4. Elastic Return
        const homeDx = targetX - m.curX;
        const homeDy = targetY - m.curY;
        const homeDz = m.baseZ - m.curZ;
        
        m.vx += homeDx * 0.03;
        m.vy += homeDy * 0.03;
        m.vz += homeDz * 0.03;

        m.vx *= 0.86;
        m.vy *= 0.86;
        m.vz *= 0.86;

        m.curX += m.vx;
        m.curY += m.vy;
        m.curZ += m.vz;

        // Apply to InstancedMesh
        dummy.position.set(m.curX, m.curY, m.curZ);
        dummy.rotation.set(m.rx, m.ry, m.rz);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      scene.clear();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        background: '#0a0a0c',
      }}
    />
  );
};

export default ParticleBackground;
