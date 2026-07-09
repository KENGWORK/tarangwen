/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trade, POSITIONS } from '../types';
import { calculateHoursFromText } from '../utils/helpers';
import { Check, Info, User, Calendar, Clock, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TradeFormProps {
  onAddTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => void;
  activeTab: string;
  currentMonth: string;
}

export default function TradeForm({ onAddTrade, currentMonth }: TradeFormProps) {
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [dateString, setDateString] = useState<string>(`${currentMonth}-08`);
  const [timeText, setTimeText] = useState<string>('16-20');
  const [positionId, setPositionId] = useState<string>('OPD_E3');
  const [partnerName, setPartnerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [remindViaOutlook, setRemindViaOutlook] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'buy' | 'sell'>('buy');

  React.useEffect(() => {
    setDateString(`${currentMonth}-08`);
  }, [currentMonth]);

  const selectedPosition = POSITIONS.find(p => p.id === positionId) || POSITIONS[0];

  const quickTimes = [
    { label: '7-8', value: '7-8' },
    { label: '7-9', value: '7-9' },
    { label: '7-10', value: '7-10' },
    { label: '16-20', value: '16-20' },
    { label: '18-20', value: '18-20' },
    { label: '20-22', value: '20-22' },
  ];

  const quickPartners = [
    'บีม',
    'กอล์ฟ',
    'แนน',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeText || !dateString) return;

    // Calculate start/end time
    const parts = timeText.split('-');
    const startTime = parts[0] ? parseFloat(parts[0]) : 8;
    const endTime = parts[1] ? parseFloat(parts[1]) : 16;

    onAddTrade({
      type,
      dateString,
      timeText,
      startTime,
      endTime,
      positionId,
      partnerName: partnerName || (type === 'buy' ? 'ผู้ขายเวร' : 'ผู้ซื้อเวร'),
      notes,
      isCompleted: true, // Auto-complete for simulation purposes
      remindViaOutlook,
    });

    setSuccessType(type);
    setIsSuccess(true);
    
    // Reset form defaults but keep date and type
    setPartnerName('');
    setNotes('');
  };

  const calculatedHours = calculateHoursFromText(timeText);

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-10 px-4 pt-4 text-gray-800">
      {/* App Header Inside Phone */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">กรอกข้อมูลเวร</h2>
        <p className="text-gray-500 text-xs">บันทึกการซื้อหรือขายเวรแผนกเภสัชกรรม</p>
      </div>

      {/* Success Modal Center Popup */}
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4 relative"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md shadow-emerald-500/10">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900">บันทึกข้อมูลสำเร็จ!</h3>
                <p className="text-xs text-gray-500 leading-relaxed px-2">
                  ระบบได้บันทึกรายการ<strong className="text-emerald-700 font-bold">{successType === 'buy' ? 'ซื้อเวร' : 'ขายเวร'}</strong>และประมวลผลเข้าสู่ฐานข้อมูลปฏิทินปฏิบัติงานเรียบร้อยแล้ว
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                ตกลง / ปิดหน้าต่าง
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toggle Mode Option */}
        <div className="bg-gray-105 p-1.5 rounded-2xl border border-gray-200 flex w-full">
          <button
            type="button"
            onClick={() => setType('buy')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${
              type === 'buy'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📥 ซื้อเวร (เพิ่มเวร)
          </button>
          <button
            type="button"
            onClick={() => setType('sell')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${
              type === 'sell'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/15'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📤 ขายเวร (ลดเวร)
          </button>
        </div>

        {/* Date Selector */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" /> วันที่ปฏิบัติงาน
          </label>
          <input
            type="date"
            value={dateString}
            onChange={(e) => setDateString(e.target.value)}
            required
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Time Text Input-Group (Using User's custom style) */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> ช่วงเวลาทำงาน (เช่น 7-9, 16-20)
          </label>
          
          <div className="input-group">
            <input
              placeholder=" "
              type="text"
              id="timeInput"
              required
              value={timeText}
              onChange={(e) => setTimeText(e.target.value)}
              className="input"
            />
            <label htmlFor="timeInput" className="user-label">ระบุเวลา (เช่น 16-20)</label>
          </div>

          {/* Calculated hours badge */}
          {calculatedHours > 0 && (
            <div className="text-xs text-emerald-800 flex items-center gap-1.5 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-100 font-bold">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              <span>คำนวณได้: <strong className="text-emerald-700 font-mono text-sm">{calculatedHours}</strong> ชั่วโมงทำงาน</span>
            </div>
          )}

          {/* Quick select times */}
          <div className="pt-1.5">
            <p className="text-gray-400 text-[10px] mb-1.5 font-bold uppercase">เลือกเวลาด่วน:</p>
            <div className="flex flex-wrap gap-1.5">
              {quickTimes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTimeText(t.value)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    timeText === t.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Position Selection */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-pink-600" /> ตำแหน่ง / หน้างานหลัก
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {POSITIONS.map((pos) => {
              const isSelected = positionId === pos.id;
              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setPositionId(pos.id)}
                  style={{ 
                    backgroundColor: isSelected ? pos.color : '#f3f4f6',
                    color: isSelected ? pos.textColor : '#4b5563',
                    borderColor: isSelected ? 'transparent' : '#e5e7eb'
                  }}
                  className={`text-[11px] font-bold p-2.5 rounded-xl border text-center transition-all shadow-sm cursor-pointer ${
                    isSelected ? 'ring-2 ring-blue-600/20 scale-95 shadow-md' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {pos.name}
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-gray-500 flex items-center gap-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: selectedPosition.color }}></span>
            <span>หน้างานที่เลือก: <strong className="text-gray-800 font-bold">{selectedPosition.name}</strong></span>
          </div>
        </div>

        {/* Partner Pharmacist */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-600" /> {type === 'buy' ? 'ซื้อเวรจากใคร?' : 'ขายเวรให้ใคร?'}
          </label>
          
          <div className="input-group">
            <input
              placeholder=" "
              type="text"
              id="partnerInput"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="input"
            />
            <label htmlFor="partnerInput" className="user-label">ชื่อเภสัชกรคู่ค้า (เลือกด่วนด้านล่าง)</label>
          </div>

          {/* Quick Partners */}
          <div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickPartners.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPartnerName(p)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                    partnerName === p
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider">บันทึกเพิ่มเติม / สาเหตุ</label>
          <textarea
            placeholder="เช่น ฝากป้อนเข้าระบบ, ขออนุญาตหัวหน้าแล้ว, สลับเวรวันเสาร์..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-850 text-sm focus:border-blue-500 focus:outline-none min-h-[70px]"
          />
        </div>


        {/* Submit Button (Styled using User's custom CSS classes) */}
        <div className="flex justify-center pt-2">
          <button 
            type="submit" 
            className={`button w-full ${type === 'buy' ? '' : 'button-orange'}`}
            id="submitTradeBtn"
          >
            <span className="button-top">
              {type === 'buy' ? '📥 บันทึกการซื้อเวร' : '📤 บันทึกการขายเวร'}
            </span>
            <span className="button-bottom"></span>
            <span className="button-base"></span>
          </button>
        </div>

      </form>
    </div>
  );
}
