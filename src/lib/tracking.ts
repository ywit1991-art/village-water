// src/lib/tracking.ts

export type LogAction = 'LOGIN' | 'LOGOUT' | 'VIEW_MAP' | 'VIEW_PERSON' | 'ADD_PERSON';

export interface AccessLog {
  id: string;
  staffCode: string;
  action: LogAction;
  timestamp: string;
}

export function logAccess(staffCode: string, action: LogAction) {
  try {
    const existingLogs: AccessLog[] = JSON.parse(localStorage.getItem('access_logs') || '[]');
    
    const newLog: AccessLog = {
      id: Date.now().toString(),
      staffCode,
      action,
      timestamp: new Date().toISOString(),
    };

    // เก็บแค่ 500 รายการล่าสุดเพื่อไม่ให้ localStorage เต็ม
    const updatedLogs = [newLog, ...existingLogs].slice(0, 500); 
    localStorage.setItem('access_logs', JSON.stringify(updatedLogs));
    
    console.log(`[AUDIT LOG] ${action} by ${staffCode} at ${newLog.timestamp}`);
  } catch (error) {
    console.error('Failed to log access', error);
  }
}