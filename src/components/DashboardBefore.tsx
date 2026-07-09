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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isRotated, setIsRotated] = useState<boolean>(false);

  const getPositionAbbrev = (positionId: string): string => {
    switch (positionId) {
      case 'OPD_A': return 'A';
      case 'OPD_E3': return 'E3';
      case 'OPD_O8': return '08';
      case 'IPD_MR': return 'MR';
      case 'IPD_HM': return 'HM';
      case 'IPD_IPD': return 'IPD';
      case 'IPD_PROUD': return 'Proud';
      case 'IV': return 'IV';
      case 'DIS': return 'DIS';
      default: return positionId;
    }
  };
  
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
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            {isExpanded ? '🔍 ย่อตาราง' : '🔎 ขยายปฏิทิน'}
          </button>
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

      {/* Fullscreen Landscape Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center overflow-hidden">
          <div
            style={
              isRotated
                ? {
                    transform: 'rotate(90deg)',
                    width: '100vh',
                    height: '100vw',
                    transformOrigin: 'center center',
                  }
                : {
                    width: '100vw',
                    height: '100vh',
                  }
            }
            className="bg-gray-50 text-gray-800 flex flex-col p-4 md:p-6 overflow-auto transition-transform duration-300"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 flex-shrink-0 border-b border-gray-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    ปฏิทินเวรรายเดือนแบบเต็มจอ <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-normal">แนวนอน (Landscape)</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    ประจำเดือน {monthName} • ดูเวลาขึ้น-ลงเวรและตำแหน่งได้ง่ายขึ้น
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRotated(!isRotated)}
                  className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  🔄 {isRotated ? 'มุมมองปกติ' : 'หมุนจอแนวนอน'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-md shadow-rose-200"
                >
                  ❌ ปิด/ย่อตาราง
                </button>
              </div>
            </div>

            {/* Position Legend/Abbreviations (Helpful for quick understanding) */}
            <div className="mb-4 bg-white p-3 rounded-2xl border border-gray-200/80 flex flex-wrap gap-2.5 items-center justify-center text-[10px] text-gray-600 flex-shrink-0 shadow-xs">
              <span className="font-bold text-gray-500 mr-1.5">ตัวย่อตำแหน่ง:</span>
              {POSITIONS.map((pos) => {
                const abbrev = getPositionAbbrev(pos.id);
                return (
                  <div key={pos.id} className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-100">
                    <span style={{ backgroundColor: pos.color }} className="w-2 h-2 rounded-full" />
                    <span className="font-extrabold text-gray-900 font-mono">{abbrev}</span>
                    <span className="text-gray-500 text-[9px]">= {pos.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Calendar Grid Container */}
            <div className="flex-1 min-h-0 flex flex-col">
              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2 py-1.5 bg-gray-100/70 rounded-xl border border-gray-200/50">
                <span className="text-rose-500">อา</span>
                <span>จ</span>
                <span>อ</span>
                <span>พ</span>
                <span>พฤ</span>
                <span>ศ</span>
                <span className="text-blue-500">ส</span>
              </div>

              {/* Grid cells */}
              <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
                {calendarCells.map((cell, idx) => {
                  if (cell === null) {
                    return <div key={`empty-modal-${idx}`} className="bg-gray-100/30 rounded-2xl border border-gray-200/20"></div>;
                  }

                  const dayStr = getDateStringForDay(cell);
                  const shiftsOnThisDay = shifts.filter(s => s.dateString === dayStr);
                  const isSelected = selectedDay === cell;
                  const hasShifts = shiftsOnThisDay.length > 0;

                  const sortedShifts = [...shiftsOnThisDay].sort((a, b) => a.startTime - b.startTime);

                  return (
                    <div
                      key={`cell-modal-${cell}`}
                      onClick={() => {
                        setSelectedDay(cell);
                      }}
                      className={`rounded-2xl p-2 flex flex-col justify-start items-stretch border transition-all cursor-pointer relative select-none ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 ring-4 ring-blue-500/10'
                          : hasShifts
                          ? 'bg-white border-gray-200 hover:bg-gray-50/80 shadow-xs'
                          : 'bg-gray-50/40 border-gray-200/50 text-gray-400 hover:bg-gray-50/80'
                      }`}
                    >
                      {/* Day number */}
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-xs font-black px-1.5 py-0.5 rounded-lg ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : hasShifts 
                            ? 'bg-gray-100 text-gray-700' 
                            : 'text-gray-400'
                        }`}>
                          {cell}
                        </span>
                      </div>

                      {/* Working shifts */}
                      <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
                        {sortedShifts.map((sh, sIdx) => {
                          const pos = POSITIONS.find(p => p.id === sh.positionId);
                          const abbrev = getPositionAbbrev(sh.positionId);
                          return (
                            <div
                              key={sh.id || sIdx}
                              style={{
                                backgroundColor: pos ? `${pos.color}15` : '#f3f4f6',
                                borderColor: pos?.color || '#cbd5e1'
                              }}
                              className="text-[10px] font-bold leading-tight py-1 px-1.5 rounded-xl border-l-4 flex items-center justify-between gap-1 w-full text-gray-800 bg-white/60 shadow-2xs"
                            >
                              <span className="font-mono text-[9px] text-gray-800 tracking-tight shrink-0">{sh.timeText}</span>
                              <span
                                style={{
                                  backgroundColor: pos?.color,
                                  color: pos?.textColor
                                }}
                                className="font-extrabold text-[8px] px-1 py-0.5 rounded-md min-w-[22px] text-center shrink-0 uppercase tracking-tight shadow-3xs"
                              >
                                {abbrev}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

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
