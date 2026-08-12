import { LucideIcon } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
}

export function MetricCard({ label, value, icon: Icon }: MetricCardProps) {
  return (
    <Card className="gap-3 py-4 shadow-none">
      <CardHeader>
        <CardTitle className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </CardTitle>
        <CardAction>
          <span className="grid size-9 place-items-center rounded-lg bg-accent text-primary">
            <Icon />
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <strong className="font-display text-4xl font-semibold">{value}</strong>
      </CardContent>
    </Card>
  );
}
