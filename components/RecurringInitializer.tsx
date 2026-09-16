"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

/**
 * Runs once on app load (client-side, after zustand rehydrates from
 * localStorage) to auto-generate any recurring transaction occurrences that
 * are due up to today, and to check for budget alerts.
 */
export default function RecurringInitializer() {
  const processDueRecurringRules = useStore((s) => s.processDueRecurringRules);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const timeout = setTimeout(() => {
      processDueRecurringRules();
    }, 150);
    return () => clearTimeout(timeout);
  }, [processDueRecurringRules]);

  return null;
}
