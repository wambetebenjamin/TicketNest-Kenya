"use client";

import { useEffect, useRef } from "react";
import type * as ThreeNS from "three";

/**
 * Three.js confetti particle system — purchase confirmation page ONLY.
 * Small paper rectangles in design-source colors falling from the top of the
 * screen for 3 seconds, then stops. Not looping. Pauses/cleans up
 * immediately on unmount (navigation). DPR limited to 1.5.
 * Disabled entirely under prefers-reduced-motion.
 */
export default function Confetti() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;
    let raf = 0;

    import("three")
      .then((THREE) => {
        if (disposed || !ref.current) return;

        const DURATION = 3000; // 3 seconds, then stop
        const COLORS = [0xf82249, 0x0e1b4d, 0xffffff, 0x001553, 0x059652, 0x2f3138];
        const COUNT = 160;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          60,
          window.innerWidth / window.innerHeight,
          0.1,
          100
        );
        camera.position.z = 20;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        ref.current.appendChild(renderer.domElement);

        // Paper rectangles (planes), never diamonds or gem shapes
        const geometry = new THREE.PlaneGeometry(0.22, 0.34);
        const particles: {
          mesh: ThreeNS.Mesh;
          vx: number;
          vy: number;
          vz: number;
          rotX: number;
          rotY: number;
          rotZ: number;
        }[] = [];

        for (let i = 0; i < COUNT; i++) {
          const material = new THREE.MeshBasicMaterial({
            color: COLORS[i % COLORS.length],
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(geometry, material);
          // Start above the top edge, spread across width/depth
          mesh.position.set(
            (Math.random() - 0.5) * 36,
            12 + Math.random() * 14,
            (Math.random() - 0.5) * 10
          );
          mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );
          scene.add(mesh);
          particles.push({
            mesh,
            vx: (Math.random() - 0.5) * 1.6,
            vy: -(4.5 + Math.random() * 3.5),
            vz: (Math.random() - 0.5) * 0.6,
            rotX: (Math.random() - 0.5) * 0.16,
            rotY: (Math.random() - 0.5) * 0.16,
            rotZ: (Math.random() - 0.5) * 0.2,
          });
        }

        const start = performance.now();
        const onResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", onResize);

        const animate = (now: number) => {
          if (disposed) return;
          const elapsed = now - start;
          if (elapsed >= DURATION) {
            cleanup?.();
            return;
          }
          // Ease-out gravity for the final stretch
          const dt = 1 / 60;
          for (const p of particles) {
            p.mesh.position.x += p.vx * dt;
            p.mesh.position.y += p.vy * dt;
            p.mesh.position.z += p.vz * dt;
            p.vy -= 1.2 * dt; // light gravity
            p.mesh.rotation.x += p.rotX;
            p.mesh.rotation.y += p.rotY;
            p.mesh.rotation.z += p.rotZ;
          }
          renderer.render(scene, camera);
          raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", onResize);
          geometry.dispose();
          particles.forEach((p) => (p.mesh.material as ThreeNS.Material).dispose());
          renderer.dispose();
          if (ref.current?.contains(renderer.domElement)) {
            ref.current.removeChild(renderer.domElement);
          }
        };
      })
      .catch(() => {
        /* three.js failed to load — no confetti, page still fine */
      });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[999900]"
    />
  );
}
