/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shift, POSITIONS, MONTHS_CONFIG } from '../types';
import { calculateHoursFromText } from '../utils/helpers';
import { Plus, Trash2, Calendar, ClipboardList, Info, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ScheduleSetupProps {
  shifts: Shift[];
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  onDeleteShift: (id: string) => void;
  onClearShifts: () => void;
  currentMonth: string;
}

export default function ScheduleSetup({ shifts, onAddShift, onDeleteShift, onClearShifts, currentMonth }: ScheduleSetupProps) {
  const [selectedDay, setSelectedDay] = useState<number>(8); // defaults to 8th (today in system)
  const [timeText, setTimeText] = useState<string>('8-16');
  const [positionId, setPositionId] = useState<string>('OPD_A');
  const [notes, setNotes] = useState<string>('');
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [shiftIdToDelete, setShiftIdToDelete] = useState<string | null>(null);

  const selectedPosition = POSITIONS.find(p => p.id === positionId) || POSITIONS[0];

  const config = MONTHS_CONFIG[currentMonth] || MONTHS_CONFIG['2026-07'];
  const daysInMonth = config.days;
  const monthName = config.name;

  const getDateStringForDay = (day: number) => {
    const formattedDay = day.toString().padStart(2, '0');
    return `${currentMonth}-${formattedDay}`;
  };

  const getShortMonthText = () => {
    return config.shortName;
  };

  const selectedDateStr = getDateStringForDay(selectedDay);

  // Filter shifts on the selected day
  const shiftsOnSelectedDay = shifts.filter(s => s.dateString === selectedDateStr);

  const quickTimes = [
    { label: '7-8', value: '7-8' },
    { label: '7-16', value: '7-16' },
    { label: '8-16', value: '8-16' },
    { label: '16-20', value: '16-20' },
    { label: '9-16', value: '9-16' },
    { label: '10-16', value: '10-16' },
    { label: '8-17', value: '8-17' },
    { label: '8-18', value: '8-18' },
  ];

  const handleAddShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeText) return;

    // Parse start and end times
    const parts = timeText.split('-');
    const startTime = parts[0] ? parseFloat(parts[0]) : 8;
    const endTime = parts[1] ? parseFloat(parts[1]) : 16;

    onAddShift({
      dateString: selectedDateStr,
      timeText,
      startTime,
      endTime,
      positionId,
      notes
    });

    setNotes('');
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const totalShiftsCount = shifts.length;
  const computedHours = calculateHoursFromText(timeText);

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-10 px-4 pt-4 text-gray-800">
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">ตั้งค่าตารางเวร</h2>
          <p className="text-gray-500 text-xs">ระบุเวรงานตั้งต้นของตัวท่านตามตารางโรงพยาบาล</p>
        </div>
        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="text-xs bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>ล้างตารางเวร</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <span>ยืนยันการล้างตารางเวร</span>
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลเวรตั้งต้นทั้งหมดในระบบ? การดำเนินการนี้ไม่สามารถยกเลิกได้ในภายหลัง
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-150 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearShifts();
                  setShowClearConfirm(false);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ยืนยันล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Shift Confirmation Modal */}
      {shiftIdToDelete && (
        (() => {
          const shiftToDelete = shifts.find(s => s.id === shiftIdToDelete);
          if (!shiftToDelete) return null;
          const shiftToDeletePos = POSITIONS.find(p => p.id === shiftToDelete.positionId) || POSITIONS[0];
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="bg-white border border-gray-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                  <span>ยืนยันการลบเวร</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  คุณแน่ใจหรือไม่ว่าต้องการลบเวรนี้ออกจากระบบ?
                </p>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-gray-700">
                    <span>วันปฏิบัติงาน:</span>
                    <span>วันที่ {selectedDay} {getShortMonthText()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-700">
                    <span>เวลาทำงาน:</span>
                    <span>{shiftToDelete.timeText} น.</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">ตำแหน่ง/หน้าที่:</span>
                    <span 
                      style={{ backgroundColor: shiftToDeletePos.color, color: shiftToDeletePos.textColor }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                    >
                      {shiftToDeletePos.name}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShiftIdToDelete(null)}
                    className="flex-1 bg-gray-150 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteShift(shiftIdToDelete);
                      setShiftIdToDelete(null);
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    ยืนยันการลบ
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* Horizontal Day Selector */}
      <div className="mb-6">
        <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-600" /> เลือกวันในเดือนปัจจุบัน ({monthName})
        </label>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const d = index + 1;
            const currentStr = getDateStringForDay(d);
            const shiftsCount = shifts.filter(s => s.dateString === currentStr).length;
            const isSelected = selectedDay === d;
            
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDay(d)}
                className={`flex-shrink-0 w-12 h-14 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-[10px] opacity-70">Day</span>
                <span className="text-base font-bold">{d}</span>
                {shiftsCount > 0 && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-blue-600'}`}></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main section grid: 1. Current list on selected day, 2. Add form */}
      <div className="space-y-6">
        {/* Existing shifts list on selected day */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5 border-b border-gray-100 pb-2">
            📅 เวรที่ตั้งไว้สำหรับวันที่ {selectedDay} {getShortMonthText()}
          </h3>

          {shiftsOnSelectedDay.length === 0 ? (
            <div className="py-4 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-1.5">
              <AlertCircle className="w-5 h-5 text-gray-300" />
              <span>ยังไม่มีเวรในวันนี้ (วันหยุดของท่าน)</span>
            </div>
          ) : (
            <div className="space-y-2">
              {shiftsOnSelectedDay.map((shift) => {
                const pos = POSITIONS.find(p => p.id === shift.positionId) || POSITIONS[0];
                return (
                  <div 
                    key={shift.id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className="w-3 h-8 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: pos.color }}
                      ></span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-800 font-bold text-sm">{shift.timeText} น.</span>
                          <span 
                            style={{ backgroundColor: pos.color, color: pos.textColor }} 
                            className="text-[10px] font-bold px-2 py-0.5 rounded"
                          >
                            {pos.name}
                          </span>
                        </div>
                        {shift.notes && <p className="text-gray-500 text-[11px] mt-0.5">{shift.notes}</p>}
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShiftIdToDelete(shift.id)}
                      className="text-gray-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="ลบเวรนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add new shift form */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <Plus className="w-4 h-4 text-blue-600" /> เพิ่มเวรสำหรับวันที่ {selectedDay} {getShortMonthText()}
          </h3>

          <form onSubmit={handleAddShiftSubmit} className="space-y-4">
            
            {/* Time input using custom style */}
            <div className="space-y-2">
              <label className="text-gray-700 text-xs font-semibold">ช่วงเวลาทำงาน (ป้อนอิสระเช่น 7-16, 8-16, 9-18)</label>
              <div className="input-group">
                <input
                  placeholder=" "
                  type="text"
                  id="setupTimeInput"
                  required
                  value={timeText}
                  onChange={(e) => setTimeText(e.target.value)}
                  className="input"
                />
                <label htmlFor="setupTimeInput" className="user-label">ระบุเวลา (เช่น 8-16)</label>
              </div>

              {computedHours > 0 && (
                <div className="text-[11px] text-blue-700 bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>คำนวณได้: <strong className="text-gray-800 font-mono">{computedHours}</strong> ชั่วโมง</span>
                </div>
              )}

              {/* Quick Times */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickTimes.map((qt) => (
                  <button
                    key={qt.value}
                    type="button"
                    onClick={() => setTimeText(qt.value)}
                    className={`text-[10px] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      timeText === qt.value
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position Select */}
            <div className="space-y-2">
              <label className="text-gray-700 text-xs font-semibold">เลือกงานหลัก/ตำแหน่ง</label>
              <div className="grid grid-cols-3 gap-1.5">
                {/* Column 1: OPD */}
                <div className="flex flex-col gap-1.5">
                  {['OPD_A', 'OPD_E3', 'OPD_O8'].map((id) => {
                    const pos = POSITIONS.find(p => p.id === id);
                    if (!pos) return null;
                    const isSelected = positionId === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setPositionId(pos.id)}
                        style={{ 
                          backgroundColor: isSelected ? pos.color : '#f3f4f6',
                          color: isSelected ? pos.textColor : '#374151',
                          borderColor: isSelected ? 'transparent' : '#e5e7eb'
                        }}
                        className={`text-[10px] font-bold py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected ? 'ring-2 ring-blue-600/20 scale-95' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {pos.name}
                      </button>
                    );
                  })}
                </div>

                {/* Column 2: IPD (IPD, HM, MR) */}
                <div className="flex flex-col gap-1.5">
                  {['IPD_IPD', 'IPD_HM', 'IPD_MR'].map((id) => {
                    const pos = POSITIONS.find(p => p.id === id);
                    if (!pos) return null;
                    const isSelected = positionId === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setPositionId(pos.id)}
                        style={{ 
                          backgroundColor: isSelected ? pos.color : '#f3f4f6',
                          color: isSelected ? pos.textColor : '#374151',
                          borderColor: isSelected ? 'transparent' : '#e5e7eb'
                        }}
                        className={`text-[10px] font-bold py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected ? 'ring-2 ring-blue-600/20 scale-95' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {pos.name}
                      </button>
                    );
                  })}
                </div>

                {/* Column 3: IPD(Proud), IV, DIS */}
                <div className="flex flex-col gap-1.5">
                  {['IPD_PROUD', 'IV', 'DIS'].map((id) => {
                    const pos = POSITIONS.find(p => p.id === id);
                    if (!pos) return null;
                    const isSelected = positionId === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setPositionId(pos.id)}
                        style={{ 
                          backgroundColor: isSelected ? pos.color : '#f3f4f6',
                          color: isSelected ? pos.textColor : '#374151',
                          borderColor: isSelected ? 'transparent' : '#e5e7eb'
                        }}
                        className={`text-[10px] font-bold py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected ? 'ring-2 ring-blue-600/20 scale-95' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {pos.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Setup Notes */}
            <div className="space-y-1.5">
              <label className="text-gray-700 text-xs font-semibold">บันทึกช่วยจำ (ไม่บังคับ)</label>
              <input
                type="text"
                placeholder="เช่น ควงเวร, ประจำห้องยาผู้ป่วยนอก..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Custom Submit Button */}
            <div className="pt-2 flex justify-center">
              <button type="submit" className="button w-full" id="addShiftBtn">
                <span className="button-top">➕ บันทึกเวรลงตาราง</span>
                <span className="button-bottom"></span>
                <span className="button-base"></span>
              </button>
            </div>
          </form>

          {isAdded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-center text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded-lg font-bold"
            >
              เพิ่มเวรเข้าระบบเรียบร้อย! ข้อมูลสะท้อนบนปฏิทินทันที
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
