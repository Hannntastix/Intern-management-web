# Update Logika Absensi - Pemisahan Absen Datang dan Pulang

## Perubahan yang Dilakukan

### 1. Model Database (`models/daftarHadirInfo.js`)
- **Ditambah field baru:**
  - `jenisAbsen`: Enum ['datang', 'pulang'] - menentukan jenis absensi
  - `checkoutTime`: Date (optional) - waktu absen pulang
  - `checkoutLongCordinate`: Number (optional) - longitude saat checkout
  - `checkoutLatCordinate`: Number (optional) - latitude saat checkout  
  - `checkoutMessageText`: String (optional) - pesan saat checkout

### 2. API Route (`app/api/absen/route.js`)
- **Logika baru berdasarkan jam:**
  - **Jam < 12**: Absen Datang
    - 05:00-07:30: "Datang Tepat Waktu"
    - 07:31-11:59: "Datang Terlambat"
  - **Jam ≥ 12**: Absen Pulang
    - 12:00-15:59: "Pulang Cepat"
    - 16:00: "Pulang Tepat Waktu"
    - 16:01-22:59: "Pulang Lembur"

- **Validasi yang ditambahkan:**
  - Tidak bisa absen datang 2x dalam sehari
  - Tidak bisa absen pulang sebelum absen datang
  - Tidak bisa absen pulang 2x dalam sehari

### 3. Alur Kerja Baru
1. **Absen Datang (< 12:00)**: Membuat record baru dengan koordinat dan pesan masuk
2. **Absen Pulang (≥ 12:00)**: Mengupdate record yang sudah ada dengan:
   - `checkoutTime`: waktu pulang
   - `checkoutLongCordinate` & `checkoutLatCordinate`: koordinat pulang
   - `checkoutMessageText`: pesan pulang
   - `keteranganMasuk`: digabung dengan keterangan pulang

### 4. Response API
- Menambahkan field `jenisAbsen` dalam response
- Message yang lebih spesifik ("Absen datang berhasil" vs "Absen pulang berhasil")

## File yang Diubah
1. `models/daftarHadirInfo.js` - Schema database dengan field baru
2. `app/api/absen/route.js` - Logic API untuk absen datang/pulang
3. `components/DaftarHadirTable.jsx` - Tampilan tabel dengan data baru
4. `scripts/migrate_absen_data.js` - Script migrasi data lama

## File yang Tidak Perlu Diubah
- `components/Dashboard.jsx` - Sudah kompatibel dengan `checkoutTime`
- `components/Absen.jsx` - Tetap mengirim data yang sama, logic di server

## Cara Menjalankan Migrasi
```bash
node scripts/migrate_absen_data.js
```

## Keuntungan Perubahan Ini
1. **Terstruktur**: Pemisahan jelas antara absen datang dan pulang
2. **Data Lengkap**: Menyimpan koordinat dan pesan terpisah untuk masuk/pulang
3. **Validasi**: Mencegah duplikasi absen dan urutan yang salah
4. **Fleksibel**: Mudah ditambahkan fitur seperti overtime tracking
5. **Backward Compatible**: Dashboard tetap bisa menampilkan data lama
6. **Akurat**: Tabel menampilkan lokasi dan pesan yang tepat untuk setiap aktivitas

## Testing
- Test absen datang di pagi hari (< 12:00)
- Test absen pulang di sore hari (≥ 12:00)
- Test validasi: coba absen datang 2x, atau pulang tanpa datang dulu
