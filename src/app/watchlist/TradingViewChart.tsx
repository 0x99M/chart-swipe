"use client";

import React, { useEffect, useRef } from "react";
import { BybitCandle } from "@/bybit/bybit.types";
import { createChart, IChartApi, ISeriesApi, ColorType, CandlestickSeries, UTCTimestamp } from "lightweight-charts";

interface TradingViewChartProps {
  candles: BybitCandle[];
}

export default function TradingViewChart({ candles }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const [hoveredCandleData, setHoveredCandleData] = React.useState<BybitCandle>(candles[0]);

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
          setHoveredCandleData(candles[0]);
        }
      } else {
        setHoveredCandleData(candles[0]);
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
    <div className="w-full flex flex-col justify-center items-center">
      <div className="w-full flex justify-center items-center gap-4 text-xs text-center">
        <div>O: {hoveredCandleData?.open}</div>
        <div>H: {hoveredCandleData?.high}</div>
        <div>L: {hoveredCandleData?.low}</div>
        <div>C: {hoveredCandleData?.close}</div>
        <div>Ch: {((hoveredCandleData?.close - hoveredCandleData?.open) / hoveredCandleData?.open * 100).toFixed(2)}%</div>
      </div>
      <div
        ref={chartContainerRef}
        className="w-full aspect-square"
      >
      </div>
    </div>
  );
}