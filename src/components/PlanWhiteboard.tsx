"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Fa } from "@/components/BrandMark";
import type { TelaShape } from "@/types/database";

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

function rnd(s0: number) {
  let s = s0;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function lm(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: () => number,
) {
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
    const ah = 14;
    const left = [
      x2 - Math.cos(ang - 0.45) * ah,
      y2 - Math.sin(ang - 0.45) * ah,
    ];
    const right = [
      x2 - Math.cos(ang + 0.45) * ah,
      y2 - Math.sin(ang + 0.45) * ah,
    ];
    return (
      lm(f.x, f.y, x2, y2, r) +
      lm(x2, y2, left[0], left[1], r) +
      lm(x2, y2, right[0], right[1], r)
    );
  }
  if (f.t === "lap" && Array.isArray(f.pts) && f.pts.length) {
    const pts = f.pts as unknown as number[][];
    if (!Array.isArray(pts[0])) return "";
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) d += ` L${pts[i][0]} ${pts[i][1]}`;
    return d;
  }
  return "";
}

export function PlanWhiteboard({
  monthLabel,
  initialShapes,
}: {
  monthLabel: string;
  initialShapes: TelaShape[];
}) {
  const [tool, setTool] = useState("sel");
  const [color, setColor] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [grande, setGrande] = useState(false);
  const shapes = useMemo(() => initialShapes, [initialShapes]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const z = zoom / 100;
    const ox = 0;
    const oy = 0;
    const ns = "http://www.w3.org/2000/svg";
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const g = document.createElementNS(ns, "g");
    g.setAttribute("transform", `translate(${ox},${oy}) scale(${z})`);

    shapes.forEach((f) => {
      if (f.t === "txt" && f.txt) {
        const t = document.createElementNS(ns, "text");
        t.setAttribute("x", String(f.x));
        t.setAttribute("y", String(f.y));
        t.setAttribute("fill", PAL[f.c ?? 0]);
        t.setAttribute("font-size", "18");
        t.setAttribute(
          "font-family",
          "Bradley Hand, Segoe Script, Comic Sans MS, cursive",
        );
        t.textContent = f.txt;
        g.appendChild(t);
        return;
      }
      const path = caminho(f);
      if (!path) return;
      const p = document.createElementNS(ns, "path");
      p.setAttribute("d", path);
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", PAL[f.c ?? 0]);
      p.setAttribute("stroke-width", "1.6");
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-linejoin", "round");
      g.appendChild(p);
    });

    svg.appendChild(g);
  }, [shapes, zoom]);

  return (
    <section className="mt-[34px] border-t border-nbp-bd pt-6" aria-label="Quadro do mês">
      <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="m-0 text-base font-semibold text-nbp-tx">
            Quadro de {monthLabel}
          </h3>
          <p className="mt-1 mb-0 text-[0.82rem] text-nbp-tx2">
            Desenhado contigo na sessão
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[0.8rem] text-nbp-tx2">
          <Fa name="fa-cloud" className="text-[#6BC4A0]" /> guardado
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            aria-label={t.label}
            onClick={() => setTool(t.id)}
            className={`inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg border px-2.5 py-1.5 text-[13px] ${
              tool === t.id
                ? "border-nbp-salvia bg-nbp-salvia text-[#181818]"
                : "border-nbp-bd bg-nbp-sup2 text-nbp-tx2 hover:border-nbp-bd2 hover:text-nbp-tx"
            }`}
          >
            <Fa name={t.icon} />
          </button>
        ))}
        <span className="ml-1.5 flex gap-1.5 rounded-lg border border-[#DCDAD2] bg-[#FCFCFA] px-1.5 py-1">
          {PAL.map((c, i) => (
            <button
              key={c}
              type="button"
              aria-label={`Cor ${i + 1}`}
              onClick={() => setColor(i)}
              className="h-[17px] w-[17px] rounded-full p-0"
              style={{
                background: c,
                outline: color === i ? "2px solid #185FA5" : "none",
                outlineOffset: 1,
              }}
            />
          ))}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2"
            aria-label={grande ? "Reduzir" : "Expandir"}
            onClick={() => setGrande((g) => !g)}
          >
            <Fa name={grande ? "fa-compress" : "fa-expand"} />
          </button>
          <button
            type="button"
            className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2"
            aria-label="Reduzir zoom"
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
          >
            <Fa name="fa-minus" />
          </button>
          <span className="min-w-10 text-center text-[0.74rem] text-nbp-tx2 tabular-nums">
            {zoom}%
          </span>
          <button
            type="button"
            className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2"
            aria-label="Ampliar"
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
          >
            <Fa name="fa-plus" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2"
            aria-label="Centrar"
            onClick={() => setZoom(100)}
          >
            <Fa name="fa-crosshairs" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2"
            aria-label="Apagar seleção"
          >
            <Fa name="fa-trash" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2"
            aria-label="Limpar tela"
          >
            <Fa name="fa-rotate-right" />
          </button>
        </span>
      </div>

      <div
        className={`relative overflow-hidden rounded-xl border border-nbp-bd bg-[#FCFCFA] touch-none ${
          grande ? "h-[calc(100vh-160px)]" : "h-[420px] max-[860px]:h-[320px]"
        }`}
      >
        <svg ref={svgRef} className="absolute inset-0 h-full w-full" />
      </div>
      <p className="mt-2.5 mb-0 text-[0.8rem] text-nbp-tx3">
        Clica numa forma para a arrastar.
      </p>
    </section>
  );
}
