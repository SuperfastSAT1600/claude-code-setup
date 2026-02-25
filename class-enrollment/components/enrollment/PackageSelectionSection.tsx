import React from 'react';
import { RadioCard } from '@/components/ui/RadioCard';
import { CheckboxCard } from '@/components/ui/CheckboxCard';
import { Badge } from '@/components/ui/Badge';
import { formatWon } from '@/lib/utils/format';
import {
  HOUR_PACKAGES,
  CURRICULUM_OPTIONS,
  CONTENT_ITEMS,
  SALES_LABELS,
  isHourPackageCategory,
  getBasePrice,
  getSavingsAmount,
} from '@/lib/data/pricing';
import { SectionHeader } from './SectionHeader';
import type { CategoryId, OptionSelection } from '@/types/enrollment';

interface PackageSelectionSectionProps {
  resolvedCategoryId: CategoryId;
  selectedOption: OptionSelection | null;
  onOptionSelect: (option: OptionSelection) => void;
  onContentToggle: (contentId: string) => void;
  totalPrice: number;
  sectionNumber: number;
}

export const PackageSelectionSection = React.forwardRef<HTMLDivElement, PackageSelectionSectionProps>(
  function PackageSelectionSection(
    { resolvedCategoryId, selectedOption, onOptionSelect, onContentToggle, totalPrice, sectionNumber },
    ref
  ) {
    const sectionTitle =
      resolvedCategoryId === 'content'
        ? '콘텐츠 선택 (복수 선택 가능)'
        : resolvedCategoryId === 'one-on-three'
          ? '커리큘럼 선택'
          : '시간 패키지 선택';

    return (
      <section
        ref={ref}
        className="max-w-3xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 animate-fade-in scroll-mt-20"
      >
        <SectionHeader number={sectionNumber} title={sectionTitle} />

        {/* 1:1 / 비관리: 시간 패키지 */}
        {isHourPackageCategory(resolvedCategoryId) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HOUR_PACKAGES[resolvedCategoryId].map((pkg) => {
              const basePrice = getBasePrice(resolvedCategoryId);
              const savings = getSavingsAmount(pkg, basePrice);
              const labelInfo = pkg.salesLabel ? SALES_LABELS[pkg.salesLabel] : null;
              return (
                <RadioCard
                  key={pkg.id}
                  selected={
                    selectedOption?.type === 'hour-package' &&
                    selectedOption.packageId === pkg.id
                  }
                  onSelect={() =>
                    onOptionSelect({ type: 'hour-package', packageId: pkg.id })
                  }
                >
                  <div className="text-center space-y-3">
                    <div className="h-5">
                      {labelInfo && (
                        <Badge variant={labelInfo.variant}>{labelInfo.text}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-white">
                        {pkg.hours}시간
                      </span>
                      {pkg.discountRate && (
                        <span className="text-sm font-bold text-rose-400">
                          -{pkg.discountRate}%
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-accent-glow">
                        {formatWon(pkg.totalPrice)}
                      </p>
                      {savings > 0 && (
                        <p className="text-xs sm:text-sm font-bold text-rose-400 mt-1">
                          {formatWon(savings)} 절약
                        </p>
                      )}
                    </div>
                  </div>
                </RadioCard>
              );
            })}
          </div>
        )}

        {/* 1:3: 커리큘럼 */}
        {resolvedCategoryId === 'one-on-three' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CURRICULUM_OPTIONS.map((cur) => (
              <RadioCard
                key={cur.id}
                selected={
                  selectedOption?.type === 'curriculum' &&
                  selectedOption.curriculumId === cur.id
                }
                onSelect={() =>
                  onOptionSelect({ type: 'curriculum', curriculumId: cur.id })
                }
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-lg">
                      {cur.name}
                    </h4>
                    <Badge variant="neutral">{cur.hours}시간</Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-white/60">{cur.description}</p>
                  <p className="text-lg font-bold text-accent-glow">
                    {formatWon(cur.totalPrice)}
                  </p>
                </div>
              </RadioCard>
            ))}
          </div>
        )}

        {/* 콘텐츠: 복수 선택 */}
        {resolvedCategoryId === 'content' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CONTENT_ITEMS.map((item) => {
                const checked =
                  selectedOption?.type === 'content' &&
                  selectedOption.contentIds.includes(item.id);
                return (
                  <CheckboxCard
                    key={item.id}
                    checked={!!checked}
                    onToggle={() => onContentToggle(item.id)}
                  >
                    <div className="space-y-2 pr-6">
                      <h4 className="font-bold text-white">{item.name}</h4>
                      <p className="text-xs text-white/40">
                        {item.description}
                      </p>
                      <p className="text-base font-bold" style={{ color: '#6085ff' }}>
                        월 {formatWon(item.monthlyPrice)}
                      </p>
                    </div>
                  </CheckboxCard>
                );
              })}
            </div>
            {selectedOption?.type === 'content' &&
              selectedOption.contentIds.length > 0 && (
                <div className="mt-4 p-4 bg-accent-glow/10 rounded-card text-center border border-accent-glow/20">
                  <p className="text-xs sm:text-sm text-white/60">합산 월 가격</p>
                  <p className="text-2xl font-bold text-white">
                    월 {formatWon(totalPrice)}
                  </p>
                </div>
              )}
          </>
        )}
      </section>
    );
  }
);
