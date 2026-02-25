import type {
  Category,
  CategoryId,
  HourPackageCategoryId,
  HourPackage,
  CurriculumOption,
  ContentItem,
  ManagementService,
  ManagementType,
  ClassFormat,
  ProgramTypeOption,
  ManagementTypeOption,
  ClassFormatOption,
  OptionSelection,
  SummerIntensiveInfo,
} from '@/types/enrollment';

export const PAYMENT_LINK = 'https://s.tosspayments.com/BnIchv5soiM';

export const PROGRAM_TYPES: ProgramTypeOption[] = [
  {
    id: 'regular',
    name: '정규수업',
    subtitle: '체계적 학습 관리',
    description: '전담 튜터와 매니저가 함께하는 체계적인 SAT 학습 프로그램',
    icon: 'GraduationCap',
    recommended: true,
  },
  {
    id: 'summer-intensive',
    name: '여름방학 특강',
    subtitle: '집중 단기 과정',
    description: '여름방학 기간 집중적으로 실력을 끌어올리는 특별 프로그램',
    icon: 'Sun',
    badge: '얼리버드',
  },
];

export const SUMMER_INTENSIVE_DATA: SummerIntensiveInfo = {
  startDate: '6월 8일',
  earlyBird: { discount: 15, deadline: '2.28' },
  philosophy: [
    {
      title: '개념 우선',
      description: '문제풀이보다 개념 이해가 먼저입니다. 탄탄한 기초 위에 실전 감각을 쌓습니다.',
      icon: 'BookOpen',
    },
    {
      title: '반복과 체화',
      description: '같은 유형을 다양한 각도로 반복합니다. 패턴이 체화될 때까지 연습합니다.',
      icon: 'RefreshCw',
    },
    {
      title: '실전 적용',
      description: '배운 개념을 실전 문제에 바로 적용합니다. 시험장에서 쓸 수 있는 실력을 만듭니다.',
      icon: 'Target',
    },
  ],
  weeklyStructure: [
    {
      days: '월 ~ 수',
      focus: '개념 수업',
      description: '핵심 개념 정리와 유형별 접근법을 학습합니다.',
    },
    {
      days: '목 ~ 금',
      focus: '문제풀이',
      description: '배운 개념을 실전 문제에 적용하고, 오답을 분석합니다.',
    },
  ],
  schedule: {
    days: ['월', '화', '수', '목', '금'],
    dayGroups: [
      { label: '개념 집중 학습', span: 3 },
      { label: '문제 풀이 집중 학습', span: 2 },
    ],
    rows: [
      {
        time: '09:00~10:00',
        cells: [{ text: 'Vocab', color: 'accent', colSpan: 5 }],
      },
      {
        time: '10:00~10:35',
        cells: [
          { text: 'RW 라이브 강의', color: 'accent', colSpan: 3, rowSpan: 3 },
          { text: 'RW Module1\nTEST', color: 'accent' },
          { text: 'Math Module 1\nTEST', color: 'red' },
        ],
      },
      {
        time: '10:45~11:20',
        cells: [
          null,
          { text: 'RW Module 2\nTEST', color: 'accent' },
          { text: 'Math Module 2\nTEST', color: 'red' },
        ],
      },
      {
        time: '11:30~12:00',
        cells: [
          null,
          { text: '라이브\n개념 및 해설 강의', color: 'accent' },
          { text: '라이브\n개념 및 해설 강의', color: 'red' },
        ],
      },
      {
        time: '12:00~13:00',
        cells: [{ text: '휴식', colSpan: 5 }],
        isBreak: true,
      },
      {
        time: '13:00~15:00',
        cells: [
          { text: '맞춤형 학습\n(Live Text Tutoring)', color: 'accent', colSpan: 3 },
          { text: '라이브\n개념 및 해설 강의', color: 'accent' },
          { text: '라이브\n개념 및 해설 강의', color: 'red' },
        ],
      },
      {
        time: '15:00~16:00',
        cells: [{ text: 'Vocab TEST\n복습 문제 정리', colSpan: 5 }],
      },
    ],
  },
  timezoneNotice: '한국 시간(KST) 기준입니다. 미국 등 해외 거주 학생은 시차를 고려해 주세요.',
};

export const MANAGEMENT_TYPES: ManagementTypeOption[] = [
  {
    id: 'managed',
    name: '관리형',
    subtitle: '전담 매니저 배정',
    description: '전담 매니저가 학습 전반을 관리하고 성적 향상을 이끕니다',
    icon: 'ShieldCheck',
    recommended: true,
    socialProof: '학생 90% 이상 선택',
    serviceHighlight: '6개 관리 서비스 포함',
  },
  {
    id: 'unmanaged',
    name: '비관리형',
    subtitle: '수업 + 레슨 피드백만',
    description: '수업과 레슨 피드백만 제공되는 합리적인 옵션',
    icon: 'BookOpen',
    serviceHighlight: '레슨 피드백만 제공',
  },
];

export const CLASS_FORMATS: ClassFormatOption[] = [
  {
    id: 'one-on-one',
    name: '1:1 수업',
    description: '전담 튜터와 1:1 맞춤 수업 + 전체 관리 서비스',
    icon: 'UserCheck',
    recommended: true,
  },
  {
    id: 'one-on-three',
    name: '1:3 수업',
    description: '소규모 그룹 수업 + 커리큘럼별 관리 서비스',
    icon: 'Users',
  },
  {
    id: 'content',
    name: '콘텐츠',
    description: '인강, 단어, 문제풀이 등 월간 구독 콘텐츠',
    icon: 'MonitorPlay',
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'one-on-one',
    name: '1:1 수업',
    subtitle: '풀 관리',
    description: '전담 튜터와 1:1 맞춤 수업 + 전체 관리 서비스',
    managementLevel: '풀 관리',
    icon: 'UserCheck',
    recommended: true,
  },
  {
    id: 'one-on-three',
    name: '1:3 수업',
    subtitle: '관리 포함',
    description: '소규모 그룹 수업 + 커리큘럼별 관리 서비스',
    managementLevel: '관리 포함',
    icon: 'Users',
  },
  {
    id: 'content',
    name: '콘텐츠',
    subtitle: '부분 관리',
    description: '인강, 단어, 문제풀이 등 월간 구독 콘텐츠',
    managementLevel: '부분 관리',
    icon: 'MonitorPlay',
  },
  {
    id: 'unmanaged',
    name: '비관리',
    subtitle: '레슨 피드백만',
    description: '수업 후 레슨 피드백만 제공되는 합리적 옵션',
    managementLevel: '레슨 피드백만',
    icon: 'BookOpen',
  },
];

export const HOUR_PACKAGES: Record<HourPackageCategoryId, HourPackage[]> = {
  'one-on-one': [
    { id: '1on1-10h', hours: 10, pricePerHour: 165000, totalPrice: 1650000 },
    { id: '1on1-20h', hours: 20, pricePerHour: 149500, totalPrice: 2990000, discountRate: 9, salesLabel: 'popular' },
    { id: '1on1-40h', hours: 40, pricePerHour: 124750, totalPrice: 4990000, discountRate: 24, salesLabel: 'bestValue' },
  ],
  unmanaged: [
    { id: 'unmanaged-10h', hours: 10, pricePerHour: 100000, totalPrice: 1000000 },
    { id: 'unmanaged-20h', hours: 20, pricePerHour: 90000, totalPrice: 1800000, discountRate: 10, salesLabel: 'popular' },
    { id: 'unmanaged-40h', hours: 40, pricePerHour: 80000, totalPrice: 3200000, discountRate: 20, salesLabel: 'bestValue' },
  ],
};

export const CURRICULUM_OPTIONS: CurriculumOption[] = [
  {
    id: 'curriculum-basic',
    name: '기초+유형반',
    hours: 40,
    pricePerHour: 85000,
    totalPrice: 3400000,
    description: 'SAT 기초부터 유형별 전략까지 체계적으로 학습',
  },
  {
    id: 'curriculum-type',
    name: '유형반',
    hours: 10,
    pricePerHour: 95000,
    totalPrice: 950000,
    description: '문제 유형별 집중 공략 및 전략 학습',
  },
  {
    id: 'curriculum-practice',
    name: '실전반',
    hours: 20,
    pricePerHour: 90000,
    totalPrice: 1800000,
    description: '실전 모의고사 풀이 및 시간 관리 훈련',
  },
  {
    id: 'curriculum-final',
    name: '파이널',
    hours: 10,
    pricePerHour: 105000,
    totalPrice: 1050000,
    description: '시험 직전 최종 점검 및 약점 보완',
  },
];

export const CONTENT_ITEMS: ContentItem[] = [
  { id: 'content-lecture', name: '인강', monthlyPrice: 249000, description: '전 범위 동영상 강의' },
  { id: 'content-vocab', name: '단어', monthlyPrice: 50000, description: 'SAT 필수 어휘 학습' },
  { id: 'content-problems', name: '문제', monthlyPrice: 149000, description: '유형별 기출문제 풀이' },
  { id: 'content-mock', name: '모의고사', monthlyPrice: 60000, description: '실전 모의시험 응시' },
  { id: 'content-qna', name: '실시간 Q&A', monthlyPrice: 200000, description: '실시간 질의응답 지원' },
];

export const MANAGEMENT_SERVICES: Record<CategoryId, ManagementService[]> = {
  'one-on-one': [
    { name: '레슨 피드백', included: true },
    { name: '기출문제 제공', included: true },
    { name: '데일리 Vocab', included: true },
    { name: '오답노트', included: true },
    { name: '숙제 일정 관리', included: true },
    { name: '2주 간격 모의시험', included: true },
  ],
  'one-on-three': [
    { name: '레슨 피드백', included: true },
    { name: '기출문제 제공', included: true },
    { name: '데일리 Vocab', included: true },
    { name: '오답노트', included: true },
    { name: '숙제 일정 관리', included: true },
    { name: '2주 간격 모의시험', included: true },
  ],
  content: [
    { name: '학습 결과 피드백', included: true },
    { name: '오답노트', included: true },
    { name: '숙제 일정 관리', included: true },
    { name: '레슨 피드백', included: false },
    { name: '2주 간격 모의시험', included: false },
  ],
  unmanaged: [
    { name: '레슨 피드백', included: true },
    { name: '인강', included: false },
    { name: '단어 학습', included: false },
    { name: '오답노트', included: false },
    { name: '숙제 일정 관리', included: false },
    { name: '2주 간격 모의시험', included: false },
  ],
};

export function resolveCategoryId(
  managementType: ManagementType,
  classFormat: ClassFormat | null
): CategoryId | null {
  if (managementType === 'unmanaged') return 'unmanaged';
  if (!classFormat) return null;
  return classFormat as CategoryId;
}

export function isHourPackageCategory(id: CategoryId): id is HourPackageCategoryId {
  return id === 'one-on-one' || id === 'unmanaged';
}

export function getBasePrice(categoryId: CategoryId): number {
  if (!isHourPackageCategory(categoryId)) return 0;
  return HOUR_PACKAGES[categoryId][0].pricePerHour;
}

export function getSavingsAmount(pkg: HourPackage, basePrice: number): number {
  return (basePrice * pkg.hours) - pkg.totalPrice;
}

export const SALES_LABELS: Record<string, { text: string; variant: 'warning' | 'success' }> = {
  popular: { text: '가장 인기', variant: 'warning' },
  bestValue: { text: '최대 할인', variant: 'success' },
};

export function getSelectedOptionSummary(
  categoryId: CategoryId,
  option: OptionSelection
): string {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return '';

  if (option.type === 'hour-package') {
    if (!isHourPackageCategory(categoryId)) return '';
    const pkg = HOUR_PACKAGES[categoryId].find((p) => p.id === option.packageId);
    return pkg ? `${category.name} ${pkg.hours}시간` : '';
  }

  if (option.type === 'curriculum') {
    const cur = CURRICULUM_OPTIONS.find((c) => c.id === option.curriculumId);
    return cur ? `${category.name} - ${cur.name} ${cur.hours}시간` : '';
  }

  if (option.type === 'content') {
    const names = option.contentIds
      .map((id) => CONTENT_ITEMS.find((c) => c.id === id)?.name)
      .filter(Boolean);
    return `콘텐츠 - ${names.join(', ')}`;
  }

  return '';
}

export function getSelectedTotalPrice(
  categoryId: CategoryId,
  option: OptionSelection
): number {
  if (option.type === 'hour-package') {
    if (!isHourPackageCategory(categoryId)) return 0;
    const pkg = HOUR_PACKAGES[categoryId].find((p) => p.id === option.packageId);
    return pkg?.totalPrice ?? 0;
  }

  if (option.type === 'curriculum') {
    const cur = CURRICULUM_OPTIONS.find((c) => c.id === option.curriculumId);
    return cur?.totalPrice ?? 0;
  }

  if (option.type === 'content') {
    return option.contentIds.reduce((sum, id) => {
      const item = CONTENT_ITEMS.find((c) => c.id === id);
      return sum + (item?.monthlyPrice ?? 0);
    }, 0);
  }

  return 0;
}
