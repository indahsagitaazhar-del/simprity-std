# SIMPRITY — Sistem Manajemen Prioritas

Aplikasi web manajemen kegiatan dengan sistem scoring prioritas otomatis.

## Cara Menjalankan

```bash
npm install
npm run dev     # http://localhost:5173
```

## Struktur Folder

```
src/
├── assets/         → gambar, font statis
├── components/     → komponen reusable (Sidebar, ImageWithFallback)
│   └── ui/         → komponen shadcn/radix
├── context/        → AuthContext
├── hooks/          → useAuth (custom hooks)
├── layouts/        → AppLayout (wrapper halaman)
├── lib/            → utils.ts (cn, formatDate, dll)
├── pages/          → semua halaman
├── services/       → database.ts, ruleEngine.ts, statistics.ts
├── styles/         → fonts.css, theme.css, globals.css
├── types/          → TypeScript interfaces & types
├── App.tsx
├── index.css       → CSS entry point
├── main.tsx
└── routes.tsx
```

## Demo Account

Email: `demo@simprity.com`  
Password: `demo123`
```
