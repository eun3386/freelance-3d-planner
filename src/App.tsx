import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Shelf } from './Shelf'
import { Panel } from './Panel'
import { usePlanner } from './store'

export function App() {
  const height = usePlanner((s) => s.height)
  return (
    <div className="app">
      <div className="viewport">
        <Canvas shadows camera={{ position: [1.6, 1.3, 2.6], fov: 40 }}>
          <color attach="background" args={['#eef0f3']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 5, 4]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} />
          <hemisphereLight args={['#ffffff', '#c9ced6', 0.8]} />
          <group position={[0, 0, 0]}>
            <Shelf />
          </group>
          <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={8} blur={2.4} far={3} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <shadowMaterial opacity={0.15} />
          </mesh>
          <OrbitControls
            makeDefault
            target={[0, height / 200, 0]}
            maxPolarAngle={Math.PI / 2 - 0.02}
            minDistance={1}
            maxDistance={7}
          />
        </Canvas>
        <div className="hint">드래그: 회전 · 휠: 확대/축소 · 칸 클릭: 모듈 배치</div>
      </div>
      <Panel />
    </div>
  )
}
