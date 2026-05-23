// Tipe-tipe global yang dipakai lintas komponen

export type ActivityCategory = 'Akademik' | 'Organisasi' | 'Pribadi';
export type Importance = 'Normal' | 'Sedang' | 'Penting';
export type Consequence = 'Santai' | 'Sedang' | 'Bahaya';
export type Priority = 'Tinggi' | 'Sedang' | 'Rendah';
export type ActivityStatus = 'pending' | 'in-progress' | 'completed' | 'review';
export type NotificationType = 'warning' | 'info' | 'success' | 'danger';

export interface User {
  id: string;
  email: string;
  fullName: string;
  password: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  userId: string;
  name: string;
  category: ActivityCategory;
  deadline: Date;
  estimatedTime: number;
  importance: Importance;
  consequence: Consequence;
  priority: Priority;
  status: ActivityStatus;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
}
