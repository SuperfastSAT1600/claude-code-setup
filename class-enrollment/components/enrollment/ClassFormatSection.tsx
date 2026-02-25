import React from 'react';
import { RadioCard } from '@/components/ui/RadioCard';
import { Badge } from '@/components/ui/Badge';
import { CLASS_FORMATS, MANAGEMENT_SERVICES, CATEGORIES } from '@/lib/data/pricing';
import { ICON_MAP } from './icons';
import { SectionHeader } from './SectionHeader';
import { ServiceCard } from './ServiceCard';
import type { ClassFormat, CategoryId } from '@/types/enrollment';

interface ClassFormatSectionProps {
  classFormat: ClassFormat | null;
  onSelect: (format: ClassFormat) => void;
  sectionNumber?: number;
  resolvedCategoryId: CategoryId | null;
}

export const ClassFormatSection = React.forwardRef<HTMLDivElement, ClassFormatSectionProps>(
  function ClassFormatSection({ classFormat, onSelect, sectionNumber = 3, resolvedCategoryId }, ref) {
    const services = resolvedCategoryId ? MANAGEMENT_SERVICES[resolvedCategoryId] : null;
    const categoryData = resolvedCategoryId ? CATEGORIES.find((c) => c.id === resolvedCategoryId) : null;

    return (
      <section
        ref={ref}
        className="max-w-3xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 animate-fade-in scroll-mt-20"
      >
        <SectionHeader number={sectionNumber} title="수업 형태 선택" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CLASS_FORMATS.map((cf) => {
            const IconComponent = ICON_MAP[cf.icon];
            const isSelected = classFormat === cf.id;
            return (
              <React.Fragment key={cf.id}>
                <RadioCard
                  selected={isSelected}
                  onSelect={() => onSelect(cf.id)}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-accent-glow/15 flex items-center justify-center">
                        {IconComponent && (
                          <IconComponent className="w-5 h-5 text-accent-glow" />
                        )}
                      </div>
                      {cf.recommended && (
                        <Badge variant="primary">추천</Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-lg">{cf.name}</h3>
                    <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                      {cf.description}
                    </p>
                  </div>
                </RadioCard>
                {/* Mobile: ServiceCard inline after selected card */}
                {isSelected && services && categoryData && (
                  <div className="sm:hidden animate-fade-in">
                    <ServiceCard
                      categoryName={categoryData.name}
                      managementLevel={categoryData.managementLevel}
                      services={services}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Desktop: ServiceCard below grid */}
        {classFormat && services && categoryData && (
          <div className="hidden sm:block mt-6 animate-fade-in">
            <ServiceCard
              categoryName={categoryData.name}
              managementLevel={categoryData.managementLevel}
              services={services}
            />
          </div>
        )}
      </section>
    );
  }
);
