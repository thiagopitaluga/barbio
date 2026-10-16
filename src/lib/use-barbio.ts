"use client";

import { useEffect, useState } from "react";
import { BarbioData, seedData } from "./barbio";

const KEY = "barbio-demo-v2";

export function useBarbio() {
  const [data, setData] = useState<BarbioData | null>(null);
  useEffect(() => {
    let next: BarbioData;
    try {
      const saved = localStorage.getItem(KEY);
      next = saved ? (JSON.parse(saved) as BarbioData) : seedData();
    } catch {
      next = seedData();
    }
    queueMicrotask(() => setData(next));
  }, []);
  useEffect(() => {
    if (data) localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== KEY || !event.newValue) return;
      try {
        setData(JSON.parse(event.newValue) as BarbioData);
      } catch {
        /* Keep the current state. */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return { data, setData };
}

export function downloadFile(
  filename: string,
  content: string,
  type = "text/plain",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
