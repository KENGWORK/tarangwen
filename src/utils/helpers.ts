/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shift, Trade, POSITIONS } from '../types';

// Parses string like "7-16", "7:30-16:30", "10-23", "7.30-16"
export function calculateHoursFromText(timeText: string): number {
  if (!timeText) return 0;
  
  // Normalize formatting
  const cleaned = timeText
    .replace(/\s+/g, '') // remove spaces
    .replace(/:/g, '.')  // colon to dot for decimals
    .replace(/ถึง/g, '-'); // handle TH keyword

  const parts = cleaned.split('-');
  if (parts.length !== 2) return 0;

  // Function to convert string time e.g. "7.30" to decimal 7.5
  const parseTimeToDecimal = (timeStr: string): number => {
    const val = parseFloat(timeStr);
    if (isNaN(val)) return 0;
    
    // If it contains a dot, split to hours and minutes
    if (timeStr.includes('.')) {
      const subParts = timeStr.split('.');
      const hours = parseInt(subParts[0]) || 0;
      const minStr = subParts[1] || '0';
      // Normalize minute string, e.g. "3" -> 30 mins, "05" -> 5 mins
      let mins = 0;
      if (minStr.length === 1) {
        mins = parseInt(minStr) * 10;
      } else {
        mins = parseInt(minStr.slice(0, 2));
      }
      return hours + (mins / 60);
    }
    return val;
  };

  const start = parseTimeToDecimal(parts[0]);
  const end = parseTimeToDecimal(parts[1]);

  if (start === 0 && end === 0) return 0;

  if (end > start) {
    return Math.round((end - start) * 100) / 100;
  } else {
    // Overnight shift, e.g. 20-8 (20:00 to 8:00 next day)
    return Math.round(((24 - start) + end) * 100) / 100;
  }
}

// Generate default mock data for July 2026
export function getInitialShifts(): Shift[] {
  const shifts: Shift[] = [
    // Week 1
    { id: 's1', dateString: '2026-07-01', startTime: 7, endTime: 16, timeText: '7-16', positionId: 'OPD_A', notes: 'เวรหลักเช้า' },
    { id: 's2', dateString: '2026-07-02', startTime: 8, endTime: 16, timeText: '8-16', positionId: 'OPD_E3', notes: 'เคาน์เตอร์ E3' },
    { id: 's3', dateString: '2026-07-03', startTime: 10, endTime: 23, timeText: '10-23', positionId: 'OPD_O8', notes: 'เวรบ่าย-ดึก' },
    { id: 's4', dateString: '2026-07-05', startTime: 7, endTime: 16, timeText: '7-16', positionId: 'IPD_IPD', notes: 'เวร IPD ตึกหลัก' },
    
    // Week 2
    { id: 's5', dateString: '2026-07-06', startTime: 8, endTime: 16, timeText: '8-16', positionId: 'IV', notes: 'ผสมยาเคมีบำบัด/IV' },
    { id: 's6', dateString: '2026-07-07', startTime: 7, endTime: 16, timeText: '7-16', positionId: 'DIS', notes: 'งานข้อมูลยา DIS' },
    { id: 's7', dateString: '2026-07-08', startTime: 8, endTime: 16, timeText: '8-16', positionId: 'OPD_E3', notes: 'เวรประจำวันนี้' },
    { id: 's8', dateString: '2026-07-09', startTime: 10, endTime: 23, timeText: '10-23', positionId: 'IPD_PROUD', notes: 'เวรหอผู้ป่วย Proud' },
    { id: 's9', dateString: '2026-07-10', startTime: 7, endTime: 16, timeText: '7-16', positionId: 'IPD_HM', notes: 'ตึกพระมหากรุณาธิคุณ' },

    // Week 3
    { id: 's10', dateString: '2026-07-13', startTime: 8, endTime: 16, timeText: '8-16', positionId: 'IPD_MR', notes: 'ตรวจสอบประวัติยา' },
    { id: 's11', dateString: '2026-07-14', startTime: 7, endTime: 16, timeText: '7-16', positionId: 'OPD_A', notes: 'เวรหัวหน้าตรวจ' },
    { id: 's12', dateString: '2026-07-15', startTime: 10, endTime: 23, timeText: '10-23', positionId: 'OPD_O8', notes: 'เวรหนักบ่ายดึก' },
    { id: 's13', dateString: '2026-07-17', startTime: 8, endTime: 16, timeText: '8-16', positionId: 'IV', notes: 'ห้อง IV' },

    // Week 4
    { id: 's14', dateString: '2026-07-20', startTime: 7, endTime: 16, timeText: '7-16', positionId: 'OPD_E3', notes: 'OPD' },
    { id: 's15', dateString: '2026-07-21', startTime: 8, endTime: 16, timeText: '8-16', positionId: 'DIS', notes: 'DIS' },
    { id: 's16', dateString: '2026-07-22', startTime: 10, endTime: 23, timeText: '10-23', positionId: 'IPD_PROUD', notes: 'Proud' },
    { id: 's17', dateString: '2026-07-24', startTime: 7, endTime: 16, timeText: '7-16', positionId: 'IPD_IPD', notes: 'IPD' },

    // Week 5
    { id: 's18', dateString: '2026-07-27', startTime: 8, endTime: 16, timeText: '8-16', positionId: 'IPD_HM', notes: 'HM' },
    { id: 's19', dateString: '2026-07-28', startTime: 7, endTime: 16, timeText: '7-16', positionId: 'OPD_A', notes: 'OPD A' },
    { id: 's20', dateString: '2026-07-29', startTime: 10, endTime: 23, timeText: '10-23', positionId: 'IPD_MR', notes: 'MR' },
  ];
  return shifts;
}

export function getInitialTrades(): Trade[] {
  const trades: Trade[] = [
    {
      id: 't1',
      type: 'buy',
      dateString: '2026-07-08', // today in system
      timeText: '16-20',
      startTime: 16,
      endTime: 20,
      positionId: 'OPD_O8',
      partnerName: 'ภญ.นารี รักษ์ดี',
      notes: 'ซื้อเวรเสริมช่วงเย็นต่อจากเวรปกติ',
      createdAt: '2026-07-07T10:00:00.000Z',
      isCompleted: true,
      remindViaOutlook: true
    },
    {
      id: 't2',
      type: 'sell',
      dateString: '2026-07-15',
      timeText: '10-23',
      startTime: 10,
      endTime: 23,
      positionId: 'OPD_O8',
      partnerName: 'ภญ.พิมพ์ชนก สุขใจ',
      notes: 'ยกเวรบ่ายดึกให้พิมพ์ชนกแทนเนื่องจากติดธุระครอบครัว',
      createdAt: '2026-07-06T15:30:00.000Z',
      isCompleted: true,
      remindViaOutlook: true
    },
    {
      id: 't3',
      type: 'buy',
      dateString: '2026-07-12',
      timeText: '7-16',
      startTime: 7,
      endTime: 16,
      positionId: 'IPD_IPD',
      partnerName: 'ภก.สมเกียรติ ยอดเยี่ยม',
      notes: 'รับซื้อเวรวันอาทิตย์เพิ่มเพื่อสะสมชั่วโมงทำงาน',
      createdAt: '2026-07-07T08:15:00.000Z',
      isCompleted: false,
      remindViaOutlook: false
    }
  ];
  return trades;
}

// Storage Keys
const SHIFTS_KEY = 'pharma_shifts_schedule';
const TRADES_KEY = 'pharma_shifts_trades';

export function loadShifts(): Shift[] {
  try {
    const data = localStorage.getItem(SHIFTS_KEY);
    if (!data) {
      const defaults = getInitialShifts();
      localStorage.setItem(SHIFTS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading shifts', e);
    return getInitialShifts();
  }
}

export function saveShifts(shifts: Shift[]) {
  try {
    localStorage.setItem(SHIFTS_KEY, JSON.stringify(shifts));
  } catch (e) {
    console.error('Error saving shifts', e);
  }
}

export function loadTrades(): Trade[] {
  try {
    const data = localStorage.getItem(TRADES_KEY);
    if (!data) {
      const defaults = getInitialTrades();
      localStorage.setItem(TRADES_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading trades', e);
    return getInitialTrades();
  }
}

export function saveTrades(trades: Trade[]) {
  try {
    localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
  } catch (e) {
    console.error('Error saving trades', e);
  }
}

export function clearAllStorage() {
  localStorage.removeItem(SHIFTS_KEY);
  localStorage.removeItem(TRADES_KEY);
}
