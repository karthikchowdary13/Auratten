'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface StudentRig {
    group: THREE.Group;
    speed: number;
    walkOffset: number;
    startZ: number;
    lLegPivot: THREE.Group;
    rLegPivot: THREE.Group;
    lArmPivot: THREE.Group;
    rArmPivot: THREE.Group;
}

function buildScene(isDark: boolean): {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    students: StudentRig[];
    cleanup: () => void;
} {
    // ── Palette ────────────────────────────────────────────────
    const C = {
        bg:          isDark ? 0x07090f : 0xdaeaf5,
        fog:         isDark ? 0x07090f : 0xc5ddef,
        ground:      isDark ? 0x0d1420 : 0xbfd4c8,
        path:        isDark ? 0x131d2e : 0xd0dde4,
        pathEdge:    isDark ? 0x1a2840 : 0xb8cad2,
        wall:        isDark ? 0x1b2645 : 0xccd9e6,
        wallDark:    isDark ? 0x141d36 : 0xb8c8d8,
        column:      isDark ? 0x22305a : 0xd4e0ec,
        roofBand:    isDark ? 0x1e2b50 : 0xbacad8,
        window:      isDark ? 0xf0b840 : 0x90b8d8,
        windowLit:   isDark ? 0xffd060 : 0x70a0c8,
        gate:        isDark ? 0x1e2c50 : 0xb0c2d2,
        gateAccent:  isDark ? 0x2a3e6a : 0xc8d8e4,
        step:        isDark ? 0x182038 : 0xc4d4e0,
        treeFoliage: isDark ? 0x163a1e : 0x4a7c48,
        treeTrunk:   isDark ? 0x28190a : 0x6a4820,
        lampPost:    isDark ? 0x2a3a5e : 0x9ab0c0,
        lampGlow:    isDark ? 0xffe060 : 0xffeeaa,
        skin:        isDark ? 0xc8956a : 0xd4a870,
        pants:       isDark ? 0x2a3550 : 0x4a5a6e,
        shoes:       isDark ? 0x1a1a28 : 0x404050,
    };

    const shirtColors  = isDark
        ? [0x3a5278, 0x4d3a6e, 0x2e5e5e, 0x5e4a2e, 0x4a4a72, 0x5e3a3a]
        : [0x5878a0, 0x7c5898, 0x489090, 0x908858, 0x6868a0, 0x9a5858];
    const bagColors    = isDark
        ? [0x8c3e2e, 0x2e6890, 0x3e8040, 0x7e6e2e]
        : [0xc06040, 0x4080b0, 0x509848, 0xa09040];

    // ── Scene ──────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(C.bg);
    scene.fog = new THREE.Fog(new THREE.Color(C.fog), 28, 55);

    // ── Camera ─────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
    camera.position.set(0, 5.5, 20);
    camera.lookAt(0, 1.5, 0);

    // ── Renderer ───────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 0.9 : 1.2;

    // ── Helpers ────────────────────────────────────────────────
    const mat  = (hex: number) => new THREE.MeshLambertMaterial({ color: hex });
    const box  = (w: number, h: number, d: number, hex: number) =>
        new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex));

    const addShadow = (m: THREE.Mesh) => { m.castShadow = true; m.receiveShadow = true; return m; };

    // ══════════════════════════════════════════════════════════
    // GROUND
    // ══════════════════════════════════════════════════════════
    const ground = addShadow(box(100, 0.1, 100, C.ground));
    ground.position.set(0, -2.05, 0);
    scene.add(ground);

    // Main walkway
    const pathMesh = addShadow(box(5, 0.06, 38, C.path));
    pathMesh.position.set(0, -2.0, 2);
    scene.add(pathMesh);

    // Path edge strips
    [-2.6, 2.6].forEach(x => {
        const edge = addShadow(box(0.2, 0.08, 38, C.pathEdge));
        edge.position.set(x, -2.0, 2);
        scene.add(edge);
    });

    // ══════════════════════════════════════════════════════════
    // COLLEGE BUILDING
    // ══════════════════════════════════════════════════════════

    // Main central body
    const mainBody = addShadow(box(22, 9, 4.5, C.wall));
    mainBody.position.set(0, 2.5, -9);
    scene.add(mainBody);

    // Horizontal band (mid-floor separator)
    const band = box(22.5, 0.5, 4.6, C.wallDark);
    band.position.set(0, 0.5, -9);
    scene.add(band);

    // Roof parapet
    const parapet = box(22.5, 0.6, 5, C.roofBand);
    parapet.position.set(0, 7.3, -9);
    scene.add(parapet);

    // Roof ledge
    const roofLedge = box(23, 0.3, 5.2, C.wallDark);
    roofLedge.position.set(0, 7.65, -9);
    scene.add(roofLedge);

    // Wings (left & right)
    ([-1, 1] as const).forEach(side => {
        const wing = addShadow(box(6, 7, 3.5, C.wall));
        wing.position.set(side * 14, 1.5, -9);
        scene.add(wing);

        const wingRoof = box(6.4, 0.5, 4, C.roofBand);
        wingRoof.position.set(side * 14, 5.25, -9);
        scene.add(wingRoof);

        const wingLedge = box(6.6, 0.25, 4.1, C.wallDark);
        wingLedge.position.set(side * 14, 5.55, -9);
        scene.add(wingLedge);
    });

    // ── Entrance columns ────────────────────────────────────
    const colMat = mat(C.column);
    [-3.8, -1.9, 0, 1.9, 3.8].forEach(x => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6, 10), colMat);
        col.position.set(x, 1, -6.9);
        col.castShadow = true;
        scene.add(col);

        // Column capital
        const cap = box(0.5, 0.22, 0.5, C.roofBand);
        cap.position.set(x, 4.1, -6.9);
        scene.add(cap);
    });

    // Column entablature beam
    const entab = box(10, 0.4, 0.6, C.roofBand);
    entab.position.set(0, 4.3, -6.9);
    scene.add(entab);

    // ── Steps ───────────────────────────────────────────────
    [0, 1, 2].forEach(i => {
        const step = addShadow(box(10 - i, 0.25, 0.8, C.step));
        step.position.set(0, -2 + i * 0.25, -6.1 + i * 0.35);
        scene.add(step);
    });

    // ── Windows ─────────────────────────────────────────────
    // Main building windows (2 rows)
    for (let row = 0; row < 2; row++) {
        for (let col = -3; col <= 3; col++) {
            if (col === 0 && row === 0) continue; // Door space
            const isLit = Math.abs(col) <= 1 && row === 1;
            const win = box(1.4, 1.6, 0.12, isLit ? C.windowLit : C.window);
            win.position.set(col * 2.8, row * 2.8 - 0.3, -6.75);
            scene.add(win);

            // Window frame
            const frame = box(1.6, 1.8, 0.1, C.wallDark);
            frame.position.set(col * 2.8, row * 2.8 - 0.3, -6.8);
            scene.add(frame);
        }
    }

    // Wing windows
    ([-1, 1] as const).forEach(side => {
        for (let row = 0; row < 2; row++) {
            for (let col = -1; col <= 1; col++) {
                const win = box(1.1, 1.3, 0.12, C.window);
                win.position.set(side * 14 + col * 1.8, row * 2.5 - 0.5, -7.25);
                scene.add(win);
            }
        }
    });

    // ── Door ────────────────────────────────────────────────
    const door = box(1.4, 2.6, 0.12, C.wallDark);
    door.position.set(0, -0.7, -6.75);
    scene.add(door);

    // ── Name board above entrance ────────────────────────────
    const board = box(6, 0.7, 0.2, C.roofBand);
    board.position.set(0, 4.75, -6.75);
    scene.add(board);

    // ══════════════════════════════════════════════════════════
    // GATE / ENTRANCE ARCH
    // ══════════════════════════════════════════════════════════

    // Gate pillars
    ([-2.2, 2.2] as const).forEach(x => {
        const pillar = addShadow(box(0.55, 5, 0.55, C.gate));
        pillar.position.set(x, 0.5, -2.5);
        scene.add(pillar);

        // Pillar cap
        const cap = box(0.78, 0.38, 0.78, C.gateAccent);
        cap.position.set(x, 3.19, -2.5);
        scene.add(cap);

        // Globe lamp on pillar
        const globe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8),
            new THREE.MeshBasicMaterial({ color: C.lampGlow }));
        globe.position.set(x, 3.5, -2.5);
        scene.add(globe);
    });

    // Gate top beam
    const gateBeam = box(4.4 + 0.55, 0.42, 0.55, C.gate);
    gateBeam.position.set(0, 3.0, -2.5);
    scene.add(gateBeam);

    // Gate decorative header
    const gateHeader = box(4.2, 0.6, 0.3, C.gateAccent);
    gateHeader.position.set(0, 3.0, -2.25);
    scene.add(gateHeader);

    // Gate fence bars (between pillars)
    for (let i = -3; i <= 3; i++) {
        if (Math.abs(i) <= 1) continue; // Gap for path
        const bar = box(0.08, 2.8, 0.08, C.gate);
        bar.position.set(i * 0.55, -0.6, -2.5);
        scene.add(bar);
    }

    // ══════════════════════════════════════════════════════════
    // LAMP POSTS along path
    // ══════════════════════════════════════════════════════════
    const addLamp = (x: number, z: number) => {
        const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.08, 4.5, 6),
            mat(C.lampPost)
        );
        post.position.set(x, 0.25, z);
        post.castShadow = true;
        scene.add(post);

        // Arm
        const arm = box(0.5, 0.06, 0.06, C.lampPost);
        arm.position.set(x + (x < 0 ? 0.28 : -0.28), 2.55, z);
        scene.add(arm);

        // Globe
        const globe = new THREE.Mesh(new THREE.SphereGeometry(0.14, 7, 7),
            new THREE.MeshBasicMaterial({ color: C.lampGlow }));
        globe.position.set(x + (x < 0 ? 0.55 : -0.55), 2.55, z);
        scene.add(globe);

        if (isDark) {
            const glow = new THREE.PointLight(0xffe070, 0.5, 4);
            glow.position.set(x + (x < 0 ? 0.55 : -0.55), 2.55, z);
            scene.add(glow);
        }
    };

    addLamp(-3.4, 14);
    addLamp( 3.4, 14);
    addLamp(-3.4,  7);
    addLamp( 3.4,  7);
    addLamp(-3.4,  0);
    addLamp( 3.4,  0);

    // ══════════════════════════════════════════════════════════
    // TREES
    // ══════════════════════════════════════════════════════════
    const addTree = (x: number, z: number, s: number = 1) => {
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1 * s, 0.15 * s, 1.4 * s, 7),
            mat(C.treeTrunk)
        );
        trunk.position.set(x, -1.3 + 0.7 * s, z);
        trunk.castShadow = true;
        scene.add(trunk);

        [0, 0.65, 1.2].forEach((yo, i) => {
            const cone = new THREE.Mesh(
                new THREE.ConeGeometry((0.95 - i * 0.22) * s, (1.3 - i * 0.08) * s, 7),
                mat(C.treeFoliage)
            );
            cone.position.set(x, -0.5 + (yo + 0.7) * s, z);
            cone.castShadow = true;
            scene.add(cone);
        });
    };

    // Path flanking trees
    [14, 9, 4].forEach(z => { addTree(-4.5, z, 1.0); addTree(4.5, z, 1.0); });

    // Background trees
    addTree(-9, -4, 1.3);  addTree(-13, -2, 1.1);  addTree(-11, -7, 1.4);
    addTree( 9, -4, 1.2);  addTree( 13, -2, 1.0);  addTree( 11, -7, 1.3);
    addTree(-18, 2, 1.5);  addTree( 18, 2, 1.4);
    addTree(-6, -7, 1.1);  addTree( 6, -7, 1.2);

    // ══════════════════════════════════════════════════════════
    // STUDENTS (with pivot-based walking rigs)
    // ══════════════════════════════════════════════════════════
    const students: StudentRig[] = [];

    const createStudent = (si: number): StudentRig => {
        const shirtColor = shirtColors[si % shirtColors.length];
        const bagColor   = bagColors[si % bagColors.length];

        const root = new THREE.Group();

        // ── Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10),
            mat(C.skin));
        head.position.y = 1.32;
        head.castShadow = true;
        root.add(head);

        // ── Hair  
        const hair = new THREE.Mesh(new THREE.SphereGeometry(0.175, 10, 6),
            mat(isDark ? 0x1a1010 : 0x2a1a10));
        hair.position.set(0, 1.4, -0.02);
        hair.scale.set(1, 0.65, 1);
        root.add(hair);

        // ── Torso (shirt)
        const torso = addShadow(box(0.36, 0.52, 0.24, shirtColor));
        torso.position.y = 0.76;
        root.add(torso);

        // ── Waist (pants)
        const waist = box(0.34, 0.18, 0.23, C.pants);
        waist.position.y = 0.41;
        root.add(waist);

        // ── Backpack
        const pack = addShadow(box(0.26, 0.34, 0.16, bagColor));
        pack.position.set(0, 0.76, -0.2);
        root.add(pack);

        // Bag strap suggestion
        const strap = box(0.04, 0.48, 0.04, bagColor);
        strap.position.set(0.1, 0.8, -0.08);
        root.add(strap);

        // ── Books (held flat)
        const bookMat = mat(isDark ? 0xe0d060 : 0xf0e050);
        const book1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.28), bookMat);
        book1.position.set(-0.3, 0.58, 0.06);
        book1.rotation.z = 0.15;
        root.add(book1);
        const book2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.28),
            mat(isDark ? 0xd06050 : 0xe07060));
        book2.position.set(-0.3, 0.62, 0.06);
        book2.rotation.z = 0.15;
        root.add(book2);

        // ── Leg pivots (at hip level)
        const makeLegPivot = (side: number) => {
            const pivot = new THREE.Group();
            pivot.position.set(side * 0.1, 0.32, 0);
            root.add(pivot);

            const thigh = addShadow(box(0.14, 0.32, 0.15, C.pants));
            thigh.position.y = -0.16;
            pivot.add(thigh);

            const shin = addShadow(box(0.12, 0.28, 0.13, C.pants));
            shin.position.y = -0.42;
            pivot.add(shin);

            const shoe = addShadow(box(0.14, 0.1, 0.2, C.shoes));
            shoe.position.set(0, -0.59, 0.04);
            pivot.add(shoe);

            return pivot;
        };

        const lLegPivot = makeLegPivot(-1);
        const rLegPivot = makeLegPivot(1);

        // ── Arm pivots (at shoulder level)
        const makeArmPivot = (side: number) => {
            const pivot = new THREE.Group();
            pivot.position.set(side * 0.24, 0.96, 0);
            root.add(pivot);

            const upper = addShadow(box(0.12, 0.3, 0.13, shirtColor));
            upper.position.y = -0.15;
            pivot.add(upper);

            const lower = addShadow(box(0.11, 0.26, 0.12, C.skin));
            lower.position.y = -0.38;
            pivot.add(lower);

            return pivot;
        };

        const lArmPivot = makeArmPivot(-1);
        const rArmPivot = makeArmPivot(1);

        // Position & face toward building
        const lane = (Math.random() - 0.5) * 2.8;
        const startZ = 18 + si * 4.2 + Math.random() * 4;
        root.position.set(lane, -2, startZ);
        root.rotation.y = Math.PI; // face building

        scene.add(root);

        return {
            group: root,
            speed: 0.014 + Math.random() * 0.009,
            walkOffset: si * (Math.PI / 3),
            startZ,
            lLegPivot, rLegPivot, lArmPivot, rArmPivot,
        };
    };

    for (let i = 0; i < 7; i++) {
        students.push(createStudent(i));
    }

    // ══════════════════════════════════════════════════════════
    // LIGHTING
    // ══════════════════════════════════════════════════════════
    const ambient = new THREE.AmbientLight(
        isDark ? 0x3a4f70 : 0xc8ddf0,
        isDark ? 0.7 : 1.1
    );
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(
        isDark ? 0x8fa8cc : 0xfff8e8,
        isDark ? 0.9 : 1.6
    );
    sun.position.set(12, 18, 12);
    sun.castShadow = true;
    sun.shadow.camera.left   = -25;
    sun.shadow.camera.right  =  25;
    sun.shadow.camera.top    =  25;
    sun.shadow.camera.bottom = -25;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias = -0.001;
    scene.add(sun);

    // Fill light from opposite side
    const fill = new THREE.DirectionalLight(
        isDark ? 0x3a5080 : 0xddeeff,
        isDark ? 0.3 : 0.5
    );
    fill.position.set(-10, 8, 10);
    scene.add(fill);

    // Window glow (dark mode)
    if (isDark) {
        const winGlow = new THREE.PointLight(0xffc840, 1.0, 9);
        winGlow.position.set(0, 1, -6);
        scene.add(winGlow);

        const winGlow2 = new THREE.PointLight(0xff9030, 0.6, 7);
        winGlow2.position.set(-5, 2, -7);
        scene.add(winGlow2);
    }

    const cleanup = () => { /* handled by caller */ };
    return { scene, camera, renderer, students, cleanup };
}

export default function ThreeBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const isDark = !document.documentElement.classList.contains('light');

        const { scene, camera, renderer, students } = buildScene(isDark);

        const updateSize = () => {
            const w = container.clientWidth || window.innerWidth;
            const h = container.clientHeight || window.innerHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };

        container.appendChild(renderer.domElement);
        updateSize();

        // ── Animation ──────────────────────────────────────────
        let animId: number;
        let elapsed = 0;
        let lastTime = performance.now();

        const animate = (now: number) => {
            animId = requestAnimationFrame(animate);
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;
            elapsed += dt;

            students.forEach((s) => {
                // Walk forward toward building
                s.group.position.z -= s.speed;

                // Loop back
                if (s.group.position.z < -5) {
                    s.group.position.z = 22 + Math.random() * 6;
                    s.group.position.x = (Math.random() - 0.5) * 2.8;
                }

                // Walk cycle
                const phase = elapsed * 4.5 + s.walkOffset;
                const swing = 0.42;
                s.lLegPivot.rotation.x = Math.sin(phase) * swing;
                s.rLegPivot.rotation.x = Math.sin(phase + Math.PI) * swing;
                s.lArmPivot.rotation.x = Math.sin(phase + Math.PI) * 0.28;
                s.rArmPivot.rotation.x = Math.sin(phase) * 0.28;

                // Subtle vertical bob
                s.group.position.y = -2 + Math.abs(Math.sin(phase)) * 0.045;
            });

            // Gentle camera sway
            camera.position.y = 5.5 + Math.sin(elapsed * 0.12) * 0.08;
            camera.position.x = Math.sin(elapsed * 0.07) * 0.15;

            renderer.render(scene, camera);
        };

        animId = requestAnimationFrame(animate);

        // ── Resize ─────────────────────────────────────────────
        const ro = new ResizeObserver(updateSize);
        ro.observe(container);

        // ── Theme observer ─────────────────────────────────────
        // Re-mount on theme change via class mutation
        const mo = new MutationObserver(() => {
            // Trigger react to re-run effect by toggling a data attr
            container.dataset.theme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
        });
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => {
            cancelAnimationFrame(animId);
            ro.disconnect();
            mo.disconnect();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-0 pointer-events-none"
            aria-hidden="true"
        />
    );
}
