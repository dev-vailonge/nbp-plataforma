"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Fa } from "@/components/BrandMark";
import type { TelaShape, Viewport } from "@/types/database";

const PAL = ["#1C1C1A", "#185FA5", "#0F6E56", "#993C1D", "#993556", "#3C3489"];
const TOOLS: { id: string; icon: string; label: string }[] = [
  { id: "sel", icon: "fa-arrow-pointer", label: "Selecionar" },
  { id: "pan", icon: "fa-hand", label: "Mover" },
  { id: "ret", icon: "fa-square", label: "Retângulo" },
  { id: "eli", icon: "fa-circle", label: "Elipse" },
  { id: "set", icon: "fa-arrow-right", label: "Seta" },
  { id: "txt", icon: "fa-font", label: "Texto" },
  { id: "lap", icon: "fa-pencil", label: "Lápis" },
];

type Tool = "sel" | "pan" | "ret" | "eli" | "set" | "txt" | "lap";
type Box = { x: number; y: number; w: number; h: number };
type Editor = { x: number; y: number; index: number | null; value: string };

function rnd(s0: number) {
  let s = s0;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function lm(x1: number, y1: number, x2: number, y2: number, r: () => number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  let d = "";
  for (let k = 0; k < 2; k++) {
    const a = (r() - 0.5) * 2.4;
    const b = (r() - 0.5) * 2.4;
    const m = (r() - 0.5) * 3.2;
    d +=
      `M${x1 + nx * a} ${y1 + ny * a}` +
      ` Q${(x1 + x2) / 2 + nx * m} ${(y1 + y2) / 2 + ny * m}` +
      ` ${x2 + nx * b} ${y2 + ny * b} `;
  }
  return d;
}

function caminho(f: TelaShape): string {
  const r = rnd(f.s ?? 1);
  if (f.t === "ret" && f.w != null && f.h != null) {
    const a = f.x;
    const b = f.y;
    const c = f.x + f.w;
    const e = f.y + f.h;
    return lm(a, b, c, b, r) + lm(c, b, c, e, r) + lm(c, e, a, e, r) + lm(a, e, a, b, r);
  }
  if (f.t === "eli" && f.w != null && f.h != null) {
    const cx = f.x + f.w / 2;
    const cy = f.y + f.h / 2;
    const rx = Math.abs(f.w / 2);
    const ry = Math.abs(f.h / 2);
    let d = "";
    for (let k = 0; k < 2; k++) {
      const p: [number, number][] = [];
      for (let i = 0; i <= 22; i++) {
        const g = (i / 22) * Math.PI * 2;
        const j = (r() - 0.5) * 3.4;
        p.push([cx + Math.cos(g) * (rx + j), cy + Math.sin(g) * (ry + j)]);
      }
      d += `M${p[0][0]} ${p[0][1]}`;
      for (let i2 = 1; i2 < p.length; i2++) d += ` L${p[i2][0]} ${p[i2][1]}`;
      d += " Z ";
    }
    return d;
  }
  if (f.t === "set" && f.w != null && f.h != null) {
    const x2 = f.x + f.w;
    const y2 = f.y + f.h;
    const ang = Math.atan2(f.h, f.w);
    const ah = 12;
    return (
      lm(f.x, f.y, x2, y2, r) +
      lm(x2, y2, x2 - Math.cos(ang - 0.42) * ah, y2 - Math.sin(ang - 0.42) * ah, r) +
      lm(x2, y2, x2 - Math.cos(ang + 0.42) * ah, y2 - Math.sin(ang + 0.42) * ah, r)
    );
  }
  if (f.t === "lap" && f.pts && f.pts.length) {
    const pts = f.pts;
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2;
      const my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ` Q${pts[i][0]} ${pts[i][1]} ${mx} ${my}`;
    }
    return d;
  }
  return "";
}

function caixa(f: TelaShape): Box {
  if (f.t === "lap" && f.pts?.length) {
    const xs = f.pts.map((p) => p[0]);
    const ys = f.pts.map((p) => p[1]);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
  }
  if (f.t === "txt") return { x: f.x - 4, y: f.y - 21, w: (f.txt?.length ?? 0) * 11 + 8, h: 27 };
  const w = f.w ?? 0;
  const h = f.h ?? 0;
  return { x: Math.min(f.x, f.x + w), y: Math.min(f.y, f.y + h), w: Math.abs(w), h: Math.abs(h) };
}

function hit(shapes: TelaShape[], x: number, y: number) {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const b = caixa(shapes[i]);
    if (x >= b.x - 8 && x <= b.x + b.w + 8 && y >= b.y - 8 && y <= b.y + b.h + 8) return i;
  }
  return null;
}

export function PlanWhiteboard({
  monthLabel,
  initialShapes,
  initialViewport,
  onChange,
}: {
  monthLabel: string;
  initialShapes: TelaShape[];
  initialViewport?: Viewport;
  onChange?: (tela: TelaShape[], viewport: Viewport) => void;
}) {
  const patternId = useId().replace(/:/g, "");
  const canvasRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const shapesRef = useRef<TelaShape[]>(initialShapes);
  const viewRef = useRef<Viewport>(initialViewport ?? { ox: 0, oy: 0, z: 1 });
  const toolRef = useRef<Tool>("sel");
  const colorRef = useRef(0);
  const selectedRef = useRef<number | null>(null);
  const gesture = useRef<
    | { kind: "pan"; sx: number; sy: number; ox: number; oy: number }
    | { kind: "move"; index: number; x: number; y: number }
    | { kind: "draw"; index: number }
    | null
  >(null);
  const editingRef = useRef(false);

  const [shapes, setShapes] = useState<TelaShape[]>(initialShapes);
  const [view, setView] = useState<Viewport>(initialViewport ?? { ox: 0, oy: 0, z: 1 });
  const [tool, setTool] = useState<Tool>("sel");
  const [color, setColor] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [grande, setGrande] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [saved, setSaved] = useState(true);

  shapesRef.current = shapes;
  viewRef.current = view;
  toolRef.current = tool;
  colorRef.current = color;
  selectedRef.current = selected;

  function publish(nextShapes: TelaShape[], nextView: Viewport) {
    shapesRef.current = nextShapes;
    viewRef.current = nextView;
    setShapes(nextShapes);
    setView(nextView);
    setSaved(true);
    onChangeRef.current?.(nextShapes, nextView);
  }

  function screenPoint(event: { clientX: number; clientY: number }) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { sx: 0, sy: 0, x: 0, y: 0 };
    const v = viewRef.current;
    const sx = event.clientX - rect.left;
    const sy = event.clientY - rect.top;
    return { sx, sy, x: (sx - v.ox) / v.z, y: (sy - v.oy) / v.z };
  }

  function openEditor(x: number, y: number, index: number | null) {
    const current = index == null ? null : shapesRef.current[index];
    editingRef.current = true;
    setEditor({
      x,
      y,
      index,
      value: current?.txt ?? "",
    });
  }

  const editorRef = useRef<Editor | null>(null);
  editorRef.current = editor;

  function closeEditor(keep: boolean) {
    const current = editorRef.current;
    if (!current) return;
    editorRef.current = null;
    editingRef.current = false;
    setEditor(null);
    const value = current.value.trim();
    if (!keep || !value) return;
    const next = shapesRef.current.slice();
    if (current.index != null && next[current.index]) {
      next[current.index] = { ...next[current.index], txt: value };
    } else {
      next.push({
        t: "txt",
        x: current.x,
        y: current.y,
        txt: value,
        c: colorRef.current,
        s: 1,
      });
    }
    publish(next, viewRef.current);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let timer = 0;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const v = viewRef.current;
      let next = { ...v };
      if (event.ctrlKey || event.metaKey) {
        const sx = event.clientX - rect.left;
        const sy = event.clientY - rect.top;
        const nz = Math.max(0.3, Math.min(2.5, v.z * (event.deltaY < 0 ? 1.08 : 0.93)));
        next = {
          z: nz,
          ox: sx - (sx - v.ox) * (nz / v.z),
          oy: sy - (sy - v.oy) * (nz / v.z),
        };
      } else {
        next = { ...v, ox: v.ox - event.deltaX, oy: v.oy - event.deltaY };
      }
      viewRef.current = next;
      setView(next);
      setSaved(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (viewRef.current === next) publish(shapesRef.current, next);
      }, 180);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.clearTimeout(timer);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (editingRef.current || event.button === 2) return;
    const point = screenPoint(event);
    const currentTool = toolRef.current;
    if (currentTool === "pan" || event.button === 1) {
      gesture.current = {
        kind: "pan",
        sx: point.sx,
        sy: point.sy,
        ox: viewRef.current.ox,
        oy: viewRef.current.oy,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (currentTool === "txt") {
      event.preventDefault();
      const index = hit(shapesRef.current, point.x, point.y);
      const shape = index == null ? null : shapesRef.current[index];
      if (shape?.t === "txt") openEditor(shape.x, shape.y, index);
      else openEditor(point.x, point.y, null);
      return;
    }
    if (currentTool === "sel") {
      const index = hit(shapesRef.current, point.x, point.y);
      setSelected(index);
      selectedRef.current = index;
      if (index != null) {
        gesture.current = { kind: "move", index, x: point.x, y: point.y };
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      return;
    }
    const shape: TelaShape = {
      t: currentTool,
      x: point.x,
      y: point.y,
      w: 0,
      h: 0,
      c: colorRef.current,
      s: Math.floor(Math.random() * 900) + 1,
      pts: [[point.x, point.y]],
    };
    const next = [...shapesRef.current, shape];
    shapesRef.current = next;
    setShapes(next);
    setSaved(false);
    gesture.current = { kind: "draw", index: next.length - 1 };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const active = gesture.current;
    if (!active || editingRef.current) return;
    const point = screenPoint(event);
    if (active.kind === "pan") {
      const next = {
        ...viewRef.current,
        ox: active.ox + (point.sx - active.sx),
        oy: active.oy + (point.sy - active.sy),
      };
      viewRef.current = next;
      setView(next);
      setSaved(false);
      return;
    }
    if (active.kind === "move") {
      const dx = point.x - active.x;
      const dy = point.y - active.y;
      const next = shapesRef.current.map((shape, index) => {
        if (index !== active.index) return shape;
        if (shape.t === "lap" && shape.pts) {
          return { ...shape, pts: shape.pts.map((p) => [p[0] + dx, p[1] + dy]) };
        }
        return { ...shape, x: shape.x + dx, y: shape.y + dy };
      });
      shapesRef.current = next;
      setShapes(next);
      gesture.current = { ...active, x: point.x, y: point.y };
      setSaved(false);
      return;
    }
    const next = shapesRef.current.map((shape, index) => {
      if (index !== active.index) return shape;
      if (shape.t === "lap") return { ...shape, pts: [...(shape.pts ?? []), [point.x, point.y]] };
      return { ...shape, w: point.x - shape.x, h: point.y - shape.y };
    });
    shapesRef.current = next;
    setShapes(next);
  }

  function onPointerUp() {
    const active = gesture.current;
    gesture.current = null;
    if (!active) return;
    let next = shapesRef.current;
    if (active.kind === "draw") {
      const shape = next[active.index];
      const box = shape ? caixa(shape) : null;
      const tiny =
        shape &&
        ((shape.t !== "lap" && box && box.w < 4 && box.h < 4) ||
          (shape.t === "lap" && (shape.pts?.length ?? 0) < 3));
      if (tiny) next = next.filter((_, index) => index !== active.index);
    }
    publish(next, viewRef.current);
  }

  function chooseColor(index: number) {
    setColor(index);
    colorRef.current = index;
    if (selectedRef.current == null) return;
    const next = shapesRef.current.map((shape, shapeIndex) =>
      shapeIndex === selectedRef.current ? { ...shape, c: index } : shape,
    );
    publish(next, viewRef.current);
  }

  function removeSelected() {
    if (selectedRef.current == null) return;
    const next = shapesRef.current.filter((_, index) => index !== selectedRef.current);
    setSelected(null);
    selectedRef.current = null;
    publish(next, viewRef.current);
  }

  function clearBoard() {
    setSelected(null);
    selectedRef.current = null;
    publish([], viewRef.current);
  }

  function zoomBy(factor: number) {
    const v = viewRef.current;
    publish(shapesRef.current, { ...v, z: Math.max(0.3, Math.min(2.5, v.z * factor)) });
  }

  function center() {
    const canvas = canvasRef.current;
    const list = shapesRef.current;
    if (!canvas || list.length === 0) {
      publish(list, { ox: 0, oy: 0, z: 1 });
      return;
    }
    const boxes = list.map(caixa);
    const x1 = Math.min(...boxes.map((b) => b.x));
    const y1 = Math.min(...boxes.map((b) => b.y));
    const x2 = Math.max(...boxes.map((b) => b.x + b.w));
    const y2 = Math.max(...boxes.map((b) => b.y + b.h));
    const z = Math.max(
      0.3,
      Math.min(1.6, Math.min((canvas.clientWidth - 60) / (x2 - x1 || 1), (canvas.clientHeight - 60) / (y2 - y1 || 1))),
    );
    publish(list, {
      z,
      ox: canvas.clientWidth / 2 - ((x1 + x2) / 2) * z,
      oy: canvas.clientHeight / 2 - ((y1 + y2) / 2) * z,
    });
  }

  const hint =
    tool === "pan"
      ? "Arrasta para andar pelo mapa. Ctrl + roda faz zoom."
      : tool === "txt"
        ? "Clica onde queres escrever e carrega Enter."
        : tool === "sel"
          ? "Clica numa forma para a arrastar."
          : "Arrasta na tela para desenhar.";
  const cursor =
    tool === "pan" ? "grab" : tool === "sel" ? "default" : tool === "txt" ? "text" : "crosshair";
  const selection = selected == null ? null : shapes[selected];
  const selectionBox = selection ? caixa(selection) : null;

  return (
    <section className="mt-[34px] border-t border-nbp-bd pt-6" aria-label="Quadro do mês">
      <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="m-0 text-base font-semibold text-nbp-tx">Quadro de {monthLabel}</h3>
          <p className="mt-1 mb-0 text-[0.82rem] text-nbp-tx2">Desenhado contigo na sessão</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[0.8rem] text-nbp-tx2">
          <Fa name="fa-cloud" className="text-[#6BC4A0]" />
          {saved ? "guardado neste browser" : "a guardar"}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            type="button"
            title={item.label}
            aria-label={item.label}
            aria-pressed={tool === item.id}
            onClick={() => {
              const next = item.id as Tool;
              setTool(next);
              toolRef.current = next;
              setSelected(null);
              selectedRef.current = null;
            }}
            className={`inline-flex min-h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-lg border px-2.5 py-1.5 text-[13px] ${
              tool === item.id
                ? "border-nbp-salvia bg-nbp-salvia text-[#181818]"
                : "border-nbp-bd bg-nbp-sup2 text-nbp-tx2 hover:border-nbp-bd2 hover:text-nbp-tx"
            }`}
          >
            <Fa name={item.icon} />
          </button>
        ))}
        <span className="ml-1.5 flex gap-1.5 rounded-lg border border-[#DCDAD2] bg-[#FCFCFA] px-1.5 py-1">
          {PAL.map((swatch, index) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Cor ${index + 1}`}
              onClick={() => chooseColor(index)}
              className="h-[17px] w-[17px] cursor-pointer rounded-full p-0"
              style={{
                background: swatch,
                outline: color === index ? "2px solid #185FA5" : "none",
                outlineOffset: 1,
              }}
            />
          ))}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="inline-flex min-h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2"
            aria-label={grande ? "Reduzir" : "Expandir"}
            onClick={() => setGrande((value) => !value)}
          >
            <Fa name={grande ? "fa-compress" : "fa-expand"} />
          </button>
          <button
            type="button"
            className="inline-flex min-h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2"
            aria-label="Reduzir zoom"
            onClick={() => zoomBy(0.85)}
          >
            <Fa name="fa-minus" />
          </button>
          <span className="min-w-10 text-center text-[0.74rem] text-nbp-tx2 tabular-nums">
            {Math.round(view.z * 100)}%
          </span>
          <button
            type="button"
            className="inline-flex min-h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2"
            aria-label="Ampliar"
            onClick={() => zoomBy(1.18)}
          >
            <Fa name="fa-plus" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2"
            aria-label="Centrar"
            onClick={center}
          >
            <Fa name="fa-crosshairs" />
          </button>
          <button
            type="button"
            disabled={selected == null}
            className="inline-flex min-h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2 disabled:cursor-default disabled:opacity-40"
            aria-label="Apagar seleção"
            onClick={removeSelected}
          >
            <Fa name="fa-trash" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2"
            aria-label="Limpar tela"
            onClick={clearBoard}
          >
            <Fa name="fa-rotate-right" />
          </button>
        </span>
      </div>

      <div
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={`relative overflow-hidden rounded-xl border border-nbp-bd bg-[#FCFCFA] touch-none ${
          grande ? "h-[calc(100vh-160px)]" : "h-[420px] max-[860px]:h-[320px]"
        }`}
        style={{ cursor }}
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <defs>
            <pattern
              id={patternId}
              width={20 * view.z}
              height={20 * view.z}
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${view.ox % (20 * view.z)} ${view.oy % (20 * view.z)})`}
            >
              <circle cx="1" cy="1" r="1" fill="#E7E5DD" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
          <g transform={`translate(${view.ox} ${view.oy}) scale(${view.z})`}>
            {shapes.map((shape, index) => {
              if (shape.t === "txt" && shape.txt) {
                return (
                  <text
                    key={index}
                    x={shape.x}
                    y={shape.y}
                    fill={PAL[shape.c ?? 0]}
                    fontSize="22"
                    fontFamily="Bradley Hand, Segoe Script, Comic Sans MS, cursive"
                  >
                    {shape.txt}
                  </text>
                );
              }
              const d = caminho(shape);
              if (!d) return null;
              return (
                <path
                  key={index}
                  d={d}
                  fill="none"
                  stroke={PAL[shape.c ?? 0]}
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
            {selectionBox ? (
              <rect
                x={selectionBox.x - 6}
                y={selectionBox.y - 6}
                width={selectionBox.w + 12}
                height={selectionBox.h + 12}
                fill="none"
                stroke="#5DA9F0"
                strokeWidth={1 / view.z}
                strokeDasharray={`${4 / view.z} ${3 / view.z}`}
                rx={4}
              />
            ) : null}
          </g>
        </svg>
        {editor ? (
          <input
            autoFocus
            aria-label="Texto"
            value={editor.value}
            onChange={(event) => setEditor({ ...editor, value: event.target.value })}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === "Enter") closeEditor(true);
              if (event.key === "Escape") closeEditor(false);
            }}
            onBlur={() => closeEditor(true)}
            className="absolute border-0 bg-transparent outline-none"
            style={{
              left: editor.x * view.z + view.ox,
              top: editor.y * view.z + view.oy - 22 * view.z,
              fontSize: 22 * view.z,
              width: 220 * view.z,
              color: PAL[editor.index != null ? (shapes[editor.index]?.c ?? color) : color],
              fontFamily: "Bradley Hand, Segoe Script, Comic Sans MS, cursive",
            }}
          />
        ) : null}
      </div>
      <p className="mt-2.5 mb-0 text-[0.8rem] text-nbp-tx3">{hint}</p>
    </section>
  );
}
