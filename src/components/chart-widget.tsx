"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Import ApexCharts only on client
let ApexChartsRef: any = null;
let loadPromise: Promise<any> | null = null;

function loadApexCharts() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (ApexChartsRef) return Promise.resolve(ApexChartsRef);
  if (!loadPromise) {
    loadPromise = import("apexcharts").then((mod) => {
      ApexChartsRef = mod.default;
      return ApexChartsRef;
    });
  }
  return loadPromise;
}

interface Props {
  options: any;
  series: any[];
  type: string;
  height?: number | string;
}

function ChartInner({ options, series, type, height = 500 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    let destroyed = false;

    loadApexCharts().then((ApexCharts) => {
      if (destroyed || !ApexCharts || !containerRef.current) return;

      if (chartRef.current) {
        try { chartRef.current.destroy(); } catch {}
        chartRef.current = null;
        if (containerRef.current) containerRef.current.innerHTML = "";
      }

      const chartType = type === "candlestick" ? "candlestick" : type;
      const opts = {
        ...options,
        chart: { ...options.chart, type: chartType, height },
        series,
      };

      chartRef.current = new ApexCharts(containerRef.current, opts);
      chartRef.current.render();
    });

    return () => {
      destroyed = true;
      if (chartRef.current) {
        try { chartRef.current.destroy(); } catch {}
        chartRef.current = null;
      }
    };
  }, [type, height]);

  // Update on data/options changes
  useEffect(() => {
    if (!chartRef.current) return;
    const chartType = type === "candlestick" ? "candlestick" : type;
    try {
      chartRef.current.updateOptions({
        ...options,
        chart: { ...options.chart, type: chartType, height },
        series,
      }, false, true);
    } catch {}
  }, [series, options, type, height]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: typeof height === "number" ? `${height}px` : height }} />
  );
}

export const ChartWidget = dynamic(() => Promise.resolve({ default: ChartInner }), {
  ssr: false,
  loading: () => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 500 }}><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>,
});
