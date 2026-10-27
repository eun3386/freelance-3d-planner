import { create } from 'zustand'

export type ModuleKind = 'drawer' | 'door'
export type Tool = ModuleKind | 'erase'
export type MaterialId = 'oak' | 'white' | 'walnut'

export const MATERIALS: Record<MaterialId, { label: string; color: string; priceFactor: number }> = {
  oak: { label: '오크', color: '#d8b886', priceFactor: 1 },
  white: { label: '화이트', color: '#f1efe9', priceFactor: 0.9 },
  walnut: { label: '월넛', color: '#6b4a34', priceFactor: 1.25 },
}

export const BOARD_T = 1.8 // cm
export const COL_TARGET = 40 // cm, 칸 폭 기준

interface PlannerState {
  width: number
  height: number
  depth: number
  rows: number
  material: MaterialId
  backPanel: boolean
  cells: Record<string, ModuleKind>
  tool: Tool
  hover: string | null
  set: (patch: Partial<Pick<PlannerState, 'width' | 'height' | 'depth' | 'rows' | 'material' | 'backPanel'>>) => void
  setTool: (t: Tool) => void
  setHover: (k: string | null) => void
  place: (key: string) => void
  reset: () => void
}

export const colsOf = (width: number) => Math.max(1, Math.round(width / COL_TARGET))

const initial = {
  width: 120,
  height: 160,
  depth: 35,
  rows: 4,
  material: 'oak' as MaterialId,
  backPanel: true,
  cells: { '0-0': 'drawer', '1-0': 'drawer', '2-1': 'door' } as Record<string, ModuleKind>,
}

export const usePlanner = create<PlannerState>((set, get) => ({
  ...initial,
  tool: 'drawer',
  hover: null,
  set: (patch) =>
    set((s) => {
      const next = { ...s, ...patch }
      const cols = colsOf(next.width)
      // 칸 수가 줄면 범위를 벗어난 모듈은 제거
      const cells = Object.fromEntries(
        Object.entries(next.cells).filter(([k]) => {
          const [c, r] = k.split('-').map(Number)
          return c < cols && r < next.rows
        }),
      )
      return { ...patch, cells }
    }),
  setTool: (tool) => set({ tool }),
  setHover: (hover) => set({ hover }),
  place: (key) => {
    const { tool, cells } = get()
    const next = { ...cells }
    if (tool === 'erase') delete next[key]
    else next[key] = tool
    set({ cells: next })
  },
  reset: () => set({ ...initial, tool: 'drawer', hover: null }),
}))

// 현재 치수에서 칸 하나의 내부 크기(cm)
export function cellSize(width: number, height: number, rows: number) {
  const cols = colsOf(width)
  return {
    cols,
    colW: (width - BOARD_T * (cols + 1)) / cols,
    rowH: (height - BOARD_T * (rows + 1)) / rows,
  }
}
