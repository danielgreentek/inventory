export type UserRole = 'admin' | 'staff';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

export type InventoryStatus = 'Aktif' | 'Maintenance' | 'Rusak';
export type InventoryCategory = 'Laptop' | 'Computer' | 'Printer' | 'Networking' | 'CCTV' | 'Peripheral' | 'Multimedia';

export interface InventoryUnit {
  serial: string;
  status: InventoryStatus;
  location: string;
  assignedTo: string;
  condition: string;
  condition_note: string;
  production_date: string;
  history?: HistoryRecord[];
}

export interface HistoryRecord {
  id: string;
  date: string;
  action: string;
  note: string;
}

export interface InventoryItem {
  id: string;
  item_code: string;
  item_name: string;
  category: InventoryCategory;
  brand: string;
  quantity: number;
  purchase_date: string;
  branch: string;
  image_url: string;
  units: InventoryUnit[];
  history?: HistoryRecord[];
}

export interface BorrowingRecord {
  id: string;
  inventory_id: string;
  borrower: string;
  borrow_date: string;
  return_date: string;
  status: 'Dipinjam' | 'Dikembalikan' | 'Terlambat';
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  department: string;
  password?: string;
}
