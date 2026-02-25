'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  CATEGORIES,
  resolveCategoryId,
  getSelectedOptionSummary,
  getSelectedTotalPrice,
} from '@/lib/data/pricing';
import { ProgramTypeSection } from './enrollment/ProgramTypeSection';
import { ManagementTypeSection } from './enrollment/ManagementTypeSection';
import { ClassFormatSection } from './enrollment/ClassFormatSection';
import { ServicesSection } from './enrollment/ServicesSection';
import { PackageSelectionSection } from './enrollment/PackageSelectionSection';
import { SummarySection } from './enrollment/SummarySection';
import { SummerIntensiveSection } from './enrollment/SummerIntensiveSection';
import type { ProgramType, ManagementType, ClassFormat, OptionSelection } from '@/types/enrollment';

export function EnrollmentPage() {
  const [programType, setProgramType] = useState<ProgramType | null>(null);
  const [managementType, setManagementType] = useState<ManagementType | null>(null);
  const [classFormat, setClassFormat] = useState<ClassFormat | null>(null);
  const [selectedOption, setSelectedOption] = useState<OptionSelection | null>(null);

  const summerRef = useRef<HTMLDivElement>(null);
  const managementTypeRef = useRef<HTMLDivElement>(null);
  const formatRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const packageRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((
    ref: React.RefObject<HTMLDivElement | null>,
    mode: 'top' | 'peek-next' = 'top',
    delay = 200,
  ) => {
    setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      const headerHeight = isMobile ? 56 : 64;
      const gap = 16;

      if (mode === 'peek-next') {
        const peekRatio = isMobile ? 0.75 : 0.82;
        const target = window.scrollY + rect.bottom - window.innerHeight * peekRatio;
        // 아래로만 스크롤 (이미 보이는 콘텐츠를 위로 밀지 않음)
        if (target > window.scrollY) {
          window.scrollTo({ top: target, behavior: 'smooth' });
        }
      } else {
        const offset = window.scrollY + rect.top - headerHeight - gap;
        window.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
      }
    }, delay);
  }, []);

  const resolvedCategoryId = useMemo(
    () => (managementType ? resolveCategoryId(managementType, classFormat) : null),
    [managementType, classFormat]
  );

  const categoryData = useMemo(
    () => (resolvedCategoryId ? CATEGORIES.find((c) => c.id === resolvedCategoryId) : undefined),
    [resolvedCategoryId]
  );

  const totalPrice = useMemo(
    () => (resolvedCategoryId && selectedOption ? getSelectedTotalPrice(resolvedCategoryId, selectedOption) : 0),
    [resolvedCategoryId, selectedOption]
  );

  const summary = useMemo(
    () => (resolvedCategoryId && selectedOption ? getSelectedOptionSummary(resolvedCategoryId, selectedOption) : ''),
    [resolvedCategoryId, selectedOption]
  );

  const hasValidOption = useMemo(() => {
    if (!selectedOption) return false;
    if (selectedOption.type === 'content') return selectedOption.contentIds.length > 0;
    return true;
  }, [selectedOption]);

  const isMonthly = selectedOption?.type === 'content';

  const handleProgramSelect = useCallback((type: ProgramType) => {
    const changed = type !== programType;
    setProgramType(type);

    if (changed) {
      setManagementType(null);
      setClassFormat(null);
      setSelectedOption(null);
    }

    if (type === 'regular') {
      scrollTo(managementTypeRef, 'top', 250);
    } else if (type === 'summer-intensive') {
      scrollTo(summerRef, 'top', 250);
    }
  }, [programType, scrollTo]);

  const handleManagementSelect = useCallback((type: ManagementType) => {
    const changed = type !== managementType;
    setManagementType(type);

    if (changed) {
      setSelectedOption(null);

      if (type === 'unmanaged') {
        setClassFormat('one-on-one');
      } else {
        setClassFormat(null);
      }
    }
    // 비교차트 보여주고 다음 섹션 살짝 보이게
    scrollTo(managementTypeRef, 'peek-next');
  }, [managementType, scrollTo]);

  const handleFormatSelect = useCallback((format: ClassFormat) => {
    const changed = format !== classFormat;
    setClassFormat(format);
    if (changed) {
      setSelectedOption(null);
    }
    // 모바일: 카드가 세로 배치 + 인라인 서비스카드라 섹션이 길어서 top으로 이동
    // 데스크톱: 카드가 가로 배치 + 서비스카드가 그리드 아래라 peek-next로 다음 섹션 엿보기
    const isMobile = window.innerWidth < 640;
    scrollTo(formatRef, isMobile ? 'top' : 'peek-next', 250);
  }, [classFormat, scrollTo]);

  const handleOptionSelect = useCallback((option: OptionSelection) => {
    setSelectedOption(option);
    if (option.type !== 'content') {
      // 요약 섹션으로 이동 (새로 렌더링되므로 딜레이 약간 더)
      scrollTo(summaryRef, 'top', 300);
    }
  }, [scrollTo]);

  const handleContentToggle = useCallback((contentId: string) => {
    setSelectedOption((prev) => {
      const current = prev?.type === 'content' ? prev.contentIds : [];
      const next = current.includes(contentId)
        ? current.filter((id) => id !== contentId)
        : [...current, contentId];
      return { type: 'content', contentIds: next };
    });
  }, []);

  const showRegularFlow = programType === 'regular';
  const showFormatSection = showRegularFlow && managementType === 'managed';
  const showUnmanagedServices = showRegularFlow && managementType === 'unmanaged' && resolvedCategoryId !== null;
  const showPackageSection = showRegularFlow && resolvedCategoryId !== null;
  const showSummarySection = showRegularFlow && resolvedCategoryId !== null && hasValidOption && selectedOption !== null;

  return (
    <div className="min-h-screen flex flex-col bg-base">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-12 sm:pt-20 pb-8 sm:pb-12 text-center px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            나에게 맞는 수업을 선택하세요
          </h1>
          <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto mb-6">
            단계별로 선택하면 나에게 딱 맞는 수업권을 찾을 수 있습니다.
          </p>
          <ChevronDown className="w-5 h-5 text-white/30 mx-auto animate-bounce" />
        </section>

        <ProgramTypeSection
          programType={programType}
          onSelect={handleProgramSelect}
        />

        {programType === 'summer-intensive' && (
          <SummerIntensiveSection ref={summerRef} />
        )}

        {showRegularFlow && (
          <ManagementTypeSection
            ref={managementTypeRef}
            managementType={managementType}
            onSelect={handleManagementSelect}
            sectionNumber={2}
          />
        )}

        {showFormatSection && (
          <ClassFormatSection
            ref={formatRef}
            classFormat={classFormat}
            onSelect={handleFormatSelect}
            sectionNumber={3}
            resolvedCategoryId={resolvedCategoryId}
          />
        )}

        {showUnmanagedServices && resolvedCategoryId && (
          <ServicesSection
            ref={servicesRef}
            resolvedCategoryId={resolvedCategoryId}
            categoryData={categoryData}
            sectionNumber={3}
          />
        )}

        {showPackageSection && resolvedCategoryId && (
          <PackageSelectionSection
            ref={packageRef}
            resolvedCategoryId={resolvedCategoryId}
            selectedOption={selectedOption}
            onOptionSelect={handleOptionSelect}
            onContentToggle={handleContentToggle}
            totalPrice={totalPrice}
            sectionNumber={4}
          />
        )}

        {showSummarySection && resolvedCategoryId && selectedOption && managementType && (
          <SummarySection
            ref={summaryRef}
            resolvedCategoryId={resolvedCategoryId}
            categoryData={categoryData}
            managementType={managementType}
            classFormat={classFormat}
            selectedOption={selectedOption}
            totalPrice={totalPrice}
            summary={summary}
            isMonthly={isMonthly}
            sectionNumber={5}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
