import React from 'react';
import { Calendar, Clock, Sparkles, Globe, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SUMMER_INTENSIVE_DATA } from '@/lib/data/pricing';
import { ICON_MAP } from './icons';

const CONSULTATION_LINK = '#consultation';


export const SummerIntensiveSection = React.forwardRef<HTMLDivElement>(
  function SummerIntensiveSection(_props, ref) {
  const data = SUMMER_INTENSIVE_DATA;

  return (
    <section ref={ref} className="max-w-3xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 animate-fade-in scroll-mt-20">
      {/* Hero */}
      <div className="rounded-card border border-border-strong bg-surface-elevated p-6 sm:p-8 shadow-clay mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              여름방학 집중반
            </h2>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {data.startDate} 개강
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <Badge variant="warning">얼리버드 {data.earlyBird.discount}% 할인</Badge>
            <span className="text-xs text-white/40">~{data.earlyBird.deadline}까지</span>
          </div>
        </div>
      </div>

      {/* Philosophy */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-glow" />
          수업 철학
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.philosophy.map((item) => {
            const IconComponent = ICON_MAP[item.icon];
            return (
              <div
                key={item.title}
                className="rounded-card border border-border-strong bg-clay-solid p-5 shadow-clay"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-glow/15 flex items-center justify-center mb-3">
                  {IconComponent && (
                    <IconComponent className="w-5 h-5 text-accent-glow" />
                  )}
                </div>
                <h4 className="font-bold text-white mb-1.5">{item.title}</h4>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Structure */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent-glow" />
          주간 구조
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.weeklyStructure.map((block) => (
            <div
              key={block.days}
              className="rounded-card border border-border-strong bg-clay-solid p-5 shadow-clay"
            >
              <Badge variant="neutral" className="mb-3">{block.days}</Badge>
              <h4 className="font-bold text-white text-lg mb-1.5">{block.focus}</h4>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                {block.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Schedule */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent-glow" />
          일일 시간표
        </h3>
        <div className="relative bg-surface-elevated rounded-card border border-border-strong shadow-clay overflow-hidden -mx-4 sm:mx-0">
          {/* Scroll hint - mobile only */}
          <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface-elevated to-transparent z-10" />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[480px]">
              <thead>
                {/* Day group header */}
                <tr className="border-b border-white/5">
                  <th
                    rowSpan={2}
                    className="px-2 sm:px-3 py-2 text-[11px] sm:text-xs font-bold text-white/50 text-center bg-white/5 border-r border-white/5 w-[80px] sm:w-[110px]"
                  >
                    스케줄
                  </th>
                  {data.schedule.dayGroups.map((group) => (
                    <th
                      key={group.label}
                      colSpan={group.span}
                      className="px-2 py-2 text-[11px] sm:text-xs font-bold text-white/70 text-center bg-white/5 border-r border-white/5 last:border-r-0"
                    >
                      {group.label}
                    </th>
                  ))}
                </tr>
                {/* Day names */}
                <tr className="border-b border-white/5 bg-white/[0.03]">
                  {data.schedule.days.map((day, i) => (
                    <th
                      key={day}
                      className={`px-1 py-2 text-[11px] sm:text-xs font-bold text-center text-emerald-400 ${
                        i === 2 ? 'border-r border-white/5' : ''
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.schedule.rows.map((row, ri) => (
                  <tr
                    key={row.time}
                    className={`${
                      ri < data.schedule.rows.length - 1 ? 'border-b border-white/5' : ''
                    } ${row.isBreak ? 'bg-white/[0.02]' : ''}`}
                  >
                    <td className="px-2 sm:px-3 py-3 text-[10px] sm:text-xs text-white/60 text-center border-r border-white/5 whitespace-nowrap">
                      {row.time}
                    </td>
                    {row.cells.map((cell, ci) => {
                      if (cell === null) return null;
                      const colorClass = row.isBreak
                        ? 'text-white/40'
                        : 'text-accent-glow';
                      const needsRightBorder =
                        !cell.colSpan && ci === 0 && row.cells.length > 1;
                      return (
                        <td
                          key={ci}
                          rowSpan={cell.rowSpan}
                          colSpan={cell.colSpan}
                          className={`py-3 px-1 sm:px-2 text-[11px] sm:text-xs font-medium text-center whitespace-pre-line leading-snug ${colorClass} ${
                            cell.colSpan === 3 || needsRightBorder
                              ? 'border-r border-white/5'
                              : ''
                          } ${
                            cell.rowSpan && cell.rowSpan > 1
                              ? 'align-middle bg-accent-glow/[0.04]'
                              : ''
                          }`}
                        >
                          {cell.text}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Benefits Summary */}
      <div className="mb-6">
        <div className="rounded-card border border-border-strong bg-clay-solid p-5 sm:p-6 shadow-clay">
          <h3 className="font-bold text-white mb-4">혜택 요약</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-white/70">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-xs">✓</span>
              </span>
              희망 일정에 맞춰 수업 시간 조율 가능
            </li>
            <li className="flex items-start gap-3 text-sm text-white/70">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-xs">✓</span>
              </span>
              주차별 진도에 따른 맞춤 커리큘럼
            </li>
            <li className="flex items-start gap-3 text-sm text-white/70">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-400 text-xs">★</span>
              </span>
              얼리버드 {data.earlyBird.discount}% 할인 (~{data.earlyBird.deadline})
            </li>
          </ul>
        </div>
      </div>

      {/* Timezone Notice */}
      <div className="mb-8">
        <div className="flex items-start gap-3 rounded-card border border-border-strong bg-surface-elevated px-5 py-4 shadow-clay">
          <Globe className="w-5 h-5 text-accent-glow flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
            {data.timezoneNotice}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button
          size="lg"
          className="w-full sm:w-auto min-w-[280px]"
          icon={<MessageCircle className="w-5 h-5" />}
          onClick={() => window.open(CONSULTATION_LINK, '_blank', 'noopener,noreferrer')}
        >
          원장님과 직접 상담하기
        </Button>
        <p className="mt-3 text-xs text-white/40">
          프로그램 상세 안내와 맞춤 상담을 받으실 수 있습니다
        </p>
      </div>
    </section>
  );
});
