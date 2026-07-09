/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Shift {
  id: string;
  startTime: number; // e.g. 7
  endTime: number;   // e.g. 16
  timeText: string;  // e.g. "7-16" or "7.30-16.30"
  positionId: string; // e.g. "OPD_A"
  dateString: string; // "YYYY-MM-DD"
  notes?: string;
}

export interface Trade {
  id: string;
  type: 'buy' | 'sell';
  dateString: string; // "YYYY-MM-DD"
  timeText: string;   // e.g. "7-9" or "16-20"
  startTime: number;
  endTime: number;
  positionId: string;
  partnerName: string; // pharmacist name
  notes?: string;
  createdAt: string;
  isCompleted: boolean;
  remindViaOutlook: boolean;
}

export interface Position {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

export const POSITIONS: Position[] = [
  { id: 'OPD_A', name: 'OPD(A)', color: '#58E655', textColor: '#000000' },
  { id: 'OPD_E3', name: 'OPD(E3)', color: '#FFB5C6', textColor: '#000000' },
  { id: 'OPD_O8', name: 'OPD(O8)', color: '#FFAB26', textColor: '#000000' },
  { id: 'IPD_HM', name: 'IPD(HM)', color: '#A69E94', textColor: '#ffffff' },
  { id: 'IPD_MR', name: 'IPD(MR)', color: '#E6E3E3', textColor: '#000000' },
  { id: 'IPD_PROUD', name: 'IPD(Proud)', color: '#8230C2', textColor: '#ffffff' },
  { id: 'IPD_IPD', name: 'IPD(IPD)', color: '#1648BA', textColor: '#ffffff' },
  { id: 'IV', name: 'IV', color: '#D42220', textColor: '#ffffff' },
  { id: 'DIS', name: 'DIS', color: '#89EBFA', textColor: '#000000' }
];

export const THEME_COLORS = {
  primary: '#B8FCF3',
  sky: '#B8E3FC',
  periwinkle: '#B8C1FC',
  pink: '#FCB8C1',
  yellow: '#FCF3B8',
};

export interface MonthInfo {
  name: string;
  shortName: string;
  days: number;
  startDayOfWeek: number;
}

export const MONTHS_CONFIG: Record<string, MonthInfo> = {
  '2026-07': { name: 'กรกฎาคม 2026', shortName: 'ก.ค. 2026', days: 31, startDayOfWeek: 3 },
  '2026-08': { name: 'สิงหาคม 2026', shortName: 'ส.ค. 2026', days: 31, startDayOfWeek: 6 },
  '2026-09': { name: 'กันยายน 2026', shortName: 'ก.ย. 2026', days: 30, startDayOfWeek: 2 },
  '2026-10': { name: 'ตุลาคม 2026', shortName: 'ต.ค. 2026', days: 31, startDayOfWeek: 4 },
  '2026-11': { name: 'พฤศจิกายน 2026', shortName: 'พ.ย. 2026', days: 30, startDayOfWeek: 0 },
  '2026-12': { name: 'ธันวาคม 2026', shortName: 'ธ.ค. 2026', days: 31, startDayOfWeek: 2 },
  
  // 2027
  '2027-01': { name: 'มกราคม 2027', shortName: 'ม.ค. 27', days: 31, startDayOfWeek: 5 },
  '2027-02': { name: 'กุมภาพันธ์ 2027', shortName: 'ก.พ. 27', days: 28, startDayOfWeek: 1 },
  '2027-03': { name: 'มีนาคม 2027', shortName: 'มี.ค. 27', days: 31, startDayOfWeek: 1 },
  '2027-04': { name: 'เมษายน 2027', shortName: 'เม.ย. 27', days: 30, startDayOfWeek: 4 },
  '2027-05': { name: 'พฤษภาคม 2027', shortName: 'พ.ค. 27', days: 31, startDayOfWeek: 6 },
  '2027-06': { name: 'มิถุนายน 2027', shortName: 'มิ.ย. 27', days: 30, startDayOfWeek: 2 },
  '2027-07': { name: 'กรกฎาคม 2027', shortName: 'ก.ค. 27', days: 31, startDayOfWeek: 4 },
  '2027-08': { name: 'สิงหาคม 2027', shortName: 'ส.ค. 27', days: 31, startDayOfWeek: 0 },
  '2027-09': { name: 'กันยายน 2027', shortName: 'ก.ย. 27', days: 30, startDayOfWeek: 3 },
  '2027-10': { name: 'ตุลาคม 2027', shortName: 'ต.ค. 27', days: 31, startDayOfWeek: 5 },
  '2027-11': { name: 'พฤศจิกายน 2027', shortName: 'พ.ย. 27', days: 30, startDayOfWeek: 1 },
  '2027-12': { name: 'ธันวาคม 2027', shortName: 'ธ.ค. 27', days: 31, startDayOfWeek: 3 },

  // 2028
  '2028-01': { name: 'มกราคม 2028', shortName: 'ม.ค. 28', days: 31, startDayOfWeek: 6 },
  '2028-02': { name: 'กุมภาพันธ์ 2028', shortName: 'ก.พ. 28', days: 29, startDayOfWeek: 2 }, // Leap year!
  '2028-03': { name: 'มีนาคม 2028', shortName: 'มี.ค. 28', days: 31, startDayOfWeek: 3 },
  '2028-04': { name: 'เมษายน 2028', shortName: 'เม.ย. 28', days: 30, startDayOfWeek: 6 },
  '2028-05': { name: 'พฤษภาคม 2028', shortName: 'พ.ค. 28', days: 31, startDayOfWeek: 1 },
  '2028-06': { name: 'มิถุนายน 2028', shortName: 'มิ.ย. 28', days: 30, startDayOfWeek: 4 },
  '2028-07': { name: 'กรกฎาคม 2028', shortName: 'ก.ค. 28', days: 31, startDayOfWeek: 6 },
  '2028-08': { name: 'สิงหาคม 2028', shortName: 'ส.ค. 28', days: 31, startDayOfWeek: 2 },
  '2028-09': { name: 'กันยายน 2028', shortName: 'ก.ย. 28', days: 30, startDayOfWeek: 5 },
  '2028-10': { name: 'ตุลาคม 2028', shortName: 'ต.ค. 28', days: 31, startDayOfWeek: 0 },
  '2028-11': { name: 'พฤศจิกายน 2028', shortName: 'พ.ย. 28', days: 30, startDayOfWeek: 3 },
  '2028-12': { name: 'ธันวาคม 2028', shortName: 'ธ.ค. 28', days: 31, startDayOfWeek: 5 },
};

