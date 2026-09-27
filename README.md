# KJI Dojo Pangandaran — Sistem Bukti Pembayaran

Aplikasi web statis untuk membuat, menyimpan, dan mencetak bukti pembayaran KJI Dojo Pangandaran.

## Fitur
- Login page.
- Logo dojo.
- Stampel dojo pada bukti dan PDF.
- Petugas keuangan: **Gustian Sastriajie Kohar, ST., S.Pd.I**
- Input nomor bukti, tanggal, nama pembayar, nomor HP, keperluan, nominal, metode pembayaran, dan catatan.
- Riwayat pembayaran.
- Edit dan hapus bukti.
- Data tersimpan di browser menggunakan localStorage.
- Generate PDF A4 langsung dari browser menggunakan jsPDF.
- Responsif untuk HP dan komputer.

## Login awal
Username: `admin`
Password: `kji12345`

Untuk mengganti login, edit bagian awal `script.js`:
```js
const LOGIN_USER="admin";
const LOGIN_PASS="kji12345";
```

## Instalasi di GitHub Pages
1. Buat repository baru, misalnya `kji-bukti-bayar`.
2. Upload:
   - `index.html`
   - `style.css`
   - `script.js`
   - folder `assets`
3. Pastikan `assets/logo-dojo.png` dan `assets/stampel-dojo.jpg` ikut di-upload.
4. GitHub → Settings → Pages.
5. Source: Deploy from a branch.
6. Branch: `main`, folder `/ (root)`.
7. Save.

## Catatan
PDF memakai jsPDF dari CDN, sehingga saat pertama membuka aplikasi perangkat membutuhkan koneksi internet untuk memuat library PDF. Setelah library termuat, tombol Cetak PDF dapat digunakan.

Login yang disimpan di localStorage adalah login sederhana untuk aplikasi statis. Ini bukan autentikasi server-side untuk data sensitif.
