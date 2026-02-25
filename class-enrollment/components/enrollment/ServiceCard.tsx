import { Badge } from '@/components/ui/Badge';
import { ServiceIndicator } from './ServiceIndicator';
import type { ManagementService } from '@/types/enrollment';

interface ServiceCardProps {
  categoryName: string;
  managementLevel: string;
  services: ManagementService[];
}

export function ServiceCard({ categoryName, managementLevel, services }: ServiceCardProps) {
  const included = services.filter((s) => s.included);
  const excluded = services.filter((s) => !s.included);

  return (
    <div className="bg-surface-elevated rounded-card border border-border-strong shadow-clay overflow-hidden">
      <div className="bg-emerald-500/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-emerald-500/15">
        <div>
          <p className="text-emerald-400/70 text-xs sm:text-sm">{categoryName}</p>
          <p className="text-emerald-300 font-bold text-base sm:text-lg">
            {included.length}개 서비스 포함
          </p>
        </div>
        <Badge variant="neutral">{managementLevel}</Badge>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-2">
          {included.map((service) => (
            <ServiceIndicator
              key={service.name}
              name={service.name}
              included
              variant="card"
            />
          ))}
        </div>

        {excluded.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-white/40 mb-2">미포함</p>
            <div className="flex flex-wrap gap-2">
              {excluded.map((service) => (
                <ServiceIndicator
                  key={service.name}
                  name={service.name}
                  included={false}
                  variant="pill"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
