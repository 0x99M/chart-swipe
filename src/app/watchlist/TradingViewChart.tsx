"use client";

import React, { useEffect, useRef } from "react";
import { BybitCandle } from "@/types/bybit";
import { createChart, IChartApi, ISeriesApi, ColorType, CandlestickSeries, UTCTimestamp } from "lightweight-charts";

interface TradingViewChartProps {
  candles: BybitCandle[] | undefined;
}

export default function TradingViewChart({ candles }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const [hoveredCandleData, setHoveredCandleData] = React.useState<BybitCandle | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: {
          color: "rgba(100, 100, 100, 0.0)",
        },
        horzLines: {
          color: "rgba(100, 100, 100, 0.0)",
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        visible: false,
      },
      crosshair: {
        mode: 0,
      },
      localization: {
        dateFormat: "yyyy-MM-dd",
      },
    });

    chartRef.current = chart;

    const newSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#4bffb5",
      downColor: "#ff4976",
      borderDownColor: "#ff4976",
      borderUpColor: "#4bffb5",
      wickDownColor: "#838ca1",
      wickUpColor: "#838ca1",
      priceLineVisible: false,
    });

    chart.subscribeCrosshairMove(param => {
      if (param.time) {
        const dataPoint = param.seriesData.get(newSeries);
        if (dataPoint) {
          setHoveredCandleData(dataPoint as BybitCandle);
        } else {
          setHoveredCandleData(null);
        }
      } else {
        setHoveredCandleData(null);
      }
    });
    candleSeriesRef.current = newSeries;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== chartContainerRef.current) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      if (chartContainerRef.current != null)
        resizeObserver.unobserve(chartContainerRef.current);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (candleSeriesRef.current && candles) {
      candleSeriesRef.current.setData(candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })))
    }
  }, [candles]);

  return (
    <div className="w-screen flex flex-col justify-center items-center">
      <div
        ref={chartContainerRef}
        className="w-full aspect-square"
      // style={{ minHeight: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}
      >
      </div>
      {hoveredCandleData && (
        <div className="absolute flex gap-4 top-2 left-2 p-2 rounded text-xs">
          <div>Open: {hoveredCandleData.open}</div>
          <div>High: {hoveredCandleData.high}</div>
          <div>Low: {hoveredCandleData.low}</div>
          <div>Close: {hoveredCandleData.close}</div>
          <div>Change: {((hoveredCandleData.close - hoveredCandleData.open) / hoveredCandleData.open * 100).toFixed(2)}%</div>
        </div>
      )}
    </div>
  );
}