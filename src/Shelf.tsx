import { useMemo } from 'react'
import { BOARD_T, MATERIALS, cellSize, usePlanner } from './store'

const cm = (v: number) => v / 100

export function Shelf() {
  const { width, height, depth, rows, material, backPanel, cells, tool, hover, setHover, place } = usePlanner()
  const { cols, colW, rowH } = cellSize(width, height, rows)
  const color = MATERIALS[material].color
  const t = BOARD_T

  // 칸 중심 좌표 (cm, 선반 중앙이 원점, 바닥이 y=0)
  const cellPos = useMemo(() => {
    const out: { key: string; x: number; y: number }[] = []
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < rows; r++)
        out.push({
          key: `${c}-${r}`,
          x: -width / 2 + t + c * (colW + t) + colW / 2,
          y: t + r * (rowH + t) + rowH / 2,
        })
    return out
  }, [cols, rows, width, colW, rowH, t])

  const mat = <meshStandardMaterial color={color} roughness={0.7} />

  return (
    <group>
      {/* 세로 패널 */}
      {Array.from({ length: cols + 1 }, (_, i) => (
        <mesh key={`v${i}`} castShadow position={[cm(-width / 2 + t / 2 + i * (colW + t)), cm(height / 2), 0]}>
          <boxGeometry args={[cm(t), cm(height), cm(depth)]} />
          {mat}
        </mesh>
      ))}
      {/* 가로 선반 */}
      {Array.from({ length: cols }, (_, c) =>
        Array.from({ length: rows + 1 }, (_, r) => (
          <mesh
            key={`h${c}-${r}`}
            castShadow
            receiveShadow
            position={[cm(-width / 2 + t + c * (colW + t) + colW / 2), cm(t / 2 + r * (rowH + t)), 0]}
          >
            <boxGeometry args={[cm(colW), cm(t), cm(depth)]} />
            {mat}
          </mesh>
        )),
      )}
      {backPanel && (
        <mesh position={[0, cm(height / 2), cm(-depth / 2 + 0.4)]}>
          <boxGeometry args={[cm(width - 0.4), cm(height - 0.4), cm(0.6)]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      )}

      {/* 칸 모듈 + 스냅 하이라이트 */}
      {cellPos.map(({ key, x, y }) => {
        const kind = cells[key]
        const hovered = hover === key
        return (
          <group key={key} position={[cm(x), cm(y), 0]}>
            {kind === 'drawer' && (
              <group>
                <mesh castShadow position={[0, 0, cm(depth / 2 - 1)]}>
                  <boxGeometry args={[cm(colW - 0.4), cm(rowH - 0.4), cm(2)]} />
                  <meshStandardMaterial color={color} roughness={0.55} />
                </mesh>
                <mesh position={[0, 0, cm(depth / 2 + 0.8)]}>
                  <boxGeometry args={[cm(Math.min(12, colW * 0.4)), cm(1), cm(1.6)]} />
                  <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
                </mesh>
              </group>
            )}
            {kind === 'door' && (
              <group>
                <mesh castShadow position={[0, 0, cm(depth / 2 - 0.9)]}>
                  <boxGeometry args={[cm(colW - 0.4), cm(rowH - 0.4), cm(1.8)]} />
                  <meshStandardMaterial color={color} roughness={0.5} />
                </mesh>
                <mesh position={[cm(colW / 2 - 4), 0, cm(depth / 2 + 0.8)]}>
                  <boxGeometry args={[cm(1), cm(Math.min(12, rowH * 0.4)), cm(1.6)]} />
                  <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
                </mesh>
              </group>
            )}
            {/* 클릭·호버 영역 */}
            <mesh
              position={[0, 0, cm(depth / 2 + 2)]}
              onPointerOver={(e) => (e.stopPropagation(), setHover(key))}
              onPointerOut={() => setHover(null)}
              onClick={(e) => (e.stopPropagation(), place(key))}
            >
              <boxGeometry args={[cm(colW), cm(rowH), cm(0.2)]} />
              <meshBasicMaterial
                transparent
                opacity={hovered ? 0.35 : 0}
                color={tool === 'erase' ? '#ef4444' : '#3b82f6'}
                depthWrite={false}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
