import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  icon: string;
  tone?: "default" | "positive" | "negative";
  hint?: string;
}

export default function StatCard({ label, value, icon, tone = "default", hint }: Props) {
  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p
          className={cn(
            "mt-1.5 text-2xl font-bold",
            tone === "positive" && "text-income",
            tone === "negative" && "text-expense",
            tone === "default" && "text-gray-900"
          )}
        >
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-lg">
        {icon}
      </div>
    </div>
  );
}
