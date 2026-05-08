# 🐄 Qurban Bahagia

<p align="center">
  <img src="static/logo.png" alt="Qurban Bahagia Logo" width="160" />
</p>

<p align="center">
  <strong>Sistem Manajemen Proses Qurban</strong><br/>
  Aplikasi web untuk mengelola seluruh alur proses penyembelihan dan distribusi hewan qurban secara real-time.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SvelteKit-2.x-FF3E00?logo=svelte&logoColor=white" alt="SvelteKit" />
  <img src="https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white" alt="Svelte 5" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PWA-Supported-5A0FC8?logo=pwa&logoColor=white" alt="PWA" />
</p>

---

## 📋 Deskripsi

**Qurban Bahagia** adalah aplikasi frontend untuk sistem manajemen proses qurban yang mencakup seluruh workflow mulai dari pendataan hewan & sohibul qurban, proses penyembelihan, pemrosesan daging, hingga distribusi. Aplikasi ini dirancang untuk digunakan di lapangan dengan dukungan **Progressive Web App (PWA)** agar dapat di-install di perangkat mobile.

Aplikasi ini merupakan frontend yang berkomunikasi dengan backend API (Go/Gin) melalui REST API dengan autentikasi JWT.

## ✨ Fitur Utama

### 📊 Dashboard
- Ringkasan statistik real-time (total hewan, progress, dsb.)
- Tabel data hewan dengan status proses

### 👥 Manajemen Pengguna
- Multi-role: **Admin**, **Koordinator Pengawas**, **Pengawas**, **Jagal**, **Kulit**, **Cacah Daging**, **Cacah Tulang**, **Packing**, **Distribusi**
- Setiap role hanya melihat menu yang relevan

### 🐂 Manajemen Hewan & Sohibul
- Pendataan hewan qurban (sapi/kambing) dan sohibul qurban
- Penugasan pengawas per hewan

### ⚙️ Proses Operasional (Workflow)
Setiap tahap memiliki halaman tersendiri dengan tracking waktu mulai & selesai:

| # | Tahap | Halaman |
|---|-------|---------|
| 1 | Penyembelihan | `/jagal` |
| 2 | Pengulitan | `/kulit` |
| 3 | Pencacahan Daging | `/cacah-daging` |
| 4 | Pencacahan Tulang | `/cacah-tulang` |
| 5 | Penimbangan | `/timbang` |
| 6 | Packing | `/packing` |
| 7 | Distribusi | `/distribusi` |

### ✅ Status & Kelengkapan
- Checklist kelengkapan per hewan (kepala, kaki, kulit, ekor)
- Monitoring status distribusi

### 📱 Progressive Web App (PWA)
- Installable di perangkat mobile & desktop
- Service worker dengan auto-update
- Caching untuk performa optimal

## 🛠️ Tech Stack

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| [SvelteKit](https://kit.svelte.dev/) | 2.x | Framework fullstack |
| [Svelte](https://svelte.dev/) | 5.x | UI framework (runes mode) |
| [TypeScript](https://www.typescriptlang.org/) | 6.x | Type safety |
| [TailwindCSS](https://tailwindcss.com/) | 4.x | Utility-first CSS |
| [shadcn-svelte](https://www.shadcn-svelte.com/) | 1.x | UI component library |
| [Tabler Icons](https://tabler.io/icons) | 3.x | Icon library |
| [TanStack Table](https://tanstack.com/table) | 8.x | Headless table |
| [LayerChart](https://layerchart.com/) | 2.x | Chart library |
| [D3](https://d3js.org/) | - | Data visualization |
| [@vite-pwa/sveltekit](https://vite-pwa-org.netlify.app/) | 1.x | PWA support |

## 🚀 Getting Started

### Prasyarat

- [Node.js](https://nodejs.org/) >= 20
- [npm](https://www.npmjs.com/) >= 10
- Backend API server berjalan (default: `http://localhost:8080/api`)

### Instalasi

```bash
# Clone repository
git clone https://github.com/<username>/qurban-bahagia-frontend.git
cd qurban-bahagia-frontend

# Install dependencies
npm install

# Salin konfigurasi environment
cp .env.example .env
```

### Konfigurasi Environment

Edit file `.env` dan sesuaikan URL backend API:

```env
PUBLIC_API_URL=http://localhost:8080/api
```

### Development

```bash
# Jalankan dev server
npm run dev

# Jalankan dan buka di browser
npm run dev -- --open
```

Aplikasi akan berjalan di `http://localhost:5173`.

### Build Production

```bash
# Build untuk production
npm run build

# Preview hasil build
npm run preview
```

### Linting & Type Check

```bash
# Cek format kode
npm run lint

# Format ulang kode
npm run format

# Type check
npm run check
```

## 📁 Struktur Proyek

```
src/
├── app.html                  # HTML template utama
├── app.d.ts                  # Global type declarations
├── pwa.d.ts                  # PWA virtual module types
├── lib/
│   ├── api/                  # API client modules
│   │   ├── client.ts         # Base HTTP client (apiFetch)
│   │   ├── auth.ts           # Autentikasi (login/logout)
│   │   ├── hewans.ts         # CRUD hewan & sohibul
│   │   ├── progress.ts       # Update progress per tahap
│   │   ├── distribusi.ts     # Manajemen distribusi
│   │   └── users.ts          # Manajemen pengguna
│   ├── components/           # Reusable UI components
│   │   └── ui/               # shadcn-svelte components
│   ├── config/
│   │   └── menu.ts           # Konfigurasi menu per role
│   ├── hooks/                # Custom hooks (SSE, etc.)
│   ├── server/               # Server-side utilities
│   ├── types/                # TypeScript type definitions
│   │   ├── hewan.ts          # Tipe data hewan & progress
│   │   └── distribusi.ts     # Tipe data distribusi
│   └── utils/                # Utility functions
├── routes/
│   ├── +layout.svelte        # Root layout (sidebar, PWA)
│   ├── +layout.server.ts     # Auth guard & role check
│   ├── dashboard/            # Halaman dashboard
│   ├── login/                # Halaman login
│   ├── users/                # Manajemen user (admin)
│   ├── hewan/                # Data hewan & sohibul
│   ├── jagal/                # Proses penyembelihan
│   ├── kulit/                # Proses pengulitan
│   ├── cacah-daging/         # Proses cacah daging
│   ├── cacah-tulang/         # Proses cacah tulang
│   ├── timbang/              # Penimbangan
│   ├── packing/              # Proses packing
│   ├── status/               # Status & kelengkapan
│   ├── distribusi/           # Distribusi
│   └── logout/               # Logout handler
└── static/
    ├── logo.png              # Logo aplikasi
    ├── pwa-192x192.png       # PWA icon 192px
    ├── pwa-512x512.png       # PWA icon 512px
    ├── maskable-icon-512x512.png  # PWA maskable icon
    └── apple-touch-icon.png  # iOS icon
```

## 🔐 Autentikasi & Otorisasi

Aplikasi menggunakan **JWT (JSON Web Token)** untuk autentikasi:

- Token disimpan di cookie (`HttpOnly`)
- Setiap request ke API menyertakan token di header
- Layout server (`+layout.server.ts`) melakukan validasi token di setiap request
- Menu sidebar ditampilkan berdasarkan role pengguna

### Role & Akses

| Role | Akses |
|------|-------|
| `admin` | Semua halaman |
| `koordinator_pengawas` | Dashboard, Jagal, Kulit, Cacah Daging/Tulang, Timbang, Status |
| `pengawas` | Dashboard, Jagal, Kulit, Cacah Daging/Tulang, Timbang, Status |
| `jagal` | Dashboard, Jagal |
| `kulit` | Dashboard, Kulit |
| `cacah_daging` | Dashboard, Cacah Daging |
| `cacah_tulang` | Dashboard, Cacah Tulang |
| `packing` | Dashboard, Packing |
| `distribusi` | Dashboard, Distribusi |

## 📱 PWA

Aplikasi mendukung instalasi sebagai PWA:

- **Auto-update**: Service worker otomatis memperbarui saat ada versi baru
- **Installable**: Dapat di-install di home screen perangkat mobile
- **Offline caching**: Asset statis di-cache untuk performa optimal

Untuk menginstall, buka aplikasi di browser mobile lalu ketuk "Add to Home Screen" atau ikon install di address bar.

## 🤝 Contributing

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -m 'feat: tambah fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
