import { computeBom, won } from './bom'
import { MATERIALS, usePlanner, type MaterialId, type Tool } from './store'

function Slider(props: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <label className="row">
      <span>{props.label}</span>
      <input type="range" min={props.min} max={props.max} step={props.step ?? 1} value={props.value} onChange={(e) => props.onChange(+e.target.value)} />
      <b>{props.value}</b>
    </label>
  )
}

const TOOLS: { id: Tool; label: string }[] = [
  { id: 'drawer', label: '서랍' },
  { id: 'door', label: '도어' },
  { id: 'erase', label: '지우기' },
]

export function Panel() {
  const s = usePlanner()
  const bom = computeBom(s)

  const copyQuote = () => {
    const text = [
      `모듈러 선반 견적 (${s.width}×${s.height}×${s.depth}cm, ${MATERIALS[s.material].label})`,
      ...bom.lines.map((l) => `- ${l.name} ${l.spec} × ${l.qty} = ${won(l.qty * l.unit)}`),
      `합계: ${won(bom.total)}`,
    ].join('\n')
    navigator.clipboard?.writeText(text)
  }

  return (
    <aside className="panel">
      <h1>모듈러 선반 플래너</h1>
      <p className="sub">치수를 바꾸면 부품 수량과 견적이 실시간으로 계산됩니다.</p>

      <section>
        <h2>치수 (cm)</h2>
        <Slider label="가로" value={s.width} min={40} max={240} step={5} onChange={(v) => s.set({ width: v })} />
        <Slider label="세로" value={s.height} min={80} max={240} step={5} onChange={(v) => s.set({ height: v })} />
        <Slider label="깊이" value={s.depth} min={20} max={50} step={1} onChange={(v) => s.set({ depth: v })} />
        <Slider label="단 수" value={s.rows} min={2} max={8} onChange={(v) => s.set({ rows: v })} />
        <p className="note">{bom.cols}열 × {s.rows}단 · 칸 내부 {bom.colW.toFixed(1)} × {bom.rowH.toFixed(1)}cm</p>
      </section>

      <section>
        <h2>마감</h2>
        <div className="chips">
          {(Object.keys(MATERIALS) as MaterialId[]).map((id) => (
            <button key={id} className={s.material === id ? 'on' : ''} onClick={() => s.set({ material: id })}>
              <i style={{ background: MATERIALS[id].color }} />
              {MATERIALS[id].label}
            </button>
          ))}
        </div>
        <label className="check">
          <input type="checkbox" checked={s.backPanel} onChange={(e) => s.set({ backPanel: e.target.checked })} /> 후면 패널
        </label>
      </section>

      <section>
        <h2>모듈 (칸에 스냅 배치)</h2>
        <div className="chips">
          {TOOLS.map((t) => (
            <button key={t.id} className={s.tool === t.id ? 'on' : ''} onClick={() => s.setTool(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>부품 목록 (BOM)</h2>
        <table>
          <tbody>
            {bom.lines.map((l) => (
              <tr key={l.name}>
                <td>
                  {l.name}
                  <small>{l.spec}</small>
                </td>
                <td className="r">×{l.qty}</td>
                <td className="r">{won(l.qty * l.unit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="total">
          <span>예상 견적</span>
          <b>{won(bom.total)}</b>
        </div>
        <div className="actions">
          <button onClick={copyQuote}>견적 복사</button>
          <button onClick={() => s.reset()}>초기화</button>
        </div>
      </section>
    </aside>
  )
}
