/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shift, Trade, POSITIONS, MONTHS_CONFIG } from './types';
import { 
  loadShifts, 
  saveShifts, 
  loadTrades, 
  saveTrades, 
  clearAllStorage 
} from './utils/helpers';
import TradeForm from './components/TradeForm';
import ScheduleSetup from './components/ScheduleSetup';
import DashboardBefore from './components/DashboardBefore';
import DashboardAfter from './components/DashboardAfter';
import TradeSummaryList from './components/TradeSummaryList';
import HoursSummaryStats from './components/HoursSummaryStats';
import { 
  FileEdit, 
  CalendarRange, 
  Layers, 
  CalendarCheck, 
  History, 
  PieChart, 
  Wifi, 
  Battery, 
  Signal, 
  BellRing,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<number>(4); // Default to Dashboard After (Tab 4) for high immediate visual interest
  const [currentMonth, setCurrentMonth] = useState<string>('2026-07');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);
  const [notifSoundTrigger, setNotifSoundTrigger] = useState(false);

  const monthKeys = Object.keys(MONTHS_CONFIG);

  const handlePrevMonth = () => {
    const currentIndex = monthKeys.indexOf(currentMonth);
    if (currentIndex > 0) {
      const prevMonth = monthKeys[currentIndex - 1];
      setCurrentMonth(prevMonth);
      triggerLocalPushNotification(`📅 เปลี่ยนมุมมองตารางเวรเป็นเดือน ${MONTHS_CONFIG[prevMonth].name}`);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = monthKeys.indexOf(currentMonth);
    if (currentIndex < monthKeys.length - 1) {
      const nextMonth = monthKeys[currentIndex + 1];
      setCurrentMonth(nextMonth);
      triggerLocalPushNotification(`📅 เปลี่ยนมุมมองตารางเวรเป็นเดือน ${MONTHS_CONFIG[nextMonth].name}`);
    }
  };

  // Load from localStorage
  useEffect(() => {
    setShifts(loadShifts());
    setTrades(loadTrades());
  }, []);

  // Save changes
  const handleAddShift = (newShift: Omit<Shift, 'id'>) => {
    const shiftWithId: Shift = {
      ...newShift,
      id: 'shift_' + Date.now() + Math.random().toString(36).substr(2, 5)
    };
    const updated = [shiftWithId, ...shifts].sort((a, b) => a.dateString.localeCompare(b.dateString));
    setShifts(updated);
    saveShifts(updated);

    // Trigger local push notify simulation
    triggerLocalPushNotification(`📅 บันทึกเวรสำเร็จ: ${newShift.timeText} น. วันที่ ${newShift.dateString}`);
  };

  const handleDeleteShift = (id: string) => {
    const updated = shifts.filter(s => s.id !== id);
    setShifts(updated);
    saveShifts(updated);
    triggerLocalPushNotification("🗑️ ลบเวรตั้งต้นออกจากระบบแล้ว");
  };

  const handleClearShifts = () => {
    setShifts([]);
    saveShifts([]);
    triggerLocalPushNotification("🧹 ล้างตารางเวรทั้งหมดเรียบร้อยแล้ว!");
  };

  const handleAddTrade = (newTrade: Omit<Trade, 'id' | 'createdAt'>) => {
    const tradeWithId: Trade = {
      ...newTrade,
      id: 'trade_' + Date.now() + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString()
    };
    const updated = [tradeWithId, ...trades];
    setTrades(updated);
    saveTrades(updated);

    // Trigger push notification simulation
    const typeLabel = newTrade.type === 'buy' ? 'ซื้อเวรจาก' : 'ขายเวรให้';
    triggerLocalPushNotification(`📥 บันทึกการซื้อขายเวร: ${typeLabel} ${newTrade.partnerName} (${newTrade.timeText} น.) สำเร็จแล้ว!`);
  };

  const handleDeleteTrade = (id: string) => {
    const updated = trades.filter(t => t.id !== id);
    setTrades(updated);
    saveTrades(updated);
    triggerLocalPushNotification("🗑️ ยกเลิกรายการซื้อขายเวรสำเร็จ");
  };

  const handleClearAll = () => {
    clearAllStorage();
    // reload defaults
    setShifts(loadShifts());
    setTrades(loadTrades());
    triggerLocalPushNotification("🧹 ล้างข้อมูลระบบและคุ๊กกี้เรียบร้อยแล้ว!");
  };

  // Helper to trigger floating iOS Toast Notification
  const triggerLocalPushNotification = (message: string) => {
    setNotifMessage(message);
    setNotifSoundTrigger(true);
    
    // Play subtle audio vibration if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      setNotifMessage(null);
      setNotifSoundTrigger(false);
    }, 4500);
  };



  // Map tabs to titles and elements
  const tabConfig = [
    { id: 1, label: 'กรอกเวร', sub: 'ซื้อขายเวร', icon: FileEdit },
    { id: 2, label: 'ตั้งค่าเวร', sub: 'อิมพอร์ตตาราง', icon: CalendarRange },
    { id: 3, label: 'ตารางเดิม', sub: 'ตารางหลัก', icon: Layers },
    { id: 4, label: 'ตารางจริง', sub: 'ตารางสุทธิ', icon: CalendarCheck },
    { id: 5, label: 'สรุปเวร', sub: 'ธุรกรรมซื้อขาย', icon: History },
    { id: 6, label: 'สรุปชั่วโมง', sub: 'สถิติและข้อมูล', icon: PieChart },
  ];

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 1:
        return <TradeForm onAddTrade={handleAddTrade} activeTab="buy" currentMonth={currentMonth} />;
      case 2:
        return (
          <ScheduleSetup 
            shifts={shifts} 
            onAddShift={handleAddShift} 
            onDeleteShift={handleDeleteShift} 
            onClearShifts={handleClearShifts}
            currentMonth={currentMonth}
          />
        );
      case 3:
        return <DashboardBefore shifts={shifts} currentMonth={currentMonth} />;
      case 4:
        return <DashboardAfter shifts={shifts} trades={trades} currentMonth={currentMonth} />;
      case 5:
        return (
          <TradeSummaryList 
            trades={trades} 
            onDeleteTrade={handleDeleteTrade} 
            onTriggerMockNotification={triggerLocalPushNotification} 
            currentMonth={currentMonth}
          />
        );
      case 6:
        return <HoursSummaryStats shifts={shifts} trades={trades} onClearAll={handleClearAll} currentMonth={currentMonth} />;
      default:
        return <DashboardAfter shifts={shifts} trades={trades} currentMonth={currentMonth} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center font-sans antialiased md:p-6 lg:p-10 text-gray-800">
      
      {/* Background radial soft light blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--theme-mint)]/20 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--theme-periwinkle)]/20 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Main Responsive Layout wrapper: Show simulated iphone on desktop/tablet, but let it go full bleed on mobile devices */}
      <div className="w-full max-w-full md:max-w-md bg-transparent rounded-none md:rounded-[55px] md:border-8 md:border-[#111] md:shadow-2xl relative overflow-hidden flex flex-col aspect-auto h-screen md:h-[912px] md:ring-1 md:ring-gray-300 transition-all duration-500 bg-white">
        




        {/* Hospital Branding Banner inside layout top */}
        <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-xs bg-emerald-600 px-1.5 py-0.5 rounded font-black text-white tracking-tighter">BPH</span>
            <span className="text-[11px] text-gray-700 font-bold tracking-tight">แผนกเภสัชกรรม รพ.กรุงเทพพัทยา</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-[9px] text-gray-500 font-mono font-bold">STANDALONE APP</span>
          </div>
        </div>

        {/* Month Selector Bar */}
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center text-xs">
          <span className="text-gray-500 font-bold">เดือนปฏิบัติงาน:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={monthKeys.indexOf(currentMonth) === 0}
              className="bg-white border border-gray-200 rounded-lg p-1 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:hover:bg-white cursor-pointer flex items-center justify-center"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <select 
              value={currentMonth} 
              onChange={(e) => {
                setCurrentMonth(e.target.value);
                const monthLabel = MONTHS_CONFIG[e.target.value]?.name || e.target.value;
                triggerLocalPushNotification(`📅 เปลี่ยนมุมมองตารางเวรเป็นเดือน ${monthLabel}`);
              }}
              className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-800 font-bold focus:outline-none focus:border-blue-500 cursor-pointer min-w-[120px]"
            >
              {Array.from(new Set(Object.keys(MONTHS_CONFIG).map(k => k.split('-')[0]))).map(year => (
                <optgroup key={year} label={`ปี ${Number(year) + 543} (ค.ศ. ${year})`}>
                  {Object.entries(MONTHS_CONFIG)
                    .filter(([key]) => key.startsWith(year))
                    .map(([key, value]) => (
                      <option key={key} value={key}>{value.name.split(' ')[0]}</option>
                    ))
                  }
                </optgroup>
              ))}
            </select>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={monthKeys.indexOf(currentMonth) === monthKeys.length - 1}
              className="bg-white border border-gray-200 rounded-lg p-1 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:hover:bg-white cursor-pointer flex items-center justify-center"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Screen Scrollable Viewport */}
        <div className="flex-1 overflow-hidden bg-[#fafafa] relative text-gray-800">
          {renderActiveScreen()}
        </div>

        {/* Custom iOS Bottom Navigation Bar style Tab bar (6 tabs) */}
        <div className="bg-white/95 border-t border-gray-100 backdrop-blur-xl px-2 py-2 flex justify-around items-center z-40 select-none pb-4 shadow-lg">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1 flex flex-col items-center justify-center transition-all relative ${
                  isSelected ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${
                  isSelected ? 'bg-blue-50 scale-110' : 'hover:scale-105'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-semibold mt-0.5 tracking-tight text-center truncate w-full">
                  {tab.label}
                </span>

                {/* Micro badge indicator */}
                {isSelected && (
                  <motion.span 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-[-4px] w-5 h-1 bg-blue-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* iPhone Physical Home Indicator simulated line */}
        <div className="hidden sm:block bg-white pb-1 w-full flex justify-center z-40 border-t border-gray-50">
          <div className="w-32 h-1 bg-gray-200 rounded-full mt-1.5 mb-1" />
        </div>

      </div>

      {/* Side Info Panel (Desktop context) */}
      <div className="ml-12 hidden lg:flex flex-col gap-6 w-80 text-left">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Shift Categories</h3>
          <div className="grid grid-cols-2 gap-3">
            {POSITIONS.map(p => (
              <div key={p.id} className="flex items-center gap-2 text-xs text-gray-700">
                <div className="w-3.5 h-3.5 rounded-md shadow-inner border border-gray-200" style={{ backgroundColor: p.color }} />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">ข้อมูลแอปพลิเคชัน</h3>
          <div className="space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              ระบบซื้อขายเวรนี้จัดทำขึ้นแบบ <strong>Standalone</strong> เพื่อช่วยแก้ไขความซับซ้อนในการคำนวณและลดการลืมเวรของเภสัชกรโรงพยาบาลกรุงเทพพัทยา
            </p>
            
            <div className="space-y-1.5 pt-1">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">รหัสผ่านยืนยันตัวตนล้างระบบ:</h4>
              <code className="bg-gray-50 text-gray-800 px-2.5 py-1.5 rounded-xl border border-gray-200 font-mono block text-center font-bold text-xs select-all">
                123456
              </code>
            </div>

            <div className="pt-2 text-xs border-t border-gray-100 space-y-1.5">
              <p className="font-bold text-gray-700">🔥 จุดเด่นของแอป:</p>
              <ul className="list-disc pl-4 space-y-1 text-gray-600 text-[11px]">
                <li>วิเคราะห์และแสดงผลปฏิทินแบบ <strong>ตารางเวรหลัก</strong> vs <strong>ตารางเวรสุทธิ</strong></li>
                <li>ดาวน์โหลดไฟล์ปฏิทิน <code>.ics</code> ไปใช้บนมือถือจริง</li>
                <li>ระบบจำลอง Push Notifications เข้าโทรศัพท์</li>
                <li>ลิงก์ดราฟต์อีเมล Outlook อัตโนมัติ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
