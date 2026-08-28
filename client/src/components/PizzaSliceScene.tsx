import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useIsMobile } from "@/hooks/useMobile";

type HeroSceneProps = {
  sectionRef: React.RefObject<HTMLElement | null>;
};

type ToppingData = {
  type: "tomato" | "olive" | "pepper" | "onion" | "mushroom" | "basil";
  x: number;
  z: number;
  size: number;
  rotation?: number;
};

const PIZZA_RADIUS = 2.55;
const SLICE_COUNT = 8;
const SLICE_ANGLE = (Math.PI * 2) / SLICE_COUNT;
const SLICE_START = -Math.PI / 2 - SLICE_ANGLE / 2;

const toppings: ToppingData[] = [
  { type: "tomato", x: 0.62, z: -0.82, size: 0.2 },
  { type: "tomato", x: -0.88, z: -0.5, size: 0.18 },
  { type: "tomato", x: 0.72, z: 0.58, size: 0.2 },
  { type: "tomato", x: -0.25, z: 0.88, size: 0.17 },
  { type: "olive", x: -0.1, z: -0.76, size: 0.14 },
  { type: "olive", x: 0.95, z: 0.04, size: 0.13 },
  { type: "olive", x: -0.92, z: 0.36, size: 0.12 },
  { type: "pepper", x: 0.14, z: -0.22, size: 0.4, rotation: 0.35 },
  { type: "pepper", x: -0.58, z: 0.12, size: 0.36, rotation: -0.6 },
  { type: "pepper", x: 0.54, z: 0.78, size: 0.3, rotation: -0.2 },
  { type: "onion", x: -0.55, z: -0.78, size: 0.2, rotation: 0.25 },
  { type: "onion", x: 0.4, z: 0.18, size: 0.18, rotation: -0.4 },
  { type: "mushroom", x: -0.2, z: 0.27, size: 0.22, rotation: 0.2 },
  { type: "mushroom", x: 0.92, z: -0.42, size: 0.2, rotation: -0.3 },
  { type: "basil", x: -0.72, z: -0.1, size: 0.16, rotation: 0.5 },
  { type: "basil", x: 0.1, z: 0.92, size: 0.15, rotation: -0.25 },
  { type: "basil", x: -1.03, z: 0.82, size: 0.13, rotation: -0.6 },
];

function makeSpeckleTexture(base: string, speck: string, repeat = 2.4) {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  if (!context) return undefined;
  context.fillStyle = base;
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < 80; index += 1) {
    context.globalAlpha = 0.08 + Math.random() * 0.16;
    context.fillStyle = speck;
    context.beginPath();
    context.arc(Math.random() * canvas.width, Math.random() * canvas.height, 0.5 + Math.random() * 2.1, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothStep(value: number) {
  return value * value * (3 - 2 * value);
}

function slicePosition(index: number, separation: number) {
  const centerAngle = SLICE_START + (index + 0.5) * SLICE_ANGLE;
  const amount = separation * (0.42 + (index % 3) * 0.035);
  return [Math.cos(centerAngle) * amount, 0, Math.sin(centerAngle) * amount] as [number, number, number];
}

function toppingSlice(topping: ToppingData) {
  const angle = Math.atan2(topping.z, topping.x);
  const normalized = (angle - SLICE_START + Math.PI * 2) % (Math.PI * 2);
  return Math.floor(normalized / SLICE_ANGLE) % SLICE_COUNT;
}

function CrustArc({ start, length }: { start: number; length: number }) {
  const texture = useMemo(() => makeSpeckleTexture("#9d4b29", "#f3bd62", 3.1), []);
  const geometry = useMemo(() => {
    const points = Array.from({ length: 18 }, (_, index) => {
      const angle = start + (index / 17) * length;
      return new THREE.Vector3(Math.cos(angle) * 2.66, 0.37, Math.sin(angle) * 2.66);
    });
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 24, 0.17, 10, false);
  }, [length, start]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial map={texture} color="#e0a154" roughness={0.77} metalness={0.02} />
    </mesh>
  );
}

function Topping({ item }: { item: ToppingData }) {
  const rotation = item.rotation ?? 0;

  if (item.type === "tomato") {
    return (
      <mesh position={[item.x, 0.38, item.z]} scale={[item.size * 1.2, 0.11, item.size]} castShadow>
        <sphereGeometry args={[1, 16, 8]} />
        <meshStandardMaterial color="#c94d32" roughness={0.62} />
      </mesh>
    );
  }

  if (item.type === "olive") {
    return (
      <mesh position={[item.x, 0.42, item.z]} rotation={[0.15, rotation, 0]} castShadow>
        <cylinderGeometry args={[item.size, item.size * 0.82, 0.09, 14]} />
        <meshStandardMaterial color="#33352a" roughness={0.75} />
      </mesh>
    );
  }

  if (item.type === "pepper") {
    return (
      <mesh position={[item.x, 0.42, item.z]} rotation={[0, rotation, 0.08]} scale={[item.size * 1.45, 0.08, item.size * 0.32]} castShadow>
        <capsuleGeometry args={[0.5, 0.48, 4, 10]} />
        <meshStandardMaterial color="#6d9343" roughness={0.58} />
      </mesh>
    );
  }

  if (item.type === "onion") {
    return (
      <mesh position={[item.x, 0.43, item.z]} rotation={[Math.PI / 2, rotation, 0]} castShadow>
        <torusGeometry args={[item.size * 0.72, 0.035, 8, 20]} />
        <meshStandardMaterial color="#aa6681" roughness={0.56} />
      </mesh>
    );
  }

  if (item.type === "mushroom") {
    return (
      <mesh position={[item.x, 0.42, item.z]} rotation={[0, rotation, 0]} scale={[item.size, 0.17, item.size * 1.12]} castShadow>
        <sphereGeometry args={[1, 14, 8]} />
        <meshStandardMaterial color="#d9aa75" roughness={0.72} />
      </mesh>
    );
  }

  return (
    <mesh position={[item.x, 0.45, item.z]} rotation={[0.1, rotation, -0.15]} scale={[item.size * 1.4, 0.06, item.size * 0.65]} castShadow>
      <sphereGeometry args={[1, 10, 6]} />
      <meshStandardMaterial color="#587545" roughness={0.66} />
    </mesh>
  );
}

function PizzaSlice({ index, separationRef, mobile }: { index: number; separationRef: React.MutableRefObject<number>; mobile: boolean }) {
  const slice = useRef<THREE.Group>(null!);
  const cheeseTexture = useMemo(() => makeSpeckleTexture("#e7ac55", "#fff1a7", 2.2), []);
  const start = SLICE_START + index * SLICE_ANGLE;
  const sliceToppings = toppings.filter((item) => toppingSlice(item) === index);

  useFrame(() => {
    const offset = slicePosition(index, separationRef.current);
    slice.current.position.set(offset[0], offset[1], offset[2]);
  });

  return (
    <group ref={slice}>
      <mesh position={[0, 0.17, 0]} rotation={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.54, 2.68, 0.28, mobile ? 18 : 28, 1, false, start, SLICE_ANGLE - 0.012]} />
        <meshStandardMaterial color="#d96a36" roughness={0.83} metalness={0.01} />
      </mesh>
      <mesh position={[0, 0.33, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.37, 2.42, 0.08, mobile ? 18 : 28, 1, false, start, SLICE_ANGLE - 0.018]} />
        <meshStandardMaterial map={cheeseTexture} color="#ffe084" roughness={0.5} metalness={0.02} />
      </mesh>
      <CrustArc start={start + 0.015} length={SLICE_ANGLE - 0.03} />
      {sliceToppings.map((item, toppingIndex) => <Topping key={`${item.type}-${toppingIndex}`} item={item} />)}
    </group>
  );
}

function CheeseBridge({ index, separationRef }: { index: number; separationRef: React.MutableRefObject<number> }) {
  const bridge = useRef<THREE.Mesh>(null!);
  const boundary = SLICE_START + index * SLICE_ANGLE;
  const anchorRadius = index % 2 === 0 ? 1.52 : 1.06;
  const base = new THREE.Vector3(Math.cos(boundary) * anchorRadius, 0.49, Math.sin(boundary) * anchorRadius);
  const up = new THREE.Vector3(0, 1, 0);

  useFrame(() => {
    const separation = separationRef.current;
    const start = base.clone().add(new THREE.Vector3(...slicePosition(index % SLICE_COUNT, separation)));
    const end = base.clone().add(new THREE.Vector3(...slicePosition((index + SLICE_COUNT - 1) % SLICE_COUNT, separation)));
    const direction = end.clone().sub(start);
    const length = direction.length();
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    bridge.current.position.copy(midpoint);
    bridge.current.quaternion.setFromUnitVectors(up, direction.normalize());
    bridge.current.scale.set(1, Math.max(length, 0.001), 1);
  });

  return (
    <mesh ref={bridge} scale={[1, 0.001, 1]} castShadow>
      <cylinderGeometry args={[0.035, 0.055, 1, 8]} />
      <meshStandardMaterial color="#f4d37b" roughness={0.48} />
    </mesh>
  );
}

function SteamPuff({ position, delay }: { position: [number, number, number]; delay: number }) {
  const puff = useRef<THREE.Mesh>(null!);
  const material = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(({ clock }) => {
    const progress = ((clock.elapsedTime + delay) % 2.8) / 2.8;
    puff.current.position.y = position[1] + progress * 1.1;
    puff.current.position.x = position[0] + Math.sin(progress * Math.PI * 2 + delay) * 0.14;
    puff.current.scale.setScalar(0.38 + progress * 0.85);
    material.current.opacity = 0.14 * (1 - progress);
  });

  return (
    <mesh ref={puff} position={position}>
      <sphereGeometry args={[0.22, 10, 10]} />
      <meshBasicMaterial ref={material} color="#fff4dc" transparent opacity={0.14} depthWrite={false} />
    </mesh>
  );
}

function PizzaCutter({ progressRef, mobile }: { progressRef: React.MutableRefObject<number>; mobile: boolean }) {
  const cutter = useRef<THREE.Group>(null!);
  const wheel = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    const progress = progressRef.current;
    const x = THREE.MathUtils.lerp(2.65, -2.68, progress);
    const z = THREE.MathUtils.lerp(1.2, -1.18, progress);
    const y = 1.56 - Math.sin(progress * Math.PI) * 1.08;
    const target = new THREE.Vector3(x, y, z);
    cutter.current.position.lerp(target, 0.1);
    cutter.current.rotation.z = THREE.MathUtils.lerp(-0.68, -0.48, progress);
    cutter.current.rotation.y = THREE.MathUtils.lerp(-0.34, 0.26, progress);
    wheel.current.rotation.x -= delta * (4 + progress * 7);
  });

  return (
    <group ref={cutter} scale={mobile ? 0.78 : 1}>
      <mesh position={[0, 0.42, 0]} rotation={[0, 0, 0.12]} castShadow>
        <torusGeometry args={[0.54, 0.095, 16, 44]} />
        <meshStandardMaterial color="#d8b26c" roughness={0.3} metalness={0.88} />
      </mesh>
      <mesh ref={wheel} position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.47, 0.018, 10, 40]} />
        <meshStandardMaterial color="#f6dba0" roughness={0.2} metalness={0.95} />
      </mesh>
      <mesh position={[0, -0.08, 0]} rotation={[0, 0, 0.12]} castShadow>
        <boxGeometry args={[0.11, 1.2, 0.12]} />
        <meshStandardMaterial color="#b77c38" roughness={0.42} metalness={0.62} />
      </mesh>
      <mesh position={[0, -0.72, 0]} rotation={[0, 0, 0.12]} castShadow>
        <capsuleGeometry args={[0.18, 0.82, 6, 14]} />
        <meshStandardMaterial color="#342a22" roughness={0.38} metalness={0.12} />
      </mesh>
      <mesh position={[0, -0.34, 0]} rotation={[0, 0, 0.12]}>
        <boxGeometry args={[0.22, 0.07, 0.2]} />
        <meshStandardMaterial color="#d3a15d" roughness={0.34} metalness={0.56} />
      </mesh>
    </group>
  );
}

function PizzaModel({ progressRef, mobile }: { progressRef: React.MutableRefObject<number>; mobile: boolean }) {
  const pizza = useRef<THREE.Group>(null!);
  const separationRef = useRef(0);

  useFrame((_, delta) => {
    const progress = progressRef.current;
    const easedCut = smoothStep(clamp((progress - 0.08) / 0.8, 0, 1));
    separationRef.current = THREE.MathUtils.damp(separationRef.current, easedCut * 0.52, 7, delta);
    pizza.current.rotation.y = THREE.MathUtils.damp(pizza.current.rotation.y, -0.18 + progress * 0.24, 4, delta);
    pizza.current.rotation.x = THREE.MathUtils.damp(pizza.current.rotation.x, 0.05 + progress * 0.03, 4, delta);
    pizza.current.position.y = THREE.MathUtils.damp(pizza.current.position.y, Math.sin(progress * Math.PI) * 0.08, 4, delta);
  });

  return (
    <group ref={pizza}>
      {Array.from({ length: SLICE_COUNT }, (_, index) => <PizzaSlice key={index} index={index} separationRef={separationRef} mobile={mobile} />)}
      {Array.from({ length: SLICE_COUNT }, (_, index) => <CheeseBridge key={index} index={index} separationRef={separationRef} />)}
      <SteamPuff position={[-0.7, 0.46, -0.4]} delay={0.2} />
      <SteamPuff position={[0.3, 0.46, 0.2]} delay={1.3} />
      <SteamPuff position={[0.86, 0.46, -0.12]} delay={2.1} />
      <PizzaCutter progressRef={progressRef} mobile={mobile} />
    </group>
  );
}

function SceneContents({ progressRef, mobile }: { progressRef: React.MutableRefObject<number>; mobile: boolean }) {
  const { camera } = useThree();
  const progress = useRef(0);

  useFrame((_, delta) => {
    progress.current = THREE.MathUtils.damp(progress.current, progressRef.current, 5, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, mobile ? 0.12 : 0.24, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, mobile ? 6.85 : 6.45, 3, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, mobile ? 6.8 : 6.55, 3, delta);
    camera.lookAt(0, 0.18, 0);
  });

  return <PizzaModel progressRef={progress} mobile={mobile} />;
}

export default function PizzaSliceScene({ sectionRef }: HeroSceneProps) {
  const mobile = useIsMobile();
  const progressRef = useRef(0);

  useEffect(() => {
    const updateProgress = () => {
      const section = sectionRef.current;
      if (!section) return;
      const start = section.offsetTop;
      const travel = Math.max(420, section.offsetHeight - window.innerHeight * 0.35);
      progressRef.current = clamp((window.scrollY - start) / travel, 0, 1);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [sectionRef]);

  return (
    <Canvas
      className="pizza-canvas"
      dpr={mobile ? [1, 1.25] : [1, 1.65]}
      shadows={!mobile}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = mobile ? 1.16 : 1.28;
      }}
    >
      <PerspectiveCamera makeDefault position={[0.24, 6.45, 6.55]} fov={37} near={0.1} far={100} />
      <ambientLight intensity={1.65} color="#ffe2bc" />
      <directionalLight castShadow={!mobile} position={[4.5, 8.5, 4]} intensity={3.1} color="#fff0d0" shadow-mapSize-width={mobile ? 512 : 1024} shadow-mapSize-height={mobile ? 512 : 1024} shadow-bias={-0.0002} />
      <directionalLight position={[-4, 3.5, -1]} intensity={1.4} color="#ed8060" />
      <pointLight position={[0, 3.4, 1.2]} intensity={1.8} distance={8} color="#ffb659" />
      <Environment preset="apartment" environmentIntensity={0.58} />
      <Float speed={0.55} rotationIntensity={0.06} floatIntensity={0.08} floatingRange={[-0.03, 0.03]}>
        <SceneContents progressRef={progressRef} mobile={mobile} />
      </Float>
      <ContactShadows position={[0, -0.03, 0]} opacity={0.28} scale={7.2} blur={2.4} far={3.8} resolution={mobile ? 256 : 512} />
    </Canvas>
  );
}
