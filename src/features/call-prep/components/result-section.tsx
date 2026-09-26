import type { ReactNode } from "react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ResultSectionProps = {
  index: number;
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function ResultSection({ index, title, action, children }: ResultSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="font-semibold text-base">
            <span className="text-muted-foreground">{index}.</span> {title}
          </h2>
        </CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="wrap-break-word space-y-3 leading-relaxed">{children}</CardContent>
    </Card>
  );
}
