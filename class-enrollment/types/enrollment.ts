export type ProgramType = 'regular' | 'summer-intensive';

export interface ProgramTypeOption {
  id: ProgramType;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  recommended?: boolean;
  badge?: string;
  disabled?: boolean;
}

export interface SummerScheduleCell {
  text: string;
  color?: 'accent' | 'red';
  rowSpan?: number;
  colSpan?: number;
}

export interface SummerScheduleRow {
  time: string;
  cells: (SummerScheduleCell | null)[];
  isBreak?: boolean;
}

export interface SummerIntensiveInfo {
  startDate: string;
  earlyBird: { discount: number; deadline: string };
  philosophy: { title: string; description: string; icon: string }[];
  weeklyStructure: { days: string; focus: string; description: string }[];
  schedule: {
    days: string[];
    dayGroups: { label: string; span: number }[];
    rows: SummerScheduleRow[];
  };
  timezoneNotice: string;
}

export type CategoryId = 'one-on-one' | 'one-on-three' | 'content' | 'unmanaged';

export type HourPackageCategoryId = Extract<CategoryId, 'one-on-one' | 'unmanaged'>;

export type ManagementType = 'managed' | 'unmanaged';

export type ClassFormat = 'one-on-one' | 'one-on-three' | 'content';

export interface Category {
  id: CategoryId;
  name: string;
  subtitle: string;
  description: string;
  managementLevel: string;
  icon: string;
  recommended?: boolean;
}

export interface HourPackage {
  id: string;
  hours: number;
  pricePerHour: number;
  totalPrice: number;
  discountRate?: number;
  salesLabel?: 'popular' | 'bestValue';
}

export interface CurriculumOption {
  id: string;
  name: string;
  hours: number;
  pricePerHour: number;
  totalPrice: number;
  description: string;
}

export interface ContentItem {
  id: string;
  name: string;
  monthlyPrice: number;
  description: string;
}

export interface ManagementService {
  name: string;
  included: boolean;
}

export type OptionSelection =
  | { type: 'hour-package'; packageId: string }
  | { type: 'curriculum'; curriculumId: string }
  | { type: 'content'; contentIds: string[] };

export interface ManagementTypeOption {
  id: ManagementType;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  recommended?: boolean;
  socialProof?: string;
  serviceHighlight?: string;
}

export interface ClassFormatOption {
  id: ClassFormat;
  name: string;
  description: string;
  icon: string;
  recommended?: boolean;
}
