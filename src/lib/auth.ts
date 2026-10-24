export type Role = 'SUPERADMIN' | 'MUNICIPALITY' | 'OSM';

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  role: Role;
  name: string;
  area?: string;
}

const DEFAULT_USERS: AppUser[] = [
  { id: '1', username: 'admin', password: '123', role: 'SUPERADMIN', name: 'ผู้ดูแลระบบ' },
  { id: '2', username: 'mun', password: '123', role: 'MUNICIPALITY', name: 'เจ้าหน้าที่เทศบาล' },
  { id: '3', username: 'osm', password: '123', role: 'OSM', name: 'อสม. สมศรี', area: 'หมู่ 4' },
];

export const getUsers = (): AppUser[] => {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  } catch (error) {
    return DEFAULT_USERS;
  }
};

// 👇 เพิ่มฟังก์ชันนี้เพื่อแก้ Error
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

// 👇 เพิ่มฟังก์ชันนี้เพื่อแก้ Error
export const deleteUser = (id: string) => {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem('app_users', JSON.stringify(users));
};

export const checkAuth = (allowedRoles: Role[]) => {
  if (typeof window === 'undefined') return null;
  const role = sessionStorage.getItem('staff_role') as Role;
  const name = sessionStorage.getItem('staff_name');
  const username = sessionStorage.getItem('staff_code'); // ใช้ username ในการเช็ก DB
  const area = sessionStorage.getItem('staff_area');
  
  if (!role || !allowedRoles.includes(role)) return null;
  return { role, name, username, area };
};