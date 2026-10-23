export type Role = 'SUPERADMIN' | 'MUNICIPALITY' | 'OSM';

export interface AppUser {
  id: string;
  username: string;
  password?: string; // ในของจริงไม่ควรเก็บ Password แบบ plain text
  role: Role;
  name: string;
  area?: string; // สำหรับ อสม. ระบุหมู่บ้านที่ดูแล
}

const DEFAULT_USERS: AppUser[] = [
  { id: '1', username: 'admin', password: '123456', role: 'SUPERADMIN', name: 'ผู้ดูแลระบบ' },
  { id: '2', username: 'MUN-001', password: '123456', role: 'MUNICIPALITY', name: 'เจ้าหน้าที่เทศบาล' },
  { id: '3', username: 'OSM-001', password: '123456', role: 'OSM', name: 'อสม. สมศรี', area: 'หมู่ 4' },
  { id: '4', username: 'OSM-002', password: '123456', role: 'OSM', name: 'อสม. สมชาย', area: 'หมู่ 5' },
];

export const getUsers = (): AppUser[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('app_users');
  if (!saved) {
    localStorage.setItem('app_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(saved);
};

export const saveUser = (user: AppUser) => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push({ ...user, id: Date.now().toString() });
  }
  localStorage.setItem('app_users', JSON.stringify(users));
};

export const deleteUser = (id: string) => {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem('app_users', JSON.stringify(users));
};