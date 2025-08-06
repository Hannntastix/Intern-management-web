# Update Tabel Daftar Hadir - Dokumentasi Perubahan

## Perubahan Pada DaftarHadirTable.jsx

### 1. Helper Functions Baru
- **`formatCheckoutTime()`**: Format waktu checkout dari field `checkoutTime`
- **`extractKeterangan()`**: Memisahkan keterangan masuk dan pulang dari string gabungan

### 2. Struktur Data Baru
Sebelumnya tabel menggunakan field-field lama seperti:
- `waktuDatang`, `waktuPulang` 
- `latPulang`, `longPulang`
- `messagePulang`, `keteranganPulang`

Sekarang menggunakan struktur baru:
- **Masuk**: `absenDate`, `latCordinate`, `longCordinate`, `messageText`
- **Pulang**: `checkoutTime`, `checkoutLatCordinate`, `checkoutLongCordinate`, `checkoutMessageText`
- **Keterangan**: `keteranganMasuk` (gabungan masuk | pulang)

### 3. Cara Kerja Keterangan
- Keterangan disimpan dalam format: "Datang Tepat Waktu | Pulang Lembur"
- Function `extractKeterangan()` memisahkan string ini menjadi objek:
  ```javascript
  { masuk: "Datang Tepat Waktu", pulang: "Pulang Lembur" }
  ```

### 4. Logika Tampilan
- **Jam Masuk**: Diambil dari `absenDate`
- **Jam Pulang**: Diambil dari `checkoutTime` (jika ada)
- **Lokasi Masuk**: Dihitung dari `latCordinate` & `longCordinate`  
- **Lokasi Pulang**: Dihitung dari `checkoutLatCordinate` & `checkoutLongCordinate`
- **Pesan Masuk**: Dari `messageText`
- **Pesan Pulang**: Dari `checkoutMessageText`

### 5. Penanganan Data Kosong
- Jika belum checkout: semua field pulang menampilkan "-"
- Jika koordinat checkout tidak ada: tampilkan "Data tidak tersedia"
- Fallback untuk kompatibilitas dengan data lama

### 6. Kompatibilitas
- Tabel tetap dapat menampilkan data lama dan baru
- Migration script akan mengupdate data lama agar sesuai struktur baru
- Field optional memastikan tidak ada error untuk data yang belum lengkap

## Contoh Data Struktur Baru
```javascript
{
  _id: "...",
  idUser: "user123",
  absenDate: "2025-08-03T07:15:00Z",        // Waktu masuk
  checkoutTime: "2025-08-03T16:30:00Z",     // Waktu pulang
  latCordinate: -6.2088,                    // Lat masuk
  longCordinate: 106.8456,                  // Long masuk  
  checkoutLatCordinate: -6.2090,            // Lat pulang
  checkoutLongCordinate: 106.8458,          // Long pulang
  messageText: "Siap bekerja hari ini",     // Pesan masuk
  checkoutMessageText: "Pekerjaan selesai", // Pesan pulang
  keteranganMasuk: "Datang Tepat Waktu | Pulang Tepat Waktu",
  jenisAbsen: "datang"
}
```

## Testing Checklist
- [ ] Tabel menampilkan waktu masuk dengan benar
- [ ] Tabel menampilkan waktu pulang jika ada checkout
- [ ] Lokasi masuk dan pulang dihitung dengan akurat
- [ ] Pesan masuk dan pulang ditampilkan terpisah
- [ ] Keterangan masuk dan pulang dipisah dengan benar
- [ ] Data lama tetap bisa ditampilkan tanpa error
- [ ] Loading state berfungsi dengan baik
- [ ] View admin dan user keduanya bekerja
