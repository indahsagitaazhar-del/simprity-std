export interface User {
  id: string;
  email: string;
  fullName: string;
  password: string; // Tetap di sini untuk kebutuhan auth lokal
  createdAt: Date;
  role?: string;    // Tambahan baru
  bio?: string;     // Tambahan baru
}