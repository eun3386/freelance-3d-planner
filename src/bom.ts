import { BOARD_T, MATERIALS, cellSize, type MaterialId, type ModuleKind } from './store'

export interface BomLine {
  name: string
  spec: string
  qty: number
  unit: number
}

const BOARD_PER_M2 = 42000 // 원 / ㎡
const BACK_PER_M2 = 18000
const DRAWER = 38000
const DOOR = 29000
const CONNECTOR = 350

export function computeBom(p: {
  width: number
  height: number
  depth: number
  rows: number
  material: MaterialId
  backPanel: boolean
  cells: Record<string, ModuleKind>
}) {
  const { cols, colW, rowH } = cellSize(p.width, p.height, p.rows)
  const f = MATERIALS[p.material].priceFactor
  const m2 = (a: number, b: number) => (a * b) / 10000
  const lines: BomLine[] = []

  const side = Math.round(p.height * 10) / 10
  lines.push({
    name: '세로 패널',
    spec: `${side} × ${p.depth} × ${BOARD_T}cm`,
    qty: cols + 1,
    unit: Math.round((m2(p.height, p.depth) * BOARD_PER_M2 * f) / 100) * 100,
  })
  lines.push({
    name: '가로 선반',
    spec: `${colW.toFixed(1)} × ${p.depth} × ${BOARD_T}cm`,
    qty: cols * (p.rows + 1),
    unit: Math.round((m2(colW, p.depth) * BOARD_PER_M2 * f) / 100) * 100,
  })
  if (p.backPanel) {
    lines.push({
      name: '후면 패널',
      spec: `${p.width} × ${p.height}cm`,
      qty: 1,
      unit: Math.round((m2(p.width, p.height) * BACK_PER_M2) / 100) * 100,
    })
  }
  const drawers = Object.values(p.cells).filter((k) => k === 'drawer').length
  const doors = Object.values(p.cells).filter((k) => k === 'door').length
  if (drawers) lines.push({ name: '서랍 모듈', spec: `${colW.toFixed(1)} × ${rowH.toFixed(1)}cm`, qty: drawers, unit: Math.round(DRAWER * f) })
  if (doors) lines.push({ name: '도어 모듈', spec: `${colW.toFixed(1)} × ${rowH.toFixed(1)}cm`, qty: doors, unit: Math.round(DOOR * f) })

  const joints = (cols + 1) * (p.rows + 1)
  lines.push({ name: '결합 커넥터', spec: '캠락 세트', qty: joints * 2, unit: CONNECTOR })

  const total = lines.reduce((s, l) => s + l.qty * l.unit, 0)
  return { lines, total, cols, colW, rowH }
}

export const won = (n: number) => n.toLocaleString('ko-KR') + '원'
