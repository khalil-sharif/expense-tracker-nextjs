"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { Notification } from "@/lib/types";

export default function ToastLayer() {
  const notifications = useStore((s) => s.notifications);
  const [visible, setVisible] = useState<Notification[]>([]);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fresh = notifications.filter((n) => !seenIds.current.has(n.id));
    if (fresh.length === 0) return;
    fresh.forEach((n) => seenIds.current.add(n.id));
    setVisible((v) => [...fresh, ...v].slice(0, 4));

    fresh.forEach((n) => {
      setTimeout(() => {
        setVisible((v) => v.filter((item) => item.id !== n.id));
      }, 6000);
    });
  }, [notifications]);

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex w-80 flex-col gap-2 md:bottom-6">
      {visible.map((n) => (
        <div
          key={n.id}
          className="flex items-start gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2"
        >
          <span>
            {n.type === "budget-exceeded" ? "🚨" : n.type === "budget-warning" ? "⚠️" : "🔁"}
          </span>
          <p className="flex-1 text-gray-700">{n.message}</p>
          <button
            type="button"
            onClick={() => setVisible((v) => v.filter((item) => item.id !== n.id))}
            className="text-gray-300 hover:text-gray-500"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
