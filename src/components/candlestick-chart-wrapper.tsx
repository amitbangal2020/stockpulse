"use client";

import { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

interface Props {
  options: any;
  series: any[];
  type: string;
  height?: number | string;
}

export function CandlestickChart({ options, series, type, height = 500 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing
    if (chartRef.current) {
      try { chartRef.current.destroy(); } catch {}
      chartRef.current = null;
      containerRef.current.innerHTML = "";
    }

    const chartType = type === "candlestick" ? "candlestick" : type;
    const opts = JSON.parse(JSON.stringify(options));
    opts.chart = { ...opts.chart, type: chartType, height };
    opts.series = series;

    chartRef.current = new ApexCharts(containerRef.current, opts);
    chartRef.current.render();

    return () => {
      if (chartRef.current) {
        try { chartRef.current.destroy(); } catch {}
        chartRef.current = null;
      }
    };
  }, [type, height]);

  // Separate effect for data updates (not chart recreation)
  useEffect(() => {
    if (!chartRef.current) return;
    try {
      chartRef.current.updateSeries(series, false);
    } catch {}
  }, [series]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: typeof height === "number" ? `${height}px` : height }}
    />
  );
}
