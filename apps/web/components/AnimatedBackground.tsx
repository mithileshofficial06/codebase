'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedRef = useRef(false);
  const frameRef = useRef(0);

  function init() {
    if (loadedRef.current || !canvasRef.current || typeof window === 'undefined') return;
    const THREE = (window as any).THREE;
    if (!THREE) return;
    loadedRef.current = true;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x020205, 1); // Very dark background
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020205, 0.02);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    const group = new THREE.Group();
    scene.add(group);

    // Material - Dark glassy/metallic to reflect intense colored lights
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      metalness: 1.0,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // Shapes - Massive overlapping toruses to simulate sweeping fluid surfaces
    const toruses: { mesh: any, rx: number, ry: number }[] = [];
    
    // Main sweeping arc
    const geo1 = new THREE.TorusGeometry(8, 3, 64, 100);
    const mesh1 = new THREE.Mesh(geo1, material);
    mesh1.position.set(-2, 2, -5);
    mesh1.rotation.set(Math.PI / 4, Math.PI / 6, 0);
    group.add(mesh1);
    toruses.push({ mesh: mesh1, rx: 0.0005, ry: 0.0002 });

    // Crossing arc
    const geo2 = new THREE.TorusGeometry(10, 2.5, 64, 100);
    const mesh2 = new THREE.Mesh(geo2, material);
    mesh2.position.set(3, -3, -8);
    mesh2.rotation.set(-Math.PI / 3, -Math.PI / 6, 0);
    group.add(mesh2);
    toruses.push({ mesh: mesh2, rx: -0.0003, ry: 0.0004 });

    // Background bulk
    const geo3 = new THREE.TorusGeometry(14, 4, 64, 100);
    const mesh3 = new THREE.Mesh(geo3, material);
    mesh3.position.set(0, 0, -15);
    mesh3.rotation.set(0, Math.PI / 2, 0);
    group.add(mesh3);
    toruses.push({ mesh: mesh3, rx: 0.0002, ry: -0.0001 });

    // Lights
    scene.add(new THREE.AmbientLight(0x051020, 1.0)); // Deep blue ambient

    // Intense Blue/Cyan from top left
    const light1 = new THREE.DirectionalLight(0x0066ff, 5.0);
    light1.position.set(-10, 10, 5);
    scene.add(light1);

    // Deep Violet from bottom left
    const light2 = new THREE.DirectionalLight(0x6c3fc7, 3.0);
    light2.position.set(-10, -10, 0);
    scene.add(light2);

    // Sharp Copper/Amber highlight from bottom right, aimed at center
    const light3 = new THREE.SpotLight(0xff7722, 10.0, 50, Math.PI/6, 0.5, 1);
    light3.position.set(10, -5, 5);
    light3.target.position.set(0, 0, -5);
    scene.add(light3);
    scene.add(light3.target);

    // Cyan rim light from top right
    const light4 = new THREE.DirectionalLight(0x00d9ff, 2.0);
    light4.position.set(10, 10, -5);
    scene.add(light4);

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Visibility pause
    let paused = false;
    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (paused) return;

      const t = Date.now() * 0.001;

      // Group breathing
      group.rotation.x = Math.sin(t * 0.1) * 0.05;
      group.rotation.y = Math.cos(t * 0.1) * 0.05;

      // Torus rotation
      toruses.forEach((tData) => {
        tData.mesh.rotation.x += tData.rx;
        tData.mesh.rotation.y += tData.ry;
      });

      // Subtle light movement for shimmering edges
      light1.position.x = -10 + Math.sin(t * 0.5) * 2;
      light3.position.y = -5 + Math.cos(t * 0.3) * 2;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      geo1.dispose(); geo2.dispose(); geo3.dispose();
      material.dispose();
      renderer.dispose();
    };
  }

  useEffect(() => {
    if ((window as any).THREE) init();
  }, []);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        strategy="afterInteractive"
        onLoad={() => init()}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
