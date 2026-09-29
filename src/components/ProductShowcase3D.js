'use client';

import { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture, ContactShadows } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

function ProductPlane({ images }) {
  const groupRef = useRef();
  const [frontTex, backTex] = useTexture([images[0], images[1] || images[0]]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Front face */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[2.2, 2.75]} />
        <meshStandardMaterial map={frontTex} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Back face */}
      <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.2, 2.75]} />
        <meshStandardMaterial map={backTex} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Thin edge to give it a "card" thickness feel */}
      <mesh>
        <boxGeometry args={[2.2, 2.75, 0.03]} />
        <meshStandardMaterial color="#241E1A" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color="#C9A15D" wireframe />
    </mesh>
  );
}

export default function ProductShowcase3D({ images, name }) {
  const [interacting, setInteracting] = useState(false);

  return (
    <div className="relative w-full h-[420px] sm:h-[520px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#2b2119] to-[#181310]">
      <Canvas camera={{ position: [0, 0, 4.4], fov: 40 }} shadows>
        <ambientLight intensity={0.65} color="#fff2df" />
        <pointLight position={[3, 3, 3]} intensity={1.3} color="#E4C892" />
        <pointLight position={[-3, -1, 2]} intensity={0.5} color="#B98A5E" />
        <pointLight position={[0, 2, -3]} intensity={0.3} color="#8C6541" />
        <Suspense fallback={<Loader />}>
          <ProductPlane images={images} />
          <ContactShadows position={[0, -1.5, 0]} opacity={0.5} scale={6} blur={2.5} far={2} color="#000000" />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!interacting}
          autoRotateSpeed={1.4}
          onStart={() => setInteracting(true)}
          onEnd={() => setInteracting(false)}
          minPolarAngle={Math.PI / 2.6}
          maxPolarAngle={Math.PI / 1.7}
        />
      </Canvas>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-cream/60 text-xs uppercase tracking-widest2 pointer-events-none">
        Drag to rotate · {name}
      </div>
    </div>
  );
}
