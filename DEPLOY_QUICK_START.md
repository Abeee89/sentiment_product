# 🚀 Quick Start: Deploy ke Vercel

Panduan cepat untuk deploy aplikasi ini ke Vercel dalam 5 menit.

## Prerequisites

- Akun GitHub (gratis)
- Akun Vercel (gratis)

## Langkah Cepat

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Ready for Vercel deployment"
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### 2. Deploy di Vercel

1. Buka https://vercel.com
2. Login dengan GitHub
3. Klik **"Add New Project"**
4. Pilih repository Anda
5. Klik **"Import"**
6. **Jangan ubah** konfigurasi (sudah otomatis dari `vercel.json`)
7. Klik **"Deploy"**

### 3. Selesai! 🎉

Tunggu 2-3 menit, website Anda akan live di:
`https://your-project.vercel.app`

## Test API

```
https://your-project.vercel.app/api/health
```

## Catatan Penting

⚠️ **SQLite Database** tidak akan bekerja dengan baik di Vercel serverless. Untuk production, gunakan database cloud.

⚠️ **File Uploads** ke local storage tidak akan persist. Gunakan cloud storage.

✅ **Model Files** akan di-deploy dan bekerja dengan baik.

## Troubleshooting

Jika ada error, cek:
1. Vercel Dashboard → Deployments → Logs
2. Pastikan semua file ada (terutama `models/` folder)
3. Pastikan `vercel.json` ada di root

---

Untuk tutorial lengkap, lihat: `TUTORIAL_DEPLOY_VERCEL.md`

