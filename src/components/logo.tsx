import { ClipboardCheck } from 'lucide-react';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2" aria-label="Smart Attend">
      <ClipboardCheck className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold tracking-tight text-primary">
        Smart Attend
      </span>
    </div>
  );
}
