"use client";

import { useEffect, useRef } from "react";
import {
  dashboardChartGoal,
  dashboardChartMonths,
  dashboardChartProfit,
  dashboardChartProfitShow,
  dashboardChartRevenue,
} from "@/lib/mocks";

function fmt(n: number) {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function RevenueChart() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const months = dashboardChartMonths;
    const revenue = dashboardChartRevenue;
    const profit = dashboardChartProfit;
    const profitShow = dashboardChartProfitShow;
    const last = revenue.length - 1;
    const goalI = dashboardChartGoal.index;
    const goalV = dashboardChartGoal.value;
    const yMax = 25000;

    const W = 1100;
    const H = 430;
    const pad = { t: 36, r: 56, b: 42, l: 58 };
    const pw = W - pad.l - pad.r;
    const ph = H - pad.t - pad.b;
    const n = months.length;

    const x = (i: number) => pad.l + (i / (n - 1)) * pw;
    const y = (v: number) => pad.t + ph - (v / yMax) * ph;

    const linePath = (vals: number[]) => {
      let d = "";
      for (let i = 0; i < vals.length; i++) {
        d += `${i ? " L " : "M "}${x(i).toFixed(1)} ${y(vals[i]).toFixed(1)}`;
      }
      return d;
    };

    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("role", "img");
    svg.setAttribute(
      "aria-label",
      "Receita mensal da Escola Nova Era Tech de 4.850 euros em outubro de 2025 a 16.430 em abril de 2026, com meta de 22.000 em setembro.",
    );

    const defs = document.createElementNS(ns, "defs");
    defs.innerHTML =
      '<linearGradient id="dashRevFill" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#FDFFEF" stop-opacity="0.22"/>' +
      '<stop offset="100%" stop-color="#FDFFEF" stop-opacity="0"/>' +
      "</linearGradient>";
    svg.appendChild(defs);

    [0, 5000, 10000, 15000, 20000, 25000].forEach((t) => {
      const gy = y(t);
      const grid = document.createElementNS(ns, "line");
      grid.setAttribute("x1", String(pad.l));
      grid.setAttribute("x2", String(W - pad.r));
      grid.setAttribute("y1", String(gy));
      grid.setAttribute("y2", String(gy));
      grid.setAttribute("stroke", "rgba(253,255,239,0.08)");
      grid.setAttribute("stroke-width", "1");
      svg.appendChild(grid);

      const lab = document.createElementNS(ns, "text");
      lab.setAttribute("x", String(pad.l - 10));
      lab.setAttribute("y", String(gy + 4));
      lab.setAttribute("text-anchor", "end");
      lab.setAttribute("fill", "#6B6C63");
      lab.setAttribute("font-size", "11");
      lab.setAttribute("font-family", "ui-monospace, SF Mono, Menlo, monospace");
      lab.textContent = t === 0 ? "0" : fmt(t);
      svg.appendChild(lab);
    });

    const entryX = x(0);
    const entry = document.createElementNS(ns, "line");
    entry.setAttribute("x1", String(entryX));
    entry.setAttribute("x2", String(entryX));
    entry.setAttribute("y1", String(pad.t));
    entry.setAttribute("y2", String(pad.t + ph));
    entry.setAttribute("stroke", "rgba(253,255,239,0.35)");
    entry.setAttribute("stroke-width", "1");
    entry.setAttribute("stroke-dasharray", "2 5");
    svg.appendChild(entry);

    const entryLab = document.createElementNS(ns, "text");
    entryLab.setAttribute("x", String(entryX + 8));
    entryLab.setAttribute("y", String(pad.t + 14));
    entryLab.setAttribute("fill", "#94968D");
    entryLab.setAttribute("font-size", "11");
    entryLab.textContent = "Entrada NBP · 02 Out";
    svg.appendChild(entryLab);

    const area = document.createElementNS(ns, "path");
    area.setAttribute(
      "d",
      `${linePath(revenue)} L ${x(last).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`,
    );
    area.setAttribute("fill", "url(#dashRevFill)");
    svg.appendChild(area);

    const revLine = document.createElementNS(ns, "path");
    revLine.setAttribute("d", linePath(revenue));
    revLine.setAttribute("fill", "none");
    revLine.setAttribute("stroke", "#FDFFEF");
    revLine.setAttribute("stroke-width", "2.2");
    revLine.setAttribute("stroke-linecap", "round");
    revLine.setAttribute("stroke-linejoin", "round");
    svg.appendChild(revLine);

    const profitLine = document.createElementNS(ns, "path");
    profitLine.setAttribute("d", linePath(profit));
    profitLine.setAttribute("fill", "none");
    profitLine.setAttribute("stroke", "#C6C8BA");
    profitLine.setAttribute("stroke-width", "2.2");
    profitLine.setAttribute("stroke-linecap", "round");
    profitLine.setAttribute("stroke-linejoin", "round");
    svg.appendChild(profitLine);

    const meta = document.createElementNS(ns, "line");
    meta.setAttribute("x1", String(x(last)));
    meta.setAttribute("y1", String(y(revenue[last])));
    meta.setAttribute("x2", String(x(goalI)));
    meta.setAttribute("y2", String(y(goalV)));
    meta.setAttribute("stroke", "#FDFFEF");
    meta.setAttribute("stroke-width", "1.8");
    meta.setAttribute("stroke-dasharray", "6 6");
    svg.appendChild(meta);

    function dot(
      cx: number,
      cy: number,
      r: number,
      fill: string,
      stroke?: string,
      sw?: number,
    ) {
      const c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", String(cx));
      c.setAttribute("cy", String(cy));
      c.setAttribute("r", String(r));
      c.setAttribute("fill", fill);
      if (stroke) {
        c.setAttribute("stroke", stroke);
        c.setAttribute("stroke-width", String(sw || 1.6));
      }
      svg.appendChild(c);
    }

    function label(cx: number, cy: number, text: string, color: string, dy = -12) {
      const t = document.createElementNS(ns, "text");
      t.setAttribute("x", String(cx));
      t.setAttribute("y", String(cy + dy));
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("fill", color);
      t.setAttribute("font-size", "11");
      t.setAttribute("font-weight", "600");
      t.textContent = text;
      svg.appendChild(t);
    }

    for (let i = 0; i < revenue.length; i++) {
      const rx = x(i);
      const ry = y(revenue[i]);
      const big = i === last;
      dot(rx, ry, big ? 5 : 3.6, "#FDFFEF");
      label(rx, ry, `${fmt(revenue[i])}${big ? " EUR" : ""}`, "#FDFFEF", big ? -16 : -12);
    }

    for (let p = 0; p < profit.length; p++) {
      const px = x(p);
      const py = y(profit[p]);
      dot(px, py, 3.4, "#C6C8BA");
      if (profitShow[p]) label(px, py, `${fmt(profit[p])} EUR`, "#C6C8BA", -12);
    }

    const gx = x(goalI);
    const gy = y(goalV);
    dot(gx, gy, 5.5, "#181818", "#FDFFEF", 2);
    label(gx, gy, "22.000 EUR", "#FDFFEF", -14);

    months.forEach((m, i) => {
      if (!(i === 0 || i === last || i === goalI || i < 7)) return;
      const tx = document.createElementNS(ns, "text");
      tx.setAttribute("x", String(x(i)));
      tx.setAttribute("y", String(H - 14));
      tx.setAttribute("text-anchor", "middle");
      tx.setAttribute("fill", "#6B6C63");
      tx.setAttribute("font-size", "11");
      tx.textContent = m;
      svg.appendChild(tx);
    });

    host.innerHTML = "";
    host.appendChild(svg);
  }, []);

  return <div ref={hostRef} className="w-full [&_svg]:block [&_svg]:h-auto [&_svg]:w-full [&_svg]:overflow-visible" />;
}
