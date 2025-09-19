"use client";

import { useEffect, useRef, useState } from "react";
import { BybitCandle } from "@/bybit/bybit.types";
import { createChart, IChartApi, ISeriesApi, ColorType, CandlestickSeries, UTCTimestamp, MouseEventParams } from "lightweight-charts";

type Props = {
  candles: BybitCandle[];
}

export default function CandlesView({ candles }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const [priceRangeChange, setPriceRangeChange] = useState(0);
  const [lineY, setLineY] = useState<number | null>(null);

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
        mode: 2,
      },
      localization: {
        dateFormat: "yyyy-MM-dd",
      },
    });

    chartRef.current = chart;

    const GREEN = "#50FA7B";
    const RED = "#FF5555";
    const newSeries = chart.addSeries(CandlestickSeries, {
      upColor: GREEN,
      downColor: RED,
      borderUpColor: GREEN,
      borderDownColor: RED,
      wickUpColor: GREEN,
      wickDownColor: RED,
      priceLineVisible: false,
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
    setPriceRangeChange(0);
    setLineY(null);

    if (!chartContainerRef.current) return;

    const handlePointerDown = (e: PointerEvent) => {
      const rect = chartContainerRef.current!.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      setLineY(relativeY);
    };

    chartContainerRef.current.addEventListener('pointerdown', handlePointerDown);

    if (candleSeriesRef.current && candles) {
      candleSeriesRef.current.setData(candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })))

      const chart = chartRef.current;
      const newSeries = candleSeriesRef.current;
      if (!chart || !newSeries) return;

      chart.subscribeClick((param: MouseEventParams) => {
        if (!param.point) {
          setPriceRangeChange(0);
          return;
        }
        const lastPrice = (candles[candles.length - 1]?.close || 0);
        const seriesPrice = newSeries.coordinateToPrice(param.point.y);
        setPriceRangeChange(
          Number((((seriesPrice || 0) - lastPrice) / lastPrice * 100).toFixed(2))
        );
      });
    }

    return () => {
      if (chartContainerRef.current) {
        chartContainerRef.current.removeEventListener('pointerdown', handlePointerDown);
      }
    };
  }, [candles]);

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div>{priceRangeChange}%</div>
      <div
        ref={chartContainerRef}
        className="w-full aspect-square relative"
      >
        {lineY !== null && (
          <div
            className="absolute left-0 right-0 h-0.5 border-t-1 border-dashed border-gray-500 pointer-events-none z-10 opacity-80"
            style={{ top: lineY }}
          />
        )}
      </div>
    </div>
  );
}