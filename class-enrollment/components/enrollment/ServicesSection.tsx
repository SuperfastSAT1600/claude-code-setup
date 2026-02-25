import React from 'react';
import { MANAGEMENT_SERVICES } from '@/lib/data/pricing';
import { SectionHeader } from './SectionHeader';
import { ServiceCard } from './ServiceCard';
import type { Category, CategoryId } from '@/types/enrollment';

interface ServicesSectionProps {
  resolvedCategoryId: CategoryId;
  categoryData: Category | undefined;
  sectionNumber: number;
}

export const ServicesSection = React.forwardRef<HTMLDivElement, ServicesSectionProps>(
  function ServicesSection({ resolvedCategoryId, categoryData, sectionNumber }, ref) {
    return (
      <section
        ref={ref}
        className="max-w-3xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 animate-fade-in scroll-mt-20"
      >
        <SectionHeader number={sectionNumber} title="포함 관리 서비스" />
        <ServiceCard
          categoryName={categoryData?.name ?? ''}
          managementLevel={categoryData?.managementLevel ?? ''}
          services={MANAGEMENT_SERVICES[resolvedCategoryId]}
        />
      </section>
    );
  }
);
