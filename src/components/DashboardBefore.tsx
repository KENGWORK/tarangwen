/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shift, POSITIONS, MONTHS_CONFIG } from '../types';
import { Calendar, Clock, Sparkles, Filter, ChevronRight, ChevronLeft } from 'lucide-react';

interface DashboardBeforeProps {
  shifts: Shift[];
  currentMonth: string;
}

export default function DashboardBefore({ shifts, currentMonth }: DashboardBeforeProps) {
  const [selectedDay, setSelectedDay] = useState<number>(8); // defaults to 8
  
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
  const selectedDayShifts = shifts.filter(s => s.dateString === selectedDateStr);

  // Generate calendar days
  const calendarCells: (number | null)[] = [];
  // Pad beginning of month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  // Month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Filter shifts to only the current month
  const monthlyShifts = shifts.filter(s => s.dateString.startsWith(currentMonth));

  // Calculate total hours in the original schedule
  const totalOriginalHours = monthlyShifts.reduce((acc, curr) => {
    const hours = curr.endTime > curr.startTime ? (curr.endTime - curr.startTime) : ((24 - curr.startTime) + curr.endTime);
    return acc + hours;
  }, 0);

  const daysWithShiftsCount = new Set(monthlyShifts.map(s => s.dateString)).size;

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-10 px-4 pt-4 text-gray-800">
      {/* Page Header */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">ตารางตั้งต้น</h2>
            <p className="text-gray-500 text-xs">ตารางเวรหลักของตนเองก่อนการซื้อขายเวร</p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 animate-pulse" /> Original
          </span>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-[10px] font-bold uppercase">เวรตั้งต้นทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-850 mt-1">{monthlyShifts.length} <span className="text-xs text-gray-400 font-normal">ช่วงเวร</span></p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-[10px] font-bold uppercase">ชั่วโมงเวรรวมเดิม</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalOriginalHours} <span className="text-xs text-gray-400 font-normal">ชม.</span></p>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-800">{monthName}</h3>
          </div>
          <p className="text-[10px] text-gray-400 font-bold">ลงเวรไว้ {daysWithShiftsCount} วัน</p>
        </div>

        {/* Calendar Weekdays */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          <span>อา</span>
          <span>จ</span>
          <span>อ</span>
          <span>พ</span>
          <span>พฤ</span>
          <span>ศ</span>
          <span>ส</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarCells.map((cell, idx) => {
            if (cell === null) {
              return <div key={`empty-${idx}`} className="h-11"></div>;
            }

            const dayStr = getDateStringForDay(cell);
            const shiftsOnThisDay = shifts.filter(s => s.dateString === dayStr);
            const isSelected = selectedDay === cell;
            const hasShifts = shiftsOnThisDay.length > 0;

            return (
              <button
                key={`day-${cell}`}
                type="button"
                onClick={() => setSelectedDay(cell)}
                className={`h-11 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all relative ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-100'
                    : hasShifts
                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 font-bold'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <span className="text-xs">{cell}</span>
                
                {/* Dots indicator for shifts on this day */}
                <div className="flex gap-0.5 justify-center w-full overflow-hidden mt-0.5">
                  {shiftsOnThisDay.map((sh, sIdx) => {
                    const pos = POSITIONS.find(p => p.id === sh.positionId);
                    return (
                      <span
                        key={sh.id || sIdx}
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: isSelected ? '#ffffff' : (pos?.color || '#3b82f6') }}
                      />
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Detail Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> ตารางงานวันที่ {selectedDay} {getShortMonthText()}
          </h4>
          <span className="text-[10px] text-gray-400">ตารางก่อนซื้อขาย</span>
        </div>

        {selectedDayShifts.length === 0 ? (
          <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-6 text-center text-gray-400 text-xs shadow-inner">
            ไม่มีเวรงานตั้งต้นในวันนี้ (วันหยุดพักผ่อน)
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDayShifts.map((shift) => {
              const pos = POSITIONS.find(p => p.id === shift.positionId) || POSITIONS[0];
              const shiftHours = shift.endTime > shift.startTime ? (shift.endTime - shift.startTime) : ((24 - shift.startTime) + shift.endTime);
              return (
                <div 
                  key={shift.id}
                  className="bg-white border border-gray-100 rounded-2xl p-3.5 flex justify-between items-center shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2.5 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pos.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-800 font-bold text-sm">{shift.timeText} น.</p>
                        <span 
                          style={{ backgroundColor: pos.color, color: pos.textColor }}
                          className="text-[9px] font-black px-1.5 py-0.5 rounded"
                        >
                          {pos.name}
                        </span>
                      </div>
                      {shift.notes && <p className="text-gray-400 text-xs mt-0.5">{shift.notes}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-800 text-xs font-semibold font-mono">{shiftHours} ชม.</p>
                    <p className="text-gray-400 text-[9px] uppercase">ชั่วโมงทำงาน</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
