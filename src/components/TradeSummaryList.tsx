/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trade, POSITIONS } from '../types';
import { Mail, Calendar, Trash2, AlertTriangle, CheckCircle, Smartphone, ExternalLink, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TradeSummaryListProps {
  trades: Trade[];
  onDeleteTrade: (id: string) => void;
  onTriggerMockNotification: (message: string) => void;
  currentMonth: string;
}

export default function TradeSummaryList({ trades, onDeleteTrade, onTriggerMockNotification, currentMonth }: TradeSummaryListProps) {
  const [selectedTradeForAlert, setSelectedTradeForAlert] = useState<Trade | null>(null);

  // Filter current selected month
  const currentMonthTrades = trades.filter(t => t.dateString.startsWith(currentMonth));

  // Calculate Outlook mailto link
  const generateOutlookMailto = (trade: Trade) => {
    const pos = POSITIONS.find(p => p.id === trade.positionId);
    const subject = encodeURIComponent(`[สลับเวรเภสัชกรรม] แจ้งขอซื้อขายเวร วันที่ ${trade.dateString}`);
    const body = encodeURIComponent(
      `เรียน หัวหน้าแผนกเภสัชกรรม โรงพยาบาลกรุงเทพพัทยา และ In-charge\n\n` +
      `ข้าพเจ้า เภสัชกร มีความประสงค์ขออนุมัติปรับเปลี่ยนเวรปฏิบัติงานในระบบ ดังรายละเอียดต่อไปนี้:\n\n` +
      `• วันที่ปฏิบัติงาน: ${trade.dateString}\n` +
      `• รูปแบบธุรกรรม: ${trade.type === 'buy' ? 'รับซื้อเวรเสริม' : 'ขายเวรให้คนอื่นแทน'}\n` +
      `• ช่วงเวลา: ${trade.timeText} น. (ตำแหน่ง ${pos?.name || 'เภสัชกร'})\n` +
      `• คู่สลับเวร: ${trade.partnerName}\n` +
      `• บันทึกเพิ่มเติม: ${trade.notes || '-'}\n\n` +
      `จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติเข้าระบบและปรับปรุงตารางทางการ\n\n` +
      `ขอแสดงความนับถือ\n` +
      `แผนกเภสัชกรรม โรงพยาบาลกรุงเทพพัทยา`
    );
    return `mailto:chief-pharmacist@bph.co.th?subject=${subject}&body=${body}`;
  };

  // Generate .ics calendar invite for download
  const downloadIcsFile = (trade: Trade) => {
    const pos = POSITIONS.find(p => p.id === trade.positionId);
    const dateFormatted = trade.dateString.replace(/-/g, ''); // "20260708"
    
    // Simple mock start/end hours
    const startHour = Math.floor(trade.startTime).toString().padStart(2, '0');
    const endHour = Math.floor(trade.endTime).toString().padStart(2, '0');
    
    const icsContent = 
      "BEGIN:VCALENDAR\n" +
      "VERSION:2.0\n" +
      "PRODID:-//PharmaShift//Shift Trade System//TH\n" +
      "BEGIN:VEVENT\n" +
      `UID:trade-${trade.id}@bph-pharmacy.com\n` +
      `DTSTAMP:${dateFormatted}T000000Z\n` +
      `DTSTART:${dateFormatted}T${startHour}0000\n` +
      `DTEND:${dateFormatted}T${endHour}0000\n` +
      `SUMMARY:${trade.type === 'buy' ? '📥 [เวรซื้อ] ' : '📤 [เวรขาย] '}${pos?.name} ${trade.timeText} น.\n` +
      `DESCRIPTION:คู่เวร: ${trade.partnerName}\\nบันทึก: ${trade.notes || ''}\\nแจ้งเตือนเวรเภสัชกรรม โรงพยาบาลกรุงเทพพัทยา\n` +
      "LOCATION:แผนกเภสัชกรรม โรงพยาบาลกรุงเทพพัทยา\n" +
      "END:VEVENT\n" +
      "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `เวร-${trade.dateString}-${pos?.name}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTestNotification = (trade: Trade) => {
    const pos = POSITIONS.find(p => p.id === trade.positionId);
    onTriggerMockNotification(
      `⏰ เตือนเวรพรุ่งนี้: วันที่ ${trade.dateString} มีเวร ${trade.timeText} น. ตำแหน่ง ${pos?.name || ''} (${trade.type === 'buy' ? 'เวรที่ซื้อมา' : 'เวรที่ท่านขายแล้ว ดนตรีเว้างดเข้า'})`
    );
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-10 px-4 pt-4 text-gray-800">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">สรุปการซื้อขายเวร</h2>
        <p className="text-gray-500 text-xs">รายการสลับเวร/ซื้อขายเวรทั้งหมดของเดือนปัจจุบัน</p>
      </div>

      {currentMonthTrades.length === 0 ? (
        <div className="my-auto py-12 text-center bg-white border border-gray-200 border-dashed rounded-3xl p-6 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-pulse" />
          <h4 className="text-sm font-bold text-gray-600">ไม่มีประวัติซื้อขายเวร</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
            คุณยังไม่ได้บันทึกการซื้อหรือขายเวรใดๆ ในเดือนนี้ สามารถเพิ่มเวรได้ที่เมนู "กรอกข้อมูลเวร"
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentMonthTrades.map((trade) => {
            const pos = POSITIONS.find(p => p.id === trade.positionId) || POSITIONS[0];
            const isBuy = trade.type === 'buy';
            
            return (
              <div 
                key={trade.id}
                className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all space-y-3.5 relative overflow-hidden"
              >
                {/* Visual accent color flag */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`}
                />

                {/* Header row: Transaction type + Date */}
                <div className="flex justify-between items-start pl-1.5">
                  <div className="space-y-0.5">
                    <span 
                      className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                        isBuy 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}
                    >
                      {isBuy ? '📥 ซื้อเวร (รับงานเพิ่ม)' : '📤 ขายเวร (ให้คนแทน)'}
                    </span>
                    <p className="text-gray-800 font-bold text-sm pt-1.5 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" /> {trade.dateString}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteTrade(trade.id)}
                    className="text-gray-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                    title="ลบธุรกรรมซื้อขายเวรนี้"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Details card inside */}
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex justify-between items-center pl-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-8 rounded-full" style={{ backgroundColor: pos.color }} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 font-black text-sm font-mono">{trade.timeText} น.</span>
                        <span 
                          style={{ backgroundColor: pos.color, color: pos.textColor }}
                          className="text-[9px] font-black px-1.5 py-0.5 rounded"
                        >
                          {pos.name}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {isBuy ? 'ซื้อมาจาก:' : 'ขายให้คนแทน:'} <strong className="text-gray-700 font-bold">{trade.partnerName}</strong>
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">สถานะเวร</p>
                    <p className="text-emerald-600 text-xs font-semibold flex items-center gap-1 justify-end">
                      <CheckCircle className="w-3.5 h-3.5" /> บันทึกแล้ว
                    </p>
                  </div>
                </div>

                {trade.notes && (
                  <p className="text-gray-500 text-xs italic pl-1.5 border-l-2 border-gray-200 py-0.5">
                    " {trade.notes} "
                  </p>
                )}

                {/* Actions row: Outlook */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedTradeForAlert(trade)}
                    className="w-full bg-blue-50 hover:bg-blue-100/85 border border-blue-200 text-blue-700 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-blue-600/5 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>แจ้งเตือน Outlook</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Outlook Alert Modal */}
      <AnimatePresence>
        {selectedTradeForAlert && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-t-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600 animate-bounce" />
                  <span>ระบบส่งแจ้งเตือน Outlook</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  เชื่อมโยงเวรของโรงพยาบาลกรุงเทพพัทยากับระบบอีเมลหรือปฏิทินของท่าน
                </p>
              </div>

              {/* Action options */}
              <div className="space-y-3">
                {/* 1. Send e-mail draft */}
                <a
                  href={generateOutlookMailto(selectedTradeForAlert)}
                  onClick={() => setSelectedTradeForAlert(null)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs p-3.5 rounded-2xl flex items-center justify-between transition-colors shadow-lg shadow-blue-600/15"
                >
                  <div className="flex items-center gap-2 text-left">
                    <ExternalLink className="w-4 h-4 text-white" />
                    <div>
                      <p className="font-bold text-sm text-white">สร้างเมลสลับเวร (Outlook Draft)</p>
                      <p className="text-[10px] text-blue-100 font-normal">เปิดแอปเมลหลักและกรอกข้อมูลฟอร์มสลับเวรให้อัตโนมัติ</p>
                    </div>
                  </div>
                </a>

                {/* 2. Download Calendar ICS file */}
                <button
                  type="button"
                  onClick={() => {
                    downloadIcsFile(selectedTradeForAlert);
                    setSelectedTradeForAlert(null);
                  }}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-xs p-3.5 rounded-2xl flex items-center justify-between border border-gray-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-left">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-sm text-gray-800">ดาวน์โหลดไฟล์ลงปฏิทินมือถือ (.ics)</p>
                      <p className="text-[10px] text-gray-500 font-normal">แอดนัดหมายลงปฏิทิน iPhone/Android พร้อมตั้งแจ้งเตือนล่วงหน้า 1 วัน</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedTradeForAlert(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl text-xs font-semibold transition-colors cursor-pointer"
              >
                ย้อนกลับ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
