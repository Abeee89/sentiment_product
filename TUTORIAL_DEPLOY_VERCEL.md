# 📚 Tutorial Lengkap Deploy Website ke Vercel (Gratis)

Tutorial ini akan memandu Anda dari awal hingga akhir untuk mendeploy aplikasi Sentiment Analysis ini ke Vercel secara gratis.

## 📋 Daftar Isi

1. [Persiapan Awal](#persiapan-awal)
2. [Persiapan Project](#persiapan-project)
3. [Membuat Akun Vercel](#membuat-akun-vercel)
4. [Deploy via Vercel CLI](#deploy-via-vercel-cli)
5. [Deploy via Vercel Dashboard](#deploy-via-vercel-dashboard)
6. [Konfigurasi Environment Variables](#konfigurasi-environment-variables)
7. [Mengatasi Masalah Umum](#mengatasi-masalah-umum)
8. [Catatan Penting](#catatan-penting)

---

## 🚀 Persiapan Awal

### 1. Install Node.js dan npm

Pastikan Anda sudah menginstall Node.js (versi 14 atau lebih baru):

```bash
# Cek versi Node.js
node --version

# Cek versi npm
npm --version
```

Jika belum terinstall, download dari: https://nodejs.org/

### 2. Install Python

Pastikan Python 3.9+ sudah terinstall:

```bash
# Cek versi Python
python --version
```

### 3. Install Vercel CLI (Opsional, untuk deploy via command line)

```bash
npm install -g vercel
```

---

## 📦 Persiapan Project

### Langkah 1: Pastikan Semua File Konfigurasi Sudah Ada

Pastikan file-file berikut sudah ada di project Anda:

- ✅ `vercel.json` (sudah dibuat)
- ✅ `api/index.py` (sudah dibuat)
- ✅ `requirements.txt` (sudah ada)
- ✅ `.vercelignore` (sudah dibuat)
- ✅ `frontend/package.json` (sudah ada)

### Langkah 2: Build Frontend

Sebelum deploy, pastikan frontend bisa di-build dengan sukses:

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Build frontend
npm run build
```

Jika build berhasil, folder `frontend/build` akan terbuat.

### Langkah 3: Test Backend Lokal (Opsional)

Pastikan backend berjalan dengan baik:

```bash
# Kembali ke root folder
cd ..

# Install Python dependencies (buat virtual environment dulu)
python -m venv venv

# Aktifkan virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Test run backend
python app.py
```

### Langkah 4: Pastikan Model Files Ada

Pastikan folder `models/` berisi:
- `sentiment_model.pkl`
- `vectorizer.pkl`
- `model_info.json`

File-file ini akan di-deploy bersama aplikasi.

---

## 🔐 Membuat Akun Vercel

### Langkah 1: Daftar Akun

1. Buka https://vercel.com
2. Klik **"Sign Up"**
3. Pilih metode sign up:
   - **GitHub** (disarankan - untuk auto-deploy)
   - **GitLab**
   - **Bitbucket**
   - **Email**

### Langkah 2: Verifikasi Email

Jika menggunakan email, verifikasi email Anda melalui link yang dikirim.

---

## 🖥️ Deploy via Vercel CLI

### Langkah 1: Login ke Vercel

```bash
vercel login
```

Ikuti instruksi di terminal untuk login.

### Langkah 2: Deploy Project

```bash
# Dari root folder project
vercel
```

Vercel akan menanyakan beberapa pertanyaan:

```
? Set up and deploy "~/path/to/project"? [Y/n] y
? Which scope do you want to deploy to? [Pilih akun Anda]
? Link to existing project? [N/y] n
? What's your project's name? sentiment-analysis-app
? In which directory is your code located? ./
```

### Langkah 3: Deploy ke Production

Setelah deploy pertama berhasil, deploy ke production:

```bash
vercel --prod
```

### Langkah 4: Catat URL Deployment

Setelah deploy selesai, Vercel akan memberikan URL seperti:
- Preview: `https://sentiment-analysis-app-xxx.vercel.app`
- Production: `https://sentiment-analysis-app.vercel.app`

---

## 🌐 Deploy via Vercel Dashboard

### Langkah 1: Push Project ke GitHub (Disarankan)

1. Buat repository baru di GitHub
2. Push project Anda:

```bash
# Inisialisasi git (jika belum)
git init

# Tambahkan semua file
git add .

# Commit
git commit -m "Initial commit"

# Tambahkan remote repository
git remote add origin https://github.com/username/repo-name.git

# Push ke GitHub
git push -u origin main
```

### Langkah 2: Import Project di Vercel

1. Login ke https://vercel.com/dashboard
2. Klik **"Add New..."** → **"Project"**
3. Pilih repository GitHub Anda
4. Klik **"Import"**

### Langkah 3: Konfigurasi Build Settings

Vercel akan otomatis mendeteksi konfigurasi dari `vercel.json`, tapi pastikan:

**Root Directory:** `.` (root project)

**Build Settings:**
- Framework Preset: Other
- Build Command: (kosongkan, sudah di vercel.json)
- Output Directory: (kosongkan, sudah di vercel.json)
- Install Command: (kosongkan)

### Langkah 4: Deploy

Klik **"Deploy"** dan tunggu proses build selesai.

---

## ⚙️ Konfigurasi Environment Variables

### Langkah 1: Tambahkan Environment Variables

1. Di Vercel Dashboard, masuk ke project Anda
2. Klik **"Settings"** → **"Environment Variables"**
3. Tambahkan variable jika diperlukan:

```
REACT_APP_API_URL=https://your-project.vercel.app/api
```

**Catatan:** Untuk project ini, environment variable mungkin tidak diperlukan karena API URL akan otomatis menggunakan domain Vercel.

### Langkah 2: Update Frontend API URL

File `frontend/src/services/api.js` sudah dikonfigurasi untuk menggunakan environment variable:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

Jika perlu, update di Vercel Dashboard dengan:
- Key: `REACT_APP_API_URL`
- Value: `https://your-project.vercel.app/api`

---

## 🔧 Mengatasi Masalah Umum

### Masalah 1: Build Error - Module Not Found

**Solusi:**
```bash
# Pastikan semua dependencies terinstall
cd frontend
npm install
npm run build
```

### Masalah 2: Python Dependencies Error

**Solusi:**
Pastikan `requirements.txt` lengkap dan tidak ada versi yang conflict.

### Masalah 3: API Routes Tidak Bekerja

**Solusi:**
1. Pastikan `api/index.py` ada dan benar
2. Pastikan `vercel.json` routes configuration benar
3. Cek logs di Vercel Dashboard → **"Deployments"** → **"Functions"**

### Masalah 4: Frontend Tidak Bisa Connect ke Backend

**Solusi:**
1. Update `REACT_APP_API_URL` di Environment Variables
2. Rebuild frontend setelah update environment variable
3. Pastikan CORS sudah diaktifkan di `app.py`

### Masalah 5: Model Files Tidak Ditemukan

**Solusi:**
1. Pastikan folder `models/` dan file-file di dalamnya ada
2. Pastikan file tidak di-ignore di `.vercelignore`
3. Cek ukuran file (Vercel free tier punya limit)

### Masalah 6: Database Error (SQLite)

**Catatan Penting:** SQLite tidak cocok untuk serverless karena:
- File system di Vercel adalah read-only
- Setiap function invocation adalah stateless

**Solusi Sementara:**
- Untuk production, pertimbangkan menggunakan database eksternal (PostgreSQL, MongoDB, dll)
- Atau gunakan Vercel KV, Vercel Postgres, atau layanan database cloud lainnya

---

## ⚠️ Catatan Penting

### 1. Limit Vercel Free Tier

- **Function Execution Time:** 10 detik (Hobby plan)
- **Bandwidth:** 100 GB/bulan
- **Function Invocations:** Unlimited (dengan rate limiting)
- **File Size Limit:** 50 MB per function

### 2. Database dan File Storage

**SQLite Database:**
- SQLite tidak akan bekerja dengan baik di Vercel serverless
- Setiap request membuat instance baru
- File system read-only
- **Rekomendasi:** Gunakan database cloud (Vercel Postgres, MongoDB Atlas, dll)

**File Uploads:**
- File uploads ke local storage tidak akan persist
- **Rekomendasi:** Gunakan cloud storage (Vercel Blob, AWS S3, Cloudinary, dll)

### 3. Model Files

- Model files (`*.pkl`) akan di-deploy bersama aplikasi
- Pastikan ukuran total tidak melebihi limit
- Jika terlalu besar, pertimbangkan menggunakan model hosting terpisah

### 4. Cold Start

- Function pertama kali dipanggil akan lebih lambat (cold start)
- Function yang sudah "warm" akan lebih cepat
- Vercel Pro plan memiliki better cold start performance

### 5. Environment Variables

- Environment variables perlu di-set untuk setiap environment (Production, Preview, Development)
- Setelah update environment variable, redeploy aplikasi

### 6. Auto-Deploy dari GitHub

- Setelah connect ke GitHub, setiap push ke main branch akan auto-deploy
- Pull request akan membuat preview deployment otomatis

---

## 📝 Checklist Sebelum Deploy

- [ ] Semua dependencies terinstall (`npm install` di frontend, `pip install -r requirements.txt` di backend)
- [ ] Frontend bisa di-build (`npm run build`)
- [ ] Backend bisa jalan lokal (opsional, untuk testing)
- [ ] Model files ada di folder `models/`
- [ ] File `vercel.json` sudah benar
- [ ] File `api/index.py` sudah ada
- [ ] File `.vercelignore` sudah ada
- [ ] Project sudah di-push ke GitHub (jika deploy via dashboard)
- [ ] Environment variables sudah di-set (jika diperlukan)

---

## 🎉 Setelah Deploy Berhasil

1. **Test API Endpoints:**
   ```
   https://your-project.vercel.app/api/health
   ```

2. **Test Frontend:**
   ```
   https://your-project.vercel.app
   ```

3. **Monitor Deployments:**
   - Masuk ke Vercel Dashboard
   - Lihat logs di tab "Deployments"
   - Cek "Functions" untuk melihat API logs

4. **Update Custom Domain (Opsional):**
   - Di Vercel Dashboard → Settings → Domains
   - Tambahkan domain custom Anda

---

## 🔄 Update Deployment

### Via CLI:
```bash
vercel --prod
```

### Via GitHub:
- Push perubahan ke GitHub
- Vercel akan otomatis deploy

### Via Dashboard:
- Klik "Redeploy" di deployment yang ingin di-update

---

## 📞 Bantuan Tambahan

- **Vercel Documentation:** https://vercel.com/docs
- **Vercel Community:** https://github.com/vercel/vercel/discussions
- **Vercel Support:** support@vercel.com

---

## 🎓 Tips Lanjutan

1. **Gunakan Vercel Analytics** untuk monitor performance
2. **Setup Vercel Postgres** untuk database yang lebih reliable
3. **Gunakan Vercel Blob** untuk file storage
4. **Setup CI/CD** dengan GitHub Actions (opsional)
5. **Monitor dengan Vercel Speed Insights**

---

**Selamat! Website Anda sudah ter-deploy di Vercel! 🚀**

Jika ada pertanyaan atau masalah, cek logs di Vercel Dashboard atau buka issue di repository project Anda.

