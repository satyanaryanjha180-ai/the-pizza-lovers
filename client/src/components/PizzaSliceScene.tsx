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

type SurfaceData = {
  x: number;
  z: number;
  size: number;
  rotation?: number;
};

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

const cheeseBubbles: SurfaceData[] = [
  { x: -1.38, z: -0.62, size: 0.13 },
  { x: -0.98, z: 0.74, size: 0.1 },
  { x: -0.18, z: -0.98, size: 0.12 },
  { x: 0.22, z: 0.45, size: 0.12 },
  { x: 1.18, z: 0.56, size: 0.11 },
  { x: 1.22, z: -0.54, size: 0.1 },
  { x: -0.54, z: 1.08, size: 0.09 },
];

const bakedSpots: SurfaceData[] = [
  { x: -1.56, z: 0.15, size: 0.08, rotation: 0.2 },
  { x: -0.62, z: -1.17, size: 0.07, rotation: -0.5 },
  { x: 0.3, z: -1.32, size: 0.06, rotation: 0.45 },
  { x: 1.1, z: -0.1, size: 0.08, rotation: -0.2 },
  { x: 0.2, z: 1.35, size: 0.06, rotation: 0.15 },
  { x: -1.1, z: 0.86, size: 0.05, rotation: -0.3 },
];

function makeSpeckleTexture(base: string, speck: string, repeat = 2.4) {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  if (!context) return undefined;
  context.fillStyle = base;
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < 92; index += 1) {
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
  const amount = separation * (0.46 + (index % 3) * 0.035);
  return [Math.cos(centerAngle) * amount, 0, Math.sin(centerAngle) * amount] as [number, number, number];
}

function toppingSlice(item: { x: number; z: number }) {
  const angle = Math.atan2(item.z, item.x);
  const normalized = (angle - SLICE_START + Math.PI * 2) % (Math.PI * 2);
  return Math.floor(normalized / SLICE_ANGLE) % SLICE_COUNT;
}

function CrustArc({ start, length }: { start: number; length: number }) {
  const texture = useMemo(() => makeSpeckleTexture("#9c4827", "#f5c36f", 3.2), []);
  const geometry = useMemo(() => {
    const points = Array.from({ length: 20 }, (_, index) => {
      const angle = start + (index / 19) * length;
      return new THREE.Vector3(Math.cos(angle) * 2.62, 0.41, Math.sin(angle) * 2.62);
    });
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 26, 0.18, 12, false);
  }, [length, start]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial map={texture} color="#dda15a" roughness={0.74} metalness={0.02} />
    </mesh>
  );
}

function Topping({ item }: { item: ToppingData }) {
  const rotation = item.rotation ?? 0;

  if (item.type === "tomato") {
    return (
      <mesh position={[item.x, 0.46, item.z]} scale={[item.size * 1.2, 0.14, item.size]} castShadow>
        <sphereGeometry args={[1, 18, 10]} />
        <meshStandardMaterial color="#c94d32" roughness={0.52} />
      </mesh>
    );
  }

  if (item.type === "olive") {
    return (
      <mesh position={[item.x, 0.49, item.z]} rotation={[0.12, rotation, 0]} castShadow>
        <cylinderGeometry args={[item.size, item.size * 0.82, 0.11, 16]} />
        <meshStandardMaterial color="#2d3027" roughness={0.68} />
      </mesh>
    );
  }

  if (item.type === "pepper") {
    return (
      <mesh position={[item.x, 0.47, item.z]} rotation={[0, rotation, 0.08]} scale={[item.size * 1.45, 0.09, item.size * 0.32]} castShadow>
        <capsuleGeometry args={[0.5, 0.48, 4, 12]} />
        <meshStandardMaterial color="#6e9547" roughness={0.52} />
      </mesh>
    );
  }

  if (item.type === "onion") {
    return (
      <mesh position={[item.x, 0.49, item.z]} rotation={[Math.PI / 2, rotation, 0]} castShadow>
        <torusGeometry args={[item.size * 0.72, 0.038, 8, 22]} />
        <meshStandardMaterial color="#aa6681" roughness={0.5} />
      </mesh>
    );
  }

  if (item.type === "mushroom") {
    return (
      <group position={[item.x, 0.46, item.z]} rotation={[0, rotation, 0]}>
        <mesh scale={[item.size, 0.2, item.size * 1.12]} castShadow>
          <sphereGeometry args={[1, 16, 10]} />
          <meshStandardMaterial color="#d6a673" roughness={0.64} />
        </mesh>
        <mesh position={[0, 0.08, 0]} scale={[item.size * 0.74, 0.07, item.size * 0.78]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color="#f0ca93" roughness={0.58} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh position={[item.x, 0.5, item.z]} rotation={[0.1, rotation, -0.15]} scale={[item.size * 1.4, 0.07, item.size * 0.65]} castShadow>
      <sphereGeometry args={[1, 12, 8]} />
      <meshStandardMaterial color="#587545" roughness={0.6} />
    </mesh>
  );
}

function CheeseBubble({ item }: { item: SurfaceData }) {
  return (
    <mesh position={[item.x, 0.45, item.z]} scale={[item.size * 1.4, item.size * 0.34, item.size]} castShadow>
      <sphereGeometry args={[1, 16, 8]} />
      <meshPhysicalMaterial color="#f3c65d" roughness={0.36} clearcoat={0.18} clearcoatRoughness={0.3} />
    </mesh>
  );
}

function BakedSpot({ item }: { item: SurfaceData }) {
  return (
    <mesh position={[item.x, 0.49, item.z]} rotation={[Math.PI / 2, item.rotation ?? 0, 0]} scale={[item.size * 1.5, item.size, 1]}>
      <circleGeometry args={[1, 12]} />
      <meshBasicMaterial color="#c0783c" transparent opacity={0.48} />
    </mesh>
  );
}

function PizzaSlice({ index, separationRef, mobile }: { index: number; separationRef: React.MutableRefObject<number>; mobile: boolean }) {
  const slice = useRef<THREE.Group>(null!);
  const cheeseTexture = useMemo(() => makeSpeckleTexture("#e8ae58", "#fff3aa", 2.2), []);
  const start = SLICE_START + index * SLICE_ANGLE;
  const sliceToppings = toppings.filter((item) => toppingSlice(item) === index);
  const sliceBubbles = cheeseBubbles.filter((item) => toppingSlice(item) === index);
  const sliceSpots = bakedSpots.filter((item) => toppingSlice(item) === index);

  useFrame(() => {
    const offset = slicePosition(index, separationRef.current);
    slice.current.position.set(offset[0], offset[1], offset[2]);
  });

  return (
    <group ref={slice}>
      <mesh position={[0, 0.16, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.52, 2.72, 0.3, mobile ? 20 : 32, 1, false, start, SLICE_ANGLE - 0.014]} />
        <meshPhysicalMaterial color="#c96832" roughness={0.76} metalness={0.01} clearcoat={0.08} />
      </mesh>
      <mesh position={[0, 0.32, 0]} receiveShadow>
        <cylinderGeometry args={[2.4, 2.44, 0.045, mobile ? 20 : 32, 1, false, start, SLICE_ANGLE - 0.02]} />
        <meshStandardMaterial color="#a94128" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.38, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.34, 2.39, 0.12, mobile ? 20 : 32, 1, false, start, SLICE_ANGLE - 0.018]} />
        <meshPhysicalMaterial map={cheeseTexture} color="#f6ce71" roughness={0.44} metalness={0.01} clearcoat={0.22} clearcoatRoughness={0.25} />
      </mesh>
      <CrustArc start={start + 0.012} length={SLICE_ANGLE - 0.024} />
      {sliceBubbles.map((item, bubbleIndex) => <CheeseBubble key={`bubble-${bubbleIndex}`} item={item} />)}
      {sliceSpots.map((item, spotIndex) => <BakedSpot key={`spot-${spotIndex}`} item={item} />)}
      {sliceToppings.map((item, toppingIndex) => <Topping key={`${item.type}-${toppingIndex}`} item={item} />)}
    </group>
  );
}

function CheeseBridge({ index, separationRef }: { index: number; separationRef: React.MutableRefObject<number> }) {
  const bridge = useRef<THREE.Mesh>(null!);
  const boundary = SLICE_START + index * SLICE_ANGLE;
  const anchorRadius = index % 2 === 0 ? 1.62 : 1.12;
  const base = new THREE.Vector3(Math.cos(boundary) * anchorRadius, 0.52, Math.sin(boundary) * anchorRadius);
  const up = new THREE.Vector3(0, 1, 0);

  useFrame(() => {
    const separation = separationRef.current;
    const start = base.clone().add(new THREE.Vector3(...slicePosition(index % SLICE_COUNT, separation)));
    const end = base.clone().add(new THREE.Vector3(...slicePosition((index + SLICE_COUNT - 1) % SLICE_COUNT, separation)));
    const direction = end.clone().sub(start);
    const length = direction.length();
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    midpoint.y -= separation * (index % 2 === 0 ? 0.34 : 0.2);
    bridge.current.position.copy(midpoint);
    bridge.current.quaternion.setFromUnitVectors(up, direction.normalize());
    bridge.current.scale.set(1, Math.max(length * 1.06, 0.001), 1);
  });

  return (
    <mesh ref={bridge} scale={[1, 0.001, 1]} castShadow>
      <capsuleGeometry args={[0.045, 1, 5, 10]} />
      <meshPhysicalMaterial color="#f2c85f" roughness={0.38} clearcoat={0.2} />
    </mesh>
  );
}

function SteamPuff({ position, delay }: { position: [number, number, number]; delay: number }) {
  const puff = useRef<THREE.Mesh>(null!);
  const material = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(({ clock }) => {
    const progress = ((clock.elapsedTime + delay) % 2.8) / 2.8;
    puff.current.position.y = position[1] + progress * 1.12;
    puff.current.position.x = position[0] + Math.sin(progress * Math.PI * 2 + delay) * 0.14;
    puff.current.scale.setScalar(0.38 + progress * 0.85);
    material.current.opacity = 0.16 * (1 - progress);
  });

  return (
    <mesh ref={puff} position={position}>
      <sphereGeometry args={[0.22, 12, 12]} />
      <meshBasicMaterial ref={material} color="#fff5df" transparent opacity={0.16} depthWrite={false} />
    </mesh>
  );
}

function BakingBoard() {
  const boardTexture = useMemo(() => makeSpeckleTexture("#a97d58", "#e5bd88", 1.6), []);
  return (
    <group position={[0, -0.08, 0]}>
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[3.18, 3.28, 0.18, 64]} />
        <meshStandardMaterial map={boardTexture} color="#b48a62" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[3.02, 3.04, 0.035, 64]} />
        <meshStandardMaterial color="#d3aa7a" roughness={0.82} />
      </mesh>
    </group>
  );
}

function PizzaCutter({ progressRef, mobile }: { progressRef: React.MutableRefObject<number>; mobile: boolean }) {
  const cutter = useRef<THREE.Group>(null!);
  const wheel = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    const progress = progressRef.current;
    const x = THREE.MathUtils.lerp(2.85, -2.74, progress);
    const z = THREE.MathUtils.lerp(1.42, -1.28, progress);
    const y = 1.9 - Math.sin(progress * Math.PI) * 1.46;
    cutter.current.position.lerp(new THREE.Vector3(x, y, z), 0.12);
    cutter.current.rotation.z = THREE.MathUtils.lerp(-0.58, -0.42, progress);
    cutter.current.rotation.y = THREE.MathUtils.lerp(-0.52, 0.32, progress);
    wheel.current.rotation.y -= delta * (5 + progress * 8);
  });

  return (
    <group ref={cutter} scale={mobile ? 0.78 : 1}>
      <mesh ref={wheel} position={[0, 0.44, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.54, 0.54, 0.075, 48]} />
        <meshPhysicalMaterial color="#e1b96e" roughness={0.22} metalness={0.94} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, 0.44, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.49, 0.035, 12, 44]} />
        <meshStandardMaterial color="#ffe0a0" roughness={0.18} metalness={0.96} />
      </mesh>
      <mesh position={[0, -0.08, 0]} rotation={[0, 0, 0.12]} castShadow>
        <boxGeometry args={[0.12, 1.28, 0.15]} />
        <meshStandardMaterial color="#b67b37" roughness={0.38} metalness={0.68} />
      </mesh>
      <mesh position={[0, -0.76, 0]} rotation={[0, 0, 0.12]} castShadow>
        <capsuleGeometry args={[0.19, 0.86, 6, 16]} />
        <meshStandardMaterial color="#332a23" roughness={0.3} metalness={0.12} />
      </mesh>
      <mesh position={[0, -0.39, 0]} rotation={[0, 0, 0.12]}>
        <boxGeometry args={[0.24, 0.08, 0.22]} />
        <meshStandardMaterial color="#d4a15a" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

function PizzaModel({ progressRef, mobile }: { progressRef: React.MutableRefObject<number>; mobile: boolean }) {
  const pizza = useRef<THREE.Group>(null!);
  const separationRef = useRef(0);

  useFrame((_, delta) => {
    const progress = progressRef.current;
    const easedCut = smoothStep(clamp((progress - 0.06) / 0.78, 0, 1));
    separationRef.current = THREE.MathUtils.damp(separationRef.current, easedCut * 0.62, 7, delta);
    pizza.current.rotation.y = THREE.MathUtils.damp(pizza.current.rotation.y, -0.26 + progress * 0.3, 4, delta);
    pizza.current.rotation.x = THREE.MathUtils.damp(pizza.current.rotation.x, 0.08 + progress * 0.045, 4, delta);
    pizza.current.position.y = THREE.MathUtils.damp(pizza.current.position.y, Math.sin(progress * Math.PI) * 0.1, 4, delta);
  });

  return (
    <group ref={pizza}>
      <BakingBoard />
      {Array.from({ length: SLICE_COUNT }, (_, index) => <PizzaSlice key={index} index={index} separationRef={separationRef} mobile={mobile} />)}
      {Array.from({ length: SLICE_COUNT }, (_, index) => <CheeseBridge key={index} index={index} separationRef={separationRef} />)}
      <SteamPuff position={[-0.7, 0.54, -0.4]} delay={0.2} />
      <SteamPuff position={[0.3, 0.54, 0.2]} delay={1.3} />
      <SteamPuff position={[0.86, 0.54, -0.12]} delay={2.1} />
      <PizzaCutter progressRef={progressRef} mobile={mobile} />
    </group>
  );
}

function SceneContents({ progressRef, mobile }: { progressRef: React.MutableRefObject<number>; mobile: boolean }) {
  const { camera } = useThree();
  const progress = useRef(0);

  useFrame((_, delta) => {
    progress.current = THREE.MathUtils.damp(progress.current, progressRef.current, 5, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, mobile ? 2.25 : 5.35, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, mobile ? 5.75 : 4.72, 3, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, mobile ? 7.4 : 6.9, 3, delta);
    camera.lookAt(0, 0.22, 0);
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
        gl.toneMappingExposure = mobile ? 1.08 : 1.18;
      }}
    >
      <PerspectiveCamera makeDefault position={[5.35, 4.72, 6.9]} fov={40} near={0.1} far={100} />
      <ambientLight intensity={1.18} color="#ffe0b7" />
      <directionalLight castShadow={!mobile} position={[4.5, 8.5, 4]} intensity={4.1} color="#fff0d0" shadow-mapSize-width={mobile ? 512 : 1024} shadow-mapSize-height={mobile ? 512 : 1024} shadow-bias={-0.0002} />
      <directionalLight position={[-4, 3.5, -1]} intensity={1.9} color="#e97156" />
      <pointLight position={[0, 3.5, 1.2]} intensity={2.25} distance={8} color="#ffb659" />
      <Environment preset="apartment" environmentIntensity={0.72} />
      <Float speed={0.45} rotationIntensity={0.04} floatIntensity={0.06} floatingRange={[-0.025, 0.025]}>
        <SceneContents progressRef={progressRef} mobile={mobile} />
      </Float>
      <ContactShadows position={[0, -0.16, 0]} opacity={0.34} scale={7.8} blur={2.6} far={4.3} resolution={mobile ? 256 : 512} />
    </Canvas>
  );
}
