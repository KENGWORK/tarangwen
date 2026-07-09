/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shift, Trade, POSITIONS, MONTHS_CONFIG } from '../types';
import { Calendar, Clock, ArrowUpRight, ArrowDownLeft, Info, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardAfterProps {
  shifts: Shift[];
  trades: Trade[];
  currentMonth: string;
}

export default function DashboardAfter({ shifts, trades, currentMonth }: DashboardAfterProps) {
  const [selectedDay, setSelectedDay] = useState<number>(8); // Defaults to 8 (today in system)

  const config = MONTHS_CONFIG[currentMonth] || MONTHS_CONFIG['2026-07'];
  const daysInMonth = config.days;
  const monthName = config.name;
  const startDayOfWeek = config.startDayOfWeek;

  const getDateStringForDay = (day: number) => {
    return `${currentMonth}-${day.toString().padStart(2, '0')}`;
  };

  const getShortMonthText = () => {
    return config.shortName;
  };

  const selectedDateStr = getDateStringForDay(selectedDay);

  // Parse days and merge shifts + trades
  const getShiftsAndTradesForDay = (dateStr: string) => {
    const original = shifts.filter(s => s.dateString === dateStr);
    const dayTrades = trades.filter(t => t.dateString === dateStr);

    // Bought shifts on this day
    const bought = dayTrades.filter(t => t.type === 'buy');
    // Sold shifts on this day (matches time text and position id)
    const sold = dayTrades.filter(t => t.type === 'sell');

    return {
      original,
      bought,
      sold,
    };
  };

  const { original, bought, sold } = getShiftsAndTradesForDay(selectedDateStr);

  // Calculate final working items on selected day
  // Final shift is: original shifts minus sold shifts, plus bought shifts
  // Let's list them clearly so the user sees the transitions!
  
  // Create calendar cell array
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Calculate stats for the whole month
  const monthlyShifts = shifts.filter(s => s.dateString.startsWith(currentMonth));
  const monthlyTrades = trades.filter(t => t.dateString.startsWith(currentMonth));

  const totalOriginalHours = monthlyShifts.reduce((acc, curr) => {
    const hours = curr.endTime > curr.startTime ? (curr.endTime - curr.startTime) : ((24 - curr.startTime) + curr.endTime);
    return acc + hours;
  }, 0);

  const totalBoughtHours = monthlyTrades
    .filter(t => t.type === 'buy')
    .reduce((acc, curr) => {
      const hours = curr.endTime > curr.startTime ? (curr.endTime - curr.startTime) : ((24 - curr.startTime) + curr.endTime);
      return acc + hours;
    }, 0);

  const totalSoldHours = monthlyTrades
    .filter(t => t.type === 'sell')
    .reduce((acc, curr) => {
      const hours = curr.endTime > curr.startTime ? (curr.endTime - curr.startTime) : ((24 - curr.startTime) + curr.endTime);
      return acc + hours;
    }, 0);

  const netHours = totalOriginalHours + totalBoughtHours - totalSoldHours;

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-10 px-4 pt-4 text-gray-800">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">ตารางจริงสะสม</h2>
            <p className="text-gray-500 text-xs">ตารางเวรที่รวมการซื้อเวรและขายเวรทั้งหมดแล้ว</p>
          </div>
          <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            ✨ ตารางสุทธิ
          </span>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">สรุปชั่วโมงทำงานหลังซื้อขายเวร</p>
        <div className="flex justify-around items-center mt-3 text-center">
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500 font-medium">ชั่วโมงเดิม</p>
            <p className="text-lg font-bold text-gray-800 font-mono">{totalOriginalHours}</p>
          </div>
          <div className="text-gray-300 text-xl">→</div>
          <div className="space-y-0.5">
            <p className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-0.5">
              <ArrowDownLeft className="w-3 h-3" /> ซื้อเพิ่ม
            </p>
            <p className="text-lg font-bold text-emerald-600 font-mono">+{totalBoughtHours}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-rose-600 font-bold flex items-center justify-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> ขายออก
            </p>
            <p className="text-lg font-bold text-rose-600 font-mono">-{totalSoldHours}</p>
          </div>
          <div className="text-gray-300 text-xl">=</div>
          <div className="space-y-0.5 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-600 font-bold">ชม. สุทธิ</p>
            <p className="text-xl font-black text-blue-700 font-mono">{netHours}</p>
          </div>
        </div>
      </div>

      {/* Interactive Calendar Card */}
      <div className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-800">{monthName}</h3>
          </div>
          <p className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">อัปเดตเรียลไทม์</p>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          <span>อา</span>
          <span>จ</span>
          <span>อ</span>
          <span>พ</span>
          <span>พฤ</span>
          <span>ศ</span>
          <span>ส</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarCells.map((cell, idx) => {
            if (cell === null) return <div key={`empty-${idx}`} className="h-11"></div>;

            const dayStr = getDateStringForDay(cell);
            const { original: orig, bought: b, sold: s } = getShiftsAndTradesForDay(dayStr);
            
            // Final schedule count on this day (original remaining + bought)
            // original shifts are remaining if they aren't sold
            const activeOriginal = orig.filter(sh => !s.some(st => st.timeText === sh.timeText && st.positionId === sh.positionId));
            const hasActiveWork = activeOriginal.length > 0 || b.length > 0;
            const isSelected = selectedDay === cell;

            return (
              <button
                key={`day-after-${cell}`}
                type="button"
                onClick={() => setSelectedDay(cell)}
                className={`h-11 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all relative ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-100'
                    : hasActiveWork
                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 font-bold'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <span className="text-xs">{cell}</span>

                {/* Indicators container */}
                <div className="flex gap-0.5 justify-center w-full overflow-hidden mt-0.5">
                  {/* Active original shifts */}
                  {activeOriginal.map((sh) => {
                    const pos = POSITIONS.find(p => p.id === sh.positionId);
                    return (
                      <span 
                        key={sh.id} 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: isSelected ? '#ffffff' : (pos?.color || '#3b82f6') }}
                      />
                    );
                  })}
                  {/* Bought shifts */}
                  {b.map((bt) => {
                    const pos = POSITIONS.find(p => p.id === bt.positionId);
                    return (
                      <span 
                        key={bt.id} 
                        className="w-1.5 h-1.5 rounded-full ring-1 ring-emerald-400" 
                        style={{ backgroundColor: isSelected ? '#ffffff' : (pos?.color || '#10b981') }}
                      />
                    );
                  })}
                  {/* Traded out indicator (small dash or grey) */}
                  {s.map((st) => (
                    <span 
                      key={st.id} 
                      className="w-1 h-1 bg-rose-500 rounded-full animate-pulse"
                      title="ขายเวรออก"
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day details */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
          <Clock className="w-3.5 h-3.5 text-blue-600" /> ตารางงานสุทธิวันที่ {selectedDay} {getShortMonthText()}
        </h4>

        {/* Calculate lists */}
        {(() => {
          // Find original shifts that are sold
          const soldShiftsMap = new Set(sold.map(s => `${s.timeText}_${s.positionId}`));
          const remainingOriginal = original.filter(sh => !soldShiftsMap.has(`${sh.timeText}_${sh.positionId}`));
          const soldOriginal = original.filter(sh => soldShiftsMap.has(`${sh.timeText}_${sh.positionId}`));

          const noShifts = remainingOriginal.length === 0 && bought.length === 0 && soldOriginal.length === 0;

          if (noShifts) {
            return (
              <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-6 text-center text-gray-400 text-xs shadow-inner">
                ไม่มีเวรงานในวันนี้ (วันหยุดพักผ่อนของท่าน)
              </div>
            );
          }

          return (
            <div className="space-y-2.5">
              {/* 1. Remaining Original shifts */}
              {remainingOriginal.map((shift) => {
                const pos = POSITIONS.find(p => p.id === shift.positionId) || POSITIONS[0];
                return (
                  <div key={shift.id} className="bg-white border border-gray-100 rounded-2xl p-3 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-9 rounded-full" style={{ backgroundColor: pos.color }} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-800 font-bold text-sm">{shift.timeText} น.</p>
                          <span style={{ backgroundColor: pos.color, color: pos.textColor }} className="text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {pos.name}
                          </span>
                        </div>
                        <p className="text-gray-400 text-[10px]">เวรเดิมของท่าน</p>
                      </div>
                    </div>
                    <span className="text-gray-500 font-semibold font-mono text-xs">
                      {shift.endTime > shift.startTime ? (shift.endTime - shift.startTime) : ((24 - shift.startTime) + shift.endTime)} ชม.
                    </span>
                  </div>
                );
              })}

              {/* 2. Bought shifts */}
              {bought.map((bt) => {
                const pos = POSITIONS.find(p => p.id === bt.positionId) || POSITIONS[0];
                const shiftHours = bt.endTime > bt.startTime ? (bt.endTime - bt.startTime) : ((24 - bt.startTime) + bt.endTime);
                return (
                  <motion.div 
                    initial={{ scale: 0.98, opacity: 0.8 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    key={bt.id} 
                    className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex justify-between items-center shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-9 bg-emerald-400 rounded-full" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-800 font-bold text-sm">{bt.timeText} น.</p>
                          <span style={{ backgroundColor: pos.color, color: pos.textColor }} className="text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {pos.name}
                          </span>
                        </div>
                        <p className="text-emerald-700 text-[10px] font-medium flex items-center gap-1">
                          📥 ซื้อเพิ่มมาจาก: <strong className="text-gray-800">{bt.partnerName}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-600 font-bold font-mono text-sm">+{shiftHours} ชม.</span>
                      <p className="text-[9px] text-gray-400 uppercase">ชั่วโมงซื้อ</p>
                    </div>
                  </motion.div>
                );
              })}

              {/* 3. Sold shifts (Greyed out / Strikethrough) */}
              {soldOriginal.map((shift) => {
                const pos = POSITIONS.find(p => p.id === shift.positionId) || POSITIONS[0];
                const shiftHours = shift.endTime > shift.startTime ? (shift.endTime - shift.startTime) : ((24 - shift.startTime) + shift.endTime);
                const matchTrade = sold.find(s => s.timeText === shift.timeText && s.positionId === shift.positionId);
                return (
                  <div key={shift.id} className="bg-rose-50/50 border border-rose-100/50 rounded-2xl p-3 flex justify-between items-center opacity-70 line-through">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-9 bg-gray-400 rounded-full" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-500 font-semibold text-sm">{shift.timeText} น.</p>
                          <span className="bg-gray-200 text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {pos.name}
                          </span>
                        </div>
                        <p className="text-rose-600 text-[10px] font-medium flex items-center gap-1 line-none">
                          📤 ขายออกแล้วให้: <strong className="text-gray-600">{matchTrade?.partnerName || 'เภสัชกรอื่น'}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-500 font-bold font-mono text-xs">-{shiftHours} ชม.</span>
                      <p className="text-[8px] text-gray-400 uppercase">ขายออก</p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>



    </div>
  );
}
