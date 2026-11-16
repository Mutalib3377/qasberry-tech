// components/marketing/robotics/robot-scene.tsx
// The hero's Three.js scene: a friendly procedural robot (the Qasberry bot),
// a GLSL "energy blueprint" backdrop, and a twinkling particle field.
// Loaded via next/dynamic (ssr: false) from hero-section.tsx.
//
// Theme: every shader shares one `uLight` uniform (0 = dark, 1 = light),
// eased toward <html data-rx-theme> each frame so the scene cross-fades
// when the theme changes.
'use client'

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { gsap } from './gsap'

/* ────────────────────────────────────────────────────────────────────
   Theme driver
   ──────────────────────────────────────────────────────────────────── */

// Shared by reference across every material's uniforms
const uLight = { value: 0 }

function themeTarget() {
  return document.documentElement.getAttribute('data-rx-theme') === 'light' ? 1 : 0
}

function ThemeDriver({ reduced }: { reduced: boolean }) {
  // Start at the current theme — no fade on first load
  useLayoutEffect(() => {
    uLight.value = themeTarget()
  }, [])

  useFrame((_, delta) => {
    const target = themeTarget()
    if (reduced) {
      uLight.value = target
      return
    }
    uLight.value += (target - uLight.value) * (1 - Math.exp(-delta * 9))
  })
  return null
}

// Premultiplied-alpha blending: a shader that outputs (rgb·a, 0) blends
// additively, (rgb·a, a) blends normally. Glows use additive on dark and
// normal on light (additive light is invisible on a pale background), with
// uLight choosing between them inside the shader.
const PREMULTIPLIED = {
  transparent: true,
  depthWrite: false,
  blending: THREE.CustomBlending,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneMinusSrcAlphaFactor,
} as const

/* ────────────────────────────────────────────────────────────────────
   GLSL backdrop: gradient + blueprint grid + traveling data pulses
   ──────────────────────────────────────────────────────────────────── */

const BACKDROP_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const BACKDROP_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uLight;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(2.4, 1.5);
    float d = length(p * vec2(1.0, 1.35));
    float breathe = 0.82 + 0.18 * sin(uTime * 0.8);

    // Shared pattern masks
    vec2 g = abs(fract(p * 6.0) - 0.5);
    float line = smoothstep(0.465, 0.5, max(g.x, g.y));
    float fade = exp(-1.1 * d);
    float rowId = floor(p.y * 6.0);
    float onRow = smoothstep(0.455, 0.5, g.y);
    float seed = hash(vec2(rowId, 7.0));
    float pulseX = fract(p.x * 0.22 - uTime * (0.04 + 0.05 * seed) + seed);
    float pulse = exp(-30.0 * abs(pulseX - 0.5)) * step(0.62, seed);
    float sweep = exp(-18.0 * abs(fract((p.x + p.y) * 0.18 - uTime * 0.02) - 0.5));
    float edge = smoothstep(0.55, 1.5, length(p));

    // ── Dark: deep-space navy, emissive energy ──
    vec3 dark = mix(vec3(0.012, 0.015, 0.038), vec3(0.024, 0.032, 0.075),
                    smoothstep(-0.9, 0.7, p.y));
    dark += vec3(0.050, 0.075, 0.210) * exp(-2.4 * d * d);
    dark += vec3(0.026, 0.120, 0.165) * exp(-6.5 * d * d) * breathe;
    dark += vec3(0.075, 0.100, 0.230) * line * 0.26 * fade;
    dark += vec3(0.130, 0.520, 0.700) * onRow * pulse * fade * 1.4;
    dark += vec3(0.030, 0.060, 0.140) * sweep;
    dark *= 1.0 - 0.5 * edge;

    // ── Light: cool paper, ink-blue blueprint, cyan data ──
    vec3 light = mix(vec3(0.925, 0.940, 0.985), vec3(0.972, 0.976, 0.998),
                     smoothstep(-0.9, 0.7, p.y));
    light = mix(light, vec3(0.835, 0.855, 1.000), exp(-2.4 * d * d) * 0.55);
    light = mix(light, vec3(0.820, 0.955, 0.995), exp(-6.5 * d * d) * 0.45 * breathe);
    light = mix(light, vec3(0.380, 0.440, 0.780), line * 0.12 * fade);
    light = mix(light, vec3(0.030, 0.560, 0.760), onRow * pulse * fade * 0.75);
    light = mix(light, vec3(1.0), sweep * 0.22);
    light = mix(light, vec3(0.940, 0.950, 0.985), edge * 0.6);

    gl_FragColor = vec4(mix(dark, light, uLight), 1.0);
  }
`

function EnergyBackdrop() {
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uLight }), [])
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime
  })
  return (
    <mesh position={[0, 0.4, -7]} renderOrder={-2}>
      <planeGeometry args={[34, 16]} />
      <shaderMaterial
        vertexShader={BACKDROP_VERT}
        fragmentShader={BACKDROP_FRAG}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Particle field: slow-drifting, twinkling motes
   ──────────────────────────────────────────────────────────────────── */

const PARTICLE_VERT = /* glsl */ `
  attribute float aPhase;
  attribute float aSize;
  attribute vec3 aColor;
  varying float vPhase;
  varying vec3 vColor;
  uniform float uTime;
  void main() {
    vPhase = aPhase;
    vColor = aColor;
    vec3 p = position;
    p.y += sin(uTime * 0.25 + aPhase * 6.2831) * 0.35;
    p.x += cos(uTime * 0.18 + aPhase * 6.2831) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * (260.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const PARTICLE_FRAG = /* glsl */ `
  precision highp float;
  varying float vPhase;
  varying vec3 vColor;
  uniform float uTime;
  uniform float uLight;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    float twinkle = 0.55 + 0.45 * sin(uTime * (1.2 + vPhase) + vPhase * 40.0);
    float a = exp(-6.0 * d * d) * twinkle * mix(0.85, 0.5, uLight);
    vec3 col = mix(vColor, vColor * 0.55, uLight); // deeper ink on light
    gl_FragColor = vec4(col * a, a * uLight);
  }
`

function ParticleField({ count = 320 }: { count?: number }) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uLight }), [])

  const { positions, phases, sizes, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    const palette = [new THREE.Color('#4FE3FF'), new THREE.Color('#8B7CFF'), new THREE.Color('#5E8BFF')]
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 22
      positions[i * 3 + 1] = (Math.random() - 0.5) * 11 + 0.5
      positions[i * 3 + 2] = -1 - Math.random() * 5
      phases[i] = Math.random()
      sizes[i] = 0.02 + Math.random() * 0.055
      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3 + 0] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return { positions, phases, sizes, colors }
  }, [count])

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <points renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={PARTICLE_VERT}
        fragmentShader={PARTICLE_FRAG}
        uniforms={uniforms}
        {...PREMULTIPLIED}
      />
    </points>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Soft glow sprite (fakes bloom without postprocessing)
   ──────────────────────────────────────────────────────────────────── */

const GLOW_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform vec3 uColorLight;
  uniform float uIntensity;
  uniform float uIntensityLight;
  uniform float uLight;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = exp(-3.2 * d * d) * mix(uIntensity, uIntensityLight, uLight);
    vec3 col = mix(uColor, uColorLight, uLight);
    gl_FragColor = vec4(col * a, a * uLight);
  }
`

function GlowPlane({
  color,
  lightColor,
  size,
  intensity = 0.5,
  lightIntensity = intensity,
  position,
}: {
  color: string
  lightColor: string
  size: number
  intensity?: number
  lightIntensity?: number
  position: [number, number, number]
}) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uColorLight: { value: new THREE.Color(lightColor) },
      uIntensity: { value: intensity },
      uIntensityLight: { value: lightIntensity },
      uLight,
    }),
    [color, lightColor, intensity, lightIntensity]
  )
  return (
    <mesh position={position}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        vertexShader={BACKDROP_VERT}
        fragmentShader={GLOW_FRAG}
        uniforms={uniforms}
        {...PREMULTIPLIED}
      />
    </mesh>
  )
}

/* ────────────────────────────────────────────────────────────────────
   QasBot — friendly procedural robot. Floats, tracks the pointer,
   blinks, and pulses its chest core and antenna tip.
   ──────────────────────────────────────────────────────────────────── */

const SHELL = '#E9EDFB' // off-white shell
const DARK = '#0A0E1F' // face plate / joints
const CYAN = '#4FE3FF'
const VIOLET = '#8B7CFF'

function QasBot({ reduced }: { reduced: boolean }) {
  const root = useRef<THREE.Group>(null)
  const floater = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const handL = useRef<THREE.Mesh>(null)
  const handR = useRef<THREE.Mesh>(null)
  const eyeL = useRef<THREE.Mesh>(null)
  const eyeR = useRef<THREE.Mesh>(null)
  const core = useRef<THREE.MeshStandardMaterial>(null)
  const antennaTip = useRef<THREE.MeshStandardMaterial>(null)
  const ring = useRef<THREE.Mesh>(null)

  const pointer = useRef({ x: 0, y: 0 })
  const blink = useRef({ next: 2.4 })

  // Pointer tracking via window — the canvas sits behind the hero content
  // with pointer-events: none, so R3F's own pointer events never fire.
  useEffect(() => {
    if (reduced) return
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced])

  // Entrance: rise + settle (power4.out). Skipped under reduced motion.
  useEffect(() => {
    const g = root.current
    if (!g) return
    if (reduced) {
      g.position.y = 0
      g.scale.setScalar(1)
      return
    }
    g.position.y = -0.7
    g.scale.setScalar(0.92)
    const tween1 = gsap.to(g.position, { y: 0, duration: 1.3, ease: 'power4.out', delay: 0.15 })
    const tween2 = gsap.to(g.scale, { x: 1, y: 1, z: 1, duration: 1.3, ease: 'power4.out', delay: 0.15 })
    return () => {
      tween1.kill()
      tween2.kill()
    }
  }, [reduced])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (!reduced && floater.current) {
      // Idle float (separate group so it never fights the entrance tween on root)
      floater.current.position.y = Math.sin(t * 0.9) * 0.14
      floater.current.rotation.y = THREE.MathUtils.lerp(floater.current.rotation.y, pointer.current.x * 0.22, 0.04)
    }

    if (!reduced && head.current) {
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, pointer.current.x * 0.42, 0.07)
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, pointer.current.y * 0.26, 0.07)
      head.current.position.y = 1.18 + Math.sin(t * 0.9 + 0.4) * 0.05
    }

    if (!reduced && body.current) {
      body.current.rotation.z = Math.sin(t * 0.7) * 0.02
    }

    if (!reduced && handL.current && handR.current) {
      handL.current.position.y = -0.25 + Math.sin(t * 1.1 + 1.2) * 0.1
      handR.current.position.y = -0.25 + Math.sin(t * 1.1 + 2.6) * 0.1
    }

    // Blink
    if (eyeL.current && eyeR.current) {
      let s = 1
      if (!reduced) {
        const b = blink.current
        const dt = t - b.next
        if (dt > 0) {
          if (dt < 0.22) s = 1 - Math.sin((dt / 0.22) * Math.PI) * 0.92
          else b.next = t + 2.2 + Math.random() * 2.8
        }
      }
      eyeL.current.scale.y = s
      eyeR.current.scale.y = s
    }

    // Pulsing emissives
    const pulse = reduced ? 1 : 0.75 + 0.25 * Math.sin(t * 2.1)
    if (core.current) core.current.emissiveIntensity = 1.6 * pulse
    if (antennaTip.current) antennaTip.current.emissiveIntensity = 2.2 * (reduced ? 1 : 0.6 + 0.4 * Math.sin(t * 3.1))

    if (!reduced && ring.current) {
      ring.current.rotation.z = t * 0.5
    }
  })

  return (
    <group ref={root}>
      <group ref={floater}>
        {/* Halo glows behind the bot — lavender/cyan wash on light */}
        <GlowPlane color="#3B4FD8" lightColor="#A5B4FC" size={9} intensity={0.34} lightIntensity={0.5} position={[0, 0.5, -2.5]} />
        <GlowPlane color={CYAN} lightColor="#67E8F9" size={4.4} intensity={0.22} lightIntensity={0.28} position={[0, 0.6, -2.2]} />

        {/* ── Head ── */}
        <group ref={head} position={[0, 1.18, 0]}>
          <RoundedBox args={[2.05, 1.55, 1.45]} radius={0.42} smoothness={8}>
            <meshStandardMaterial color={SHELL} metalness={0.3} roughness={0.32} />
          </RoundedBox>

          {/* Face plate */}
          <RoundedBox args={[1.5, 0.95, 0.24]} radius={0.3} smoothness={6} position={[0, -0.02, 0.68]}>
            <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.25} />
          </RoundedBox>

          {/* Eyes */}
          <mesh ref={eyeL} position={[-0.33, 0.06, 0.83]}>
            <capsuleGeometry args={[0.095, 0.16, 6, 12]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={2.4} toneMapped={false} />
          </mesh>
          <mesh ref={eyeR} position={[0.33, 0.06, 0.83]}>
            <capsuleGeometry args={[0.095, 0.16, 6, 12]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={2.4} toneMapped={false} />
          </mesh>

          {/* Smile — a thin half-torus */}
          <mesh position={[0, -0.26, 0.82]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.16, 0.028, 10, 24, Math.PI]} />
            <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.6} toneMapped={false} />
          </mesh>

          {/* Ears */}
          <mesh position={[-1.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.18, 20]} />
            <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[1.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.18, 20]} />
            <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.3} />
          </mesh>

          {/* Antenna */}
          <mesh position={[0, 0.98, 0]}>
            <cylinderGeometry args={[0.035, 0.05, 0.42, 10]} />
            <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.26, 0]}>
            <sphereGeometry args={[0.11, 18, 18]} />
            <meshStandardMaterial ref={antennaTip} color={VIOLET} emissive={VIOLET} emissiveIntensity={2.2} toneMapped={false} />
          </mesh>
        </group>

        {/* ── Body ── */}
        <group ref={body} position={[0, -0.35, 0]}>
          <RoundedBox args={[1.5, 1.25, 1.05]} radius={0.34} smoothness={8}>
            <meshStandardMaterial color={SHELL} metalness={0.3} roughness={0.35} />
          </RoundedBox>

          {/* Chest core — puck facing the camera with a glowing disc */}
          <mesh position={[0, 0.06, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.14, 28]} />
            <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.06, 0.58]}>
            <circleGeometry args={[0.15, 28]} />
            <meshStandardMaterial
              ref={core}
              color={CYAN}
              emissive={CYAN}
              emissiveIntensity={1.6}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* Floating hands */}
        <mesh ref={handL} position={[-1.15, -0.25, 0]}>
          <sphereGeometry args={[0.21, 20, 20]} />
          <meshStandardMaterial color={SHELL} metalness={0.3} roughness={0.35} />
        </mesh>
        <mesh ref={handR} position={[1.15, -0.25, 0]}>
          <sphereGeometry args={[0.21, 20, 20]} />
          <meshStandardMaterial color={SHELL} metalness={0.3} roughness={0.35} />
        </mesh>

        {/* Hover ring beneath — glow doubles as a soft violet shadow on light */}
        <mesh ref={ring} position={[0, -1.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85, 0.02, 10, 64]} />
          <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
        <GlowPlane color={VIOLET} lightColor="#7C6CF5" size={2.6} intensity={0.3} lightIntensity={0.32} position={[0, -1.35, 0.1]} />
      </group>
    </group>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Lights: brighter, softer key in light mode so the white shell reads as
   white (not gray) against the pale backdrop; colored rims stay subtle.
   ──────────────────────────────────────────────────────────────────── */

function SceneLights() {
  const ambient = useRef<THREE.AmbientLight>(null)
  const key = useRef<THREE.DirectionalLight>(null)
  const rimCyan = useRef<THREE.PointLight>(null)
  const rimViolet = useRef<THREE.PointLight>(null)

  useFrame(() => {
    const l = uLight.value
    if (ambient.current) ambient.current.intensity = THREE.MathUtils.lerp(0.55, 1.35, l)
    if (key.current) key.current.intensity = THREE.MathUtils.lerp(1.25, 1.9, l)
    if (rimCyan.current) rimCyan.current.intensity = THREE.MathUtils.lerp(14, 7, l)
    if (rimViolet.current) rimViolet.current.intensity = THREE.MathUtils.lerp(10, 5, l)
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={0.55} />
      <directionalLight ref={key} position={[4, 5, 6]} intensity={1.25} color="#DCE4FF" />
      <pointLight ref={rimCyan} position={[-5, 1, 3]} intensity={14} color={CYAN} />
      <pointLight ref={rimViolet} position={[5, -1, 2]} intensity={10} color={VIOLET} />
    </>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Responsive placement: bot sits in the right column on wide screens,
   and is dropped entirely on narrow ones (backdrop + particles remain).
   ──────────────────────────────────────────────────────────────────── */

function BotRig({ reduced }: { reduced: boolean }) {
  const { viewport, size } = useThree()
  if (size.width < 1024) return null
  const x = Math.min(viewport.width * 0.24, 3.1)
  return (
    <group position={[x, -0.32, 0]} scale={0.8}>
      <QasBot reduced={reduced} />
    </group>
  )
}

/* ────────────────────────────────────────────────────────────────────
   Canvas root — default export for next/dynamic
   ──────────────────────────────────────────────────────────────────── */

export default function RobotScene({
  active = true,
  reduced = false,
}: {
  active?: boolean
  reduced?: boolean
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0.3, 7.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <ThemeDriver reduced={reduced} />
      <SceneLights />

      <EnergyBackdrop />
      <ParticleField />
      <BotRig reduced={reduced} />
    </Canvas>
  )
}
