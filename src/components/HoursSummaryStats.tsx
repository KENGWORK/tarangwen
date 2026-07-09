/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shift, Trade, POSITIONS, MONTHS_CONFIG } from '../types';
import { 
  Clock, 
  ShieldAlert, 
  Check, 
  RefreshCw, 
  AlertOctagon, 
  Flame, 
  Target, 
  Star, 
  Trash, 
  Plus, 
  Coins, 
  CalendarRange, 
  Calculator, 
  Info,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HoursSummaryStatsProps {
  shifts: Shift[];
  trades: Trade[];
  onClearAll: () => void;
  currentMonth: string;
}

interface Allowance {
  id: string;
  note: string;
  amount: number;
}

interface Deduction {
  id: string;
  note: string;
  amount: number;
}

export default function HoursSummaryStats({ shifts, trades, onClearAll, currentMonth }: HoursSummaryStatsProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

  // --- Salary & Allowance & Holiday States ---
  const [salary, setSalary] = useState<number>(35000);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [holidays, setHolidays] = useState<number[]>([]);

  // Local input states for adding other allowances
  const [allowanceNote, setAllowanceNote] = useState('');
  const [allowanceAmount, setAllowanceAmount] = useState('');

  // Local input states for adding fixed deductions
  const [deductionNote, setDeductionNote] = useState('');
  const [deductionAmount, setDeductionAmount] = useState('');

  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const getPreviousMonthKey = (monthKey: string): string => {
    const [yearStr, monthStr] = monthKey.split('-');
    const yr = parseInt(yearStr, 10);
    const mo = parseInt(monthStr, 10); // 1-12
    
    let prevYear = yr;
    let prevMonth = mo - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = yr - 1;
    }
    
    return `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;
  };

  const prevMonthKey = getPreviousMonthKey(currentMonth);
  const prevMonthName = MONTHS_CONFIG[prevMonthKey]?.name || prevMonthKey;

  // Check if previous month has any setup to copy
  const prevSalary = localStorage.getItem(`salary-${prevMonthKey}`) || localStorage.getItem('salary');
  const prevAllowancesStr = localStorage.getItem(`allowances-${prevMonthKey}`);
  const prevDeductionsStr = localStorage.getItem(`deductions-${prevMonthKey}`);
  
  const hasPrevSetup = !!(prevSalary || (prevAllowancesStr && JSON.parse(prevAllowancesStr).length > 0) || (prevDeductionsStr && JSON.parse(prevDeductionsStr).length > 0));

  const monthConfig = MONTHS_CONFIG[currentMonth] || MONTHS_CONFIG['2026-07'];

  // Parse current year and month
  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10) || 2026;
  const month = (parseInt(monthStr, 10) || 7) - 1; // 0-indexed month

  // --- Sync with LocalStorage on currentMonth change ---
  useEffect(() => {
    const savedSalary = localStorage.getItem(`salary-${currentMonth}`) || localStorage.getItem('salary');
    setSalary(savedSalary ? parseFloat(savedSalary) : 35000);

    const savedAllowances = localStorage.getItem(`allowances-${currentMonth}`);
    setAllowances(savedAllowances ? JSON.parse(savedAllowances) : []);

    const savedDeductions = localStorage.getItem(`deductions-${currentMonth}`);
    setDeductions(savedDeductions ? JSON.parse(savedDeductions) : []);

    const savedHolidays = localStorage.getItem(`holidays-${currentMonth}`);
    setHolidays(savedHolidays ? JSON.parse(savedHolidays) : []);
  }, [currentMonth]);

  // --- Helper state updaters that persist in localStorage ---
  const updateSalary = (newSalary: number) => {
    setSalary(newSalary);
    localStorage.setItem(`salary-${currentMonth}`, newSalary.toString());
    localStorage.setItem('salary', newSalary.toString());
  };

  const updateAllowances = (newAllowances: Allowance[]) => {
    setAllowances(newAllowances);
    localStorage.setItem(`allowances-${currentMonth}`, JSON.stringify(newAllowances));
  };

  const updateDeductions = (newDeductions: Deduction[]) => {
    setDeductions(newDeductions);
    localStorage.setItem(`deductions-${currentMonth}`, JSON.stringify(newDeductions));
  };

  const updateHolidays = (newHolidays: number[]) => {
    setHolidays(newHolidays);
    localStorage.setItem(`holidays-${currentMonth}`, JSON.stringify(newHolidays));
  };

  const handleCopyFromPreviousMonth = () => {
    const prevSalaryVal = localStorage.getItem(`salary-${prevMonthKey}`) || localStorage.getItem('salary') || '35000';
    const prevAllowancesJson = localStorage.getItem(`allowances-${prevMonthKey}`) || '[]';
    const prevDeductionsJson = localStorage.getItem(`deductions-${prevMonthKey}`) || '[]';

    // Map items to new IDs to prevent duplicated React keys
    const prevAllowances = JSON.parse(prevAllowancesJson).map((item: Allowance) => ({
      ...item,
      id: `${item.id}-copy-${Date.now()}`
    }));

    const prevDeductions = JSON.parse(prevDeductionsJson).map((item: Deduction) => ({
      ...item,
      id: `${item.id}-copy-${Date.now()}`
    }));

    const salaryNum = parseFloat(prevSalaryVal) || 35000;

    updateSalary(salaryNum);
    updateAllowances(prevAllowances);
    updateDeductions(prevDeductions);

    setShowCopySuccess(true);
    setTimeout(() => {
      setShowCopySuccess(false);
    }, 2000);
  };

  // Helper function to check if shift crosses/covers 2:00 AM
  const isNightShift = (start: number, end: number): boolean => {
    if (end <= start) {
      // Crosses midnight (e.g. 20-7)
      return end > 2 || start <= 2;
    } else {
      // Same day (e.g. 1-9)
      return start <= 2 && end > 2;
    }
  };

  // --- Filter active month items ---
  const monthlyShifts = shifts.filter(s => s.dateString.startsWith(currentMonth));
  const monthlyTrades = trades.filter(t => t.dateString.startsWith(currentMonth));

  // --- Calculate Shift totals ---
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

  // Net shift hours (from active working roster and trade activities)
  const netShiftHours = totalOriginalHours + totalBoughtHours - totalSoldHours;

  // --- 1. Actual Work Hours (ชั่วโมงทำงานจริง) ---
  // Based on shifts roster + (8 * number of holidays)
  const holidayCount = holidays.length;
  const actualWorkHours = netShiftHours + (holidayCount * 8);

  // --- 2. Company Standard Work Hours (ชั่วโมงทำงานตามเวลาของบริษัท) ---
  // Monday to Friday = 8 hours/day, Saturday = 4 hours/day, Sunday = 0 hours/day
  const calculateCompanyStandardHours = (yr: number, mo: number) => {
    const numDays = new Date(yr, mo + 1, 0).getDate();
    let totalStandard = 0;
    for (let d = 1; d <= numDays; d++) {
      const date = new Date(yr, mo, d);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        totalStandard += 8;
      } else if (dayOfWeek === 6) {
        totalStandard += 4;
      }
    }
    return totalStandard;
  };

  const companyStandardHours = calculateCompanyStandardHours(year, month);

  // --- 3. OT Hours (จำนวนชั่วโมงโอที) ---
  // OT = Actual Work Hours - Company Standard Hours
  const otHours = actualWorkHours - companyStandardHours;

  // Calculate Night Shift count
  let nightShiftCount = 0;
  monthlyShifts.forEach(s => {
    if (isNightShift(s.startTime, s.endTime)) {
      nightShiftCount += 1;
    }
  });
  monthlyTrades.forEach(t => {
    if (isNightShift(t.startTime, t.endTime)) {
      if (t.type === 'buy') {
        nightShiftCount += 1;
      } else if (t.type === 'sell') {
        nightShiftCount -= 1;
      }
    }
  });
  nightShiftCount = Math.max(0, nightShiftCount);
  const nightShiftBonus = nightShiftCount * 1000;

  // --- 4. Income Calculations ---
  const otPayRate = 300;
  const otPay = otHours > 0 ? Math.round(otHours * otPayRate) : 0;
  const totalOtRevenue = otPay + nightShiftBonus;
  
  // Deductions calculation
  const otTax = Math.round(totalOtRevenue * 0.15); // Withholding tax is 15% of total OT revenue
  const deductionsTotal = deductions.reduce((acc, curr) => acc + curr.amount, 0); // Fixed user deductions
  const totalDeductions = deductionsTotal + otTax;

  const allowancesTotal = allowances.reduce((acc, curr) => acc + curr.amount, 0);
  const totalGrossIncome = salary + totalOtRevenue + allowancesTotal;
  const netIncome = totalGrossIncome - totalDeductions;

  // Target percent of work completion against standard company hours
  const targetPercent = companyStandardHours > 0 
    ? Math.min(Math.round((actualWorkHours / companyStandardHours) * 100), 200) 
    : 0;

  // --- Allowance List Management ---
  const handleAddAllowance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowanceNote.trim() || !allowanceAmount) return;
    const amountVal = parseFloat(allowanceAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    const newItem: Allowance = {
      id: Date.now().toString(),
      note: allowanceNote.trim(),
      amount: amountVal
    };

    const updated = [...allowances, newItem];
    updateAllowances(updated);
    setAllowanceNote('');
    setAllowanceAmount('');
  };

  const handleRemoveAllowance = (id: string) => {
    const updated = allowances.filter(item => item.id !== id);
    updateAllowances(updated);
  };

  // --- Deduction List Management ---
  const handleAddDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deductionNote.trim() || !deductionAmount) return;
    const amountVal = parseFloat(deductionAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    const newItem: Deduction = {
      id: Date.now().toString(),
      note: deductionNote.trim(),
      amount: amountVal
    };

    const updated = [...deductions, newItem];
    updateDeductions(updated);
    setDeductionNote('');
    setDeductionAmount('');
  };

  const handleRemoveDeduction = (id: string) => {
    const updated = deductions.filter(item => item.id !== id);
    updateDeductions(updated);
  };

  // --- Holiday Toggle ---
  const handleToggleHoliday = (dayNum: number) => {
    let updated: number[];
    if (holidays.includes(dayNum)) {
      updated = holidays.filter(d => d !== dayNum);
    } else {
      updated = [...holidays, dayNum].sort((a, b) => a - b);
    }
    updateHolidays(updated);
  };

  // --- Position Hours Aggregation ---
  const positionHoursMap: { [key: string]: number } = {};
  POSITIONS.forEach(p => {
    positionHoursMap[p.id] = 0;
  });

  monthlyShifts.forEach(s => {
    const hours = s.endTime > s.startTime ? (s.endTime - s.startTime) : ((24 - s.startTime) + s.endTime);
    if (positionHoursMap[s.positionId] !== undefined) {
      positionHoursMap[s.positionId] += hours;
    } else {
      positionHoursMap[s.positionId] = hours;
    }
  });

  monthlyTrades.filter(t => t.type === 'sell').forEach(t => {
    const hours = t.endTime > t.startTime ? (t.endTime - t.startTime) : ((24 - t.startTime) + t.endTime);
    if (positionHoursMap[t.positionId] !== undefined) {
      positionHoursMap[t.positionId] = Math.max(0, positionHoursMap[t.positionId] - hours);
    }
  });

  monthlyTrades.filter(t => t.type === 'buy').forEach(t => {
    const hours = t.endTime > t.startTime ? (t.endTime - t.startTime) : ((24 - t.startTime) + t.endTime);
    if (positionHoursMap[t.positionId] !== undefined) {
      positionHoursMap[t.positionId] += hours;
    } else {
      positionHoursMap[t.positionId] = hours;
    }
  });

  const activePositionHours = Object.keys(positionHoursMap)
    .map(key => {
      const pos = POSITIONS.find(p => p.id === key);
      return {
        id: key,
        name: pos?.name || key,
        color: pos?.color || '#9ca3af',
        textColor: pos?.textColor || '#000000',
        hours: positionHoursMap[key]
      };
    })
    .filter(item => item.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  // --- Advanced Cache Reset ---
  const handleClearCache = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmCode === '123456789') {
      setIsCleared(true);
      setTimeout(() => {
        onClearAll();
        setShowConfirmModal(false);
        setConfirmCode('');
        setCodeError(false);
        setIsCleared(false);
      }, 1500);
    } else {
      setCodeError(true);
      setTimeout(() => setCodeError(false), 2000);
    }
  };

  // --- Calendar Layout Calculations ---
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const weekdayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-10 px-4 pt-4 text-gray-800">
      
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">สรุปจำนวนชั่วโมง</h2>
        <p className="text-gray-500 text-xs">วิเคราะห์ภาระงาน วันหยุดราชการ และคำนวณเงินเดือนสุทธิ {monthConfig.name}</p>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {/* Stat 1: ชั่วโมงทำงานจริง */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ชั่วโมงทำงานจริง</span>
            <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-gray-900 font-mono">{actualWorkHours}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              รวมเครดิตวันหยุด (+{holidayCount * 8} ชม.)
            </p>
          </div>
        </div>

        {/* Stat 2: ชั่วโมงตามเกณฑ์บริษัท */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ชั่วโมงตามเกณฑ์</span>
            <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
              <CalendarRange className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-gray-900 font-mono">{companyStandardHours}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">จ.-ศ. 8ชม, ส. 4ชม, อา. 0ชม</p>
          </div>
        </div>

        {/* Stat 3: ชั่วโมงโอที */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ชั่วโมงโอที</span>
            <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className={`text-2xl font-black font-mono ${otHours >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {otHours >= 0 ? `+${otHours}` : otHours}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {otHours >= 0 ? 'สะสมโอทีส่วนเกิน' : 'ชั่วโมงขาดเกณฑ์ทำงาน'}
            </p>
          </div>
        </div>

        {/* Stat 4: ค่าตอบแทนโอที */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ประมาณการรายรับโอที</span>
            <div className="p-1 rounded-lg bg-amber-50 text-amber-600">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-gray-900 font-mono">฿{totalOtRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              ชม.ละ {otPayRate}บ + ดึก {nightShiftCount} เวร
            </p>
          </div>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-gray-500 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            อัตราการปฏิบัติงานเทียบกับเกณฑ์บริษัท
          </span>
          <span className="font-bold text-blue-600 font-mono">{targetPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500" 
            style={{ width: `${Math.min(targetPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* 2-Column Split: Calendar & Financial Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Left Column: Holiday Date Picker Grid */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                📅 ปฏิทินวันหยุดราชการ / บริษัท
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                คลิกเลือกวันหยุดในเดือนนี้ เพื่อรับเครดิตชั่วโมงทำงานเพิ่ม (+8 ชม. ต่อวัน)
              </p>
            </div>
            <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-lg">
              หยุด {holidayCount} วัน (+{holidayCount * 8} ชม.)
            </span>
          </div>

          {/* Calendar Grid headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400">
            {weekdayNames.map((n, i) => (
              <div 
                key={i} 
                className={i === 0 ? 'text-rose-500' : i === 6 ? 'text-indigo-500' : ''}
              >
                {n}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty boxes for start offset */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`offset-${i}`} className="aspect-square bg-gray-50/50 rounded-lg border border-transparent" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dayOfWeek = dateObj.getDay();
              const isHoliday = holidays.includes(dayNum);

              // Daily expected standard hours
              let stdHours = 8;
              if (dayOfWeek === 6) stdHours = 4;
              if (dayOfWeek === 0) stdHours = 0;

              // Styles
              let cellClass = "aspect-square flex flex-col justify-between p-1.5 rounded-xl border text-left cursor-pointer transition-all relative select-none ";
              
              if (isHoliday) {
                cellClass += "bg-red-500 border-red-600 text-white shadow-sm hover:bg-red-600 shadow-red-500/25";
              } else if (dayOfWeek === 0) {
                cellClass += "bg-rose-50/50 border-rose-100/50 text-rose-700 hover:bg-rose-100/60";
              } else if (dayOfWeek === 6) {
                cellClass += "bg-indigo-50/50 border-indigo-100/50 text-indigo-700 hover:bg-indigo-100/60";
              } else {
                cellClass += "bg-gray-50/70 border-gray-100 text-gray-800 hover:bg-gray-100";
              }

              return (
                <div 
                  key={dayNum} 
                  onClick={() => handleToggleHoliday(dayNum)}
                  className={cellClass}
                  title={`วันที ${dayNum} ${dayOfWeek === 0 ? 'อาทิตย์' : dayOfWeek === 6 ? 'เสาร์' : 'จันทร์-ศุกร์'} เกณฑ์บริษัท: ${stdHours} ชม.`}
                >
                  <span className="text-xs font-bold leading-none">{dayNum}</span>
                  <span className={`text-[8px] font-semibold text-center w-full block mt-auto leading-none ${isHoliday ? 'text-red-100' : 'text-gray-400'}`}>
                    {isHoliday ? 'วันหยุด' : `${stdHours}ชม`}
                  </span>
                </div>
              );
            })}
          </div>


        </div>

        {/* Right Column: Salary & Income Calculator */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-600" />
                ระบบคำนวณเงินเดือน และรายรับ
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                ประเมินรายรับสุทธิสะสมในแต่ละเดือน รวมทั้งฐานเงินเดือน รายรับโอที และเบี้ยเลี้ยง
              </p>
            </div>
            {hasPrevSetup && (
              <button
                type="button"
                onClick={handleCopyFromPreviousMonth}
                className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-lg text-[10px] font-bold transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
                title={`ดึงฐานเงินเดือน รายรับ และรายการหักจากเดือน ${prevMonthName}`}
              >
                {showCopySuccess ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>คัดลอกสำเร็จ!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin-slow" />
                    <span>คัดลอกค่าจากเดือนที่แล้ว ({MONTHS_CONFIG[prevMonthKey]?.shortName || prevMonthKey})</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Form: Base Salary */}
          <div className="space-y-1.5">
            <label className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider block">
              ฐานเงินเดือนพื้นฐาน (฿)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-gray-400 font-bold">฿</span>
              <input
                type="number"
                min="0"
                placeholder="ระบุจำนวนเงินเดือนพื้นฐาน"
                value={salary || ''}
                onChange={(e) => updateSalary(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50/70 border border-gray-200 rounded-xl pl-8 pr-4 py-2 text-xs font-black text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Form: Add Allowances */}
          <form onSubmit={handleAddAllowance} className="space-y-2 border-t border-gray-100 pt-3">
            <label className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider block">
              เพิ่มรายรับ / ค่าตอบแทนพิเศษอื่น
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="ระบุประเภท (เช่น ค่าเวรบ่าย, ค่าตอบแทนวิชาชีพ)"
                value={allowanceNote}
                onChange={(e) => setAllowanceNote(e.target.value)}
                className="bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-[11px] focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-gray-800 font-medium"
              />
              <div className="relative">
                <span className="absolute left-3 top-2 text-[10px] text-gray-400 font-bold">฿</span>
                <input
                  type="number"
                  min="1"
                  placeholder="จำนวนเงิน"
                  value={allowanceAmount}
                  onChange={(e) => setAllowanceAmount(e.target.value)}
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl pl-6 pr-8 py-2 text-[11px] focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-gray-800 font-bold"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded-lg transition-colors cursor-pointer"
                  title="เพิ่มค่าตอบแทน"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>

          {/* Allowances List */}
          <div className="space-y-1.5 max-h-[110px] overflow-y-auto no-scrollbar">
            {allowances.length === 0 ? (
              <p className="text-center text-[10px] text-gray-400 py-1.5 border border-dashed border-gray-100 rounded-xl">
                ยังไม่มีการบันทึกค่าตอบแทนพิเศษอื่นๆ ในเดือนนี้
              </p>
            ) : (
              <div className="space-y-1">
                {allowances.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center bg-gray-50 hover:bg-gray-100/80 px-3 py-1.5 rounded-xl border border-gray-100 transition-colors group"
                  >
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-700">{item.note}</p>
                      <p className="text-[9px] text-gray-400">ค่าตอบแทนเสริม</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-bold text-gray-800 font-mono">
                        +฿{item.amount.toLocaleString()}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllowance(item.id)}
                        className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
                        title="ลบรายการ"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form: Add Deductions */}
          <form onSubmit={handleAddDeduction} className="space-y-2 border-t border-gray-100 pt-3">
            <label className="text-rose-600 text-[10px] font-semibold uppercase tracking-wider block">
              หักจากเงินเดือน / รายการหัก (Fix)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="ระบุประเภท (เช่น ค่าธรรมเนียม, หักลากิจ)"
                value={deductionNote}
                onChange={(e) => setDeductionNote(e.target.value)}
                className="bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-[11px] focus:border-red-500 focus:bg-white focus:outline-none transition-all text-gray-800 font-medium"
              />
              <div className="relative">
                <span className="absolute left-3 top-2 text-[10px] text-gray-400 font-bold">฿</span>
                <input
                  type="number"
                  min="1"
                  placeholder="จำนวนเงิน"
                  value={deductionAmount}
                  onChange={(e) => setDeductionAmount(e.target.value)}
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl pl-6 pr-8 py-2 text-[11px] focus:border-red-500 focus:bg-white focus:outline-none transition-all text-gray-800 font-bold"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg transition-colors cursor-pointer"
                  title="เพิ่มรายการหัก"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>

          {/* Deductions List */}
          <div className="space-y-1.5 max-h-[110px] overflow-y-auto no-scrollbar">
            {deductions.length === 0 ? (
              <p className="text-center text-[10px] text-gray-400 py-1.5 border border-dashed border-gray-100 rounded-xl">
                ยังไม่มีการบันทึกรายการหักอื่นๆ ในเดือนนี้
              </p>
            ) : (
              <div className="space-y-1">
                {deductions.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center bg-gray-50 hover:bg-gray-100/80 px-3 py-1.5 rounded-xl border border-gray-100 transition-colors group"
                  >
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-700">{item.note}</p>
                      <p className="text-[9px] text-gray-400">รายการหักผู้ใช้ตั้งค่า</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-bold text-rose-600 font-mono">
                        -฿{item.amount.toLocaleString()}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeduction(item.id)}
                        className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
                        title="ลบรายการ"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Net Salary Invoice */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/15 rounded-2xl p-4 space-y-2 text-emerald-950">
            <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest border-b border-emerald-500/10 pb-1 flex justify-between items-center">
              <span>🧾 ใบแสดงสรุปรายรับและรายการหัก</span>
              <span className="font-mono font-bold text-emerald-700">NET SALARY SLIP</span>
            </h4>

            <div className="space-y-2 text-[11px]">
              {/* รายรับ */}
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-emerald-800 tracking-wider uppercase">ส่วนรายรับ (Earnings)</p>
                <div className="flex justify-between pl-1">
                  <span className="text-gray-500">ฐานเงินเดือนพื้นฐาน:</span>
                  <span className="font-mono font-bold">฿{salary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pl-1">
                  <span className="text-gray-500">ค่าชั่วโมงโอทีสะสม ({otHours > 0 ? otHours : 0} ชม. × ฿300):</span>
                  <span className="font-mono font-bold text-emerald-700">
                    +฿{otPay.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pl-1">
                  <span className="text-gray-500">ค่าเวรดึกคร่อม ตี 2 ({nightShiftCount} เวร × ฿1,000):</span>
                  <span className="font-mono font-bold text-emerald-700">
                    +฿{nightShiftBonus.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pl-1">
                  <span className="text-gray-500">ค่าตอบแทนพิเศษอื่นๆ:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    +฿{allowancesTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-emerald-500/5 pt-1 pl-1 font-bold text-emerald-900">
                  <span>รวมรายรับพึงได้:</span>
                  <span className="font-mono">฿{totalGrossIncome.toLocaleString()}</span>
                </div>
              </div>

              {/* รายการหัก */}
              <div className="space-y-1 border-t border-emerald-500/10 pt-2">
                <p className="text-[9px] font-bold text-rose-800 tracking-wider uppercase">ส่วนรายการหัก (Deductions)</p>
                <div className="flex justify-between pl-1">
                  <span className="text-gray-500">ภาษี ณ ที่จ่าย 15% (คิดจาก OT ฿{totalOtRevenue.toLocaleString()}):</span>
                  <span className="font-mono font-bold text-rose-600">
                    -฿{otTax.toLocaleString()}
                  </span>
                </div>
                {deductions.length > 0 && (
                  <div className="flex justify-between pl-1">
                    <span className="text-gray-500">รายการหักแบบ Fix ({deductions.length} รายการ):</span>
                    <span className="font-mono font-bold text-rose-600">
                      -฿{deductionsTotal.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-rose-500/5 pt-1 pl-1 font-bold text-rose-800">
                  <span>รวมรายการหักทั้งสิ้น:</span>
                  <span className="font-mono">-฿{totalDeductions.toLocaleString()}</span>
                </div>
              </div>

              {/* สรุปสุทธิ */}
              <div className="border-t border-emerald-500/15 pt-1.5 mt-2 flex justify-between items-center">
                <span className="text-xs font-black text-emerald-900">รายรับสุทธิหลังหักรายการ:</span>
                <span className="text-lg font-black text-emerald-600 font-mono">
                  ฿{netIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hourly Breakdown Details list & Position Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Detail breakdown list */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-1.5">
              📊 รายละเอียดชั่วโมงปฏิบัติงานสุทธิ
            </h4>

            <div className="space-y-2.5 mt-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  <p className="text-[11px] text-gray-600">ชั่วโมงเวรตั้งต้นทั้งหมด</p>
                </div>
                <p className="text-xs font-bold text-gray-800 font-mono">{totalOriginalHours} ชม.</p>
              </div>

              <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <p className="text-[11px] text-emerald-700">ชั่วโมงรับซื้อเวรเพิ่มเติม (+)</p>
                </div>
                <p className="text-xs font-bold text-emerald-600 font-mono">+{totalBoughtHours} ชม.</p>
              </div>

              <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <p className="text-[11px] text-rose-700">ชั่วโมงปล่อยขายเวรออก (-)</p>
                </div>
                <p className="text-xs font-bold text-rose-500 font-mono">-{totalSoldHours} ชม.</p>
              </div>

              <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <p className="text-[11px] text-red-600">เครดิตวันหยุดชดเชยทำงานจริง (+)</p>
                </div>
                <p className="text-xs font-bold text-red-500 font-mono">+{holidayCount * 8} ชม.</p>
              </div>

              <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <p className="text-[11px] text-indigo-700">เวรดึกที่คร่อมเวลา ตี 2 (+1,000 บาท/เวร)</p>
                </div>
                <p className="text-xs font-bold text-indigo-600 font-mono">{nightShiftCount} เวร</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-200 pt-2.5 mt-3">
            <p className="text-xs text-gray-800 font-bold">ชั่วโมงรวมปฏิบัติจริงสุทธิ</p>
            <p className="text-base font-black text-blue-600 font-mono">{actualWorkHours} ชั่วโมง</p>
          </div>
        </div>

        {/* Position list bar charts */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              🎨 สถิติสะสมแยกตามหน้าที่งาน
            </h4>
            <span className="text-[10px] text-gray-400 font-bold">จากตารางเวร</span>
          </div>

          {activePositionHours.length === 0 ? (
            <p className="text-center text-gray-400 text-xs py-10">ยังไม่เคยมีตารางเวรที่บันทึกชั่วโมง</p>
          ) : (
            <div className="space-y-3.5">
              {activePositionHours.map((item) => {
                const itemPercent = Math.round((item.hours / Math.max(netShiftHours, 1)) * 100);
                return (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="text-gray-500 text-[10px] font-mono font-medium">
                        {item.hours} ชม. <span className="text-gray-400">({itemPercent}%)</span>
                      </span>
                    </div>
                    {/* Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          backgroundColor: item.color, 
                          width: `${itemPercent}%` 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Advanced Tools & Factory Reset Area */}
      <div className="bg-rose-50 border border-rose-100 p-4 rounded-3xl mb-8 space-y-3 text-left">
        <div className="flex gap-2 items-start">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold text-rose-800 uppercase">ระบบล้างข้อมูลและประวัติแคช</h5>
            <p className="text-[10px] text-rose-700 leading-relaxed">
              ลบฐานข้อมูล LocalStorage ทั้งหมดเพื่อรีเซ็ตระบบเข้าสู่สถานะเริ่มต้น
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-colors"
        >
          🗑️ ลบแคชและคุกกี้ระบบ
        </button>
      </div>

      {/* Reset confirmation modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="bg-white border border-gray-100 rounded-t-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative text-left text-gray-800"
            >
              <div className="space-y-1">
                <h3 className="text-base font-black text-rose-600 flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 animate-pulse" />
                  <span>ยืนยันการทำลายข้อมูลระบบ?</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  การกระทำนี้จะล้างตารางเวรทั้งหมด ประวัติการซื้อขายเวร ข้อมูลเงินเดือน และวันหยุดชดเชยทั้งหมด คืนสู่ค่าแรกเริ่มโรงพยาบาลกรุงเทพพัทยา และไม่สามารถกู้คืนได้
                </p>
              </div>

              <form onSubmit={handleClearCache} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-gray-700 text-[11px] font-semibold">กรอกรหัสยืนยันตัวตนเพื่อลบข้อมูล</label>
                  <input
                    type="password"
                    placeholder="รหัสผ่านผู้ดูแลระบบ (123456789)"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:border-rose-500 focus:outline-none"
                    required
                  />
                  {codeError && (
                    <p className="text-rose-600 text-[10px] font-medium">❌ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setConfirmCode('');
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-2xl text-xs font-semibold transition-colors"
                  >
                    ยกเลิก / ปิดหน้านี้
                  </button>

                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-2xl text-xs font-bold transition-colors"
                  >
                    {isCleared ? 'กำลังล้าง...' : '💣 ยืนยันล้างข้อมูล'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
