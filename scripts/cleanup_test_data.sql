-- SQL Script untuk Cleanup Data Test
-- Jalankan kalau lo mau bersihin data test yang udah diinsert

-- 1. Hapus data test berdasarkan email
DELETE FROM "Interns" WHERE email IN (
    'testuser@gmail.com',
    'zainabb@gmail.com'
);

DELETE FROM "Users" WHERE email IN (
    'testuser@gmail.com', 
    'zainabb@gmail.com'
);

-- 2. Hapus semua data temporary (is_temporary = true)
-- HATI-HATI: Ini akan hapus SEMUA data temporary!
-- DELETE FROM "Interns" WHERE is_temporary = true;
-- DELETE FROM "Users" WHERE is_temporary = true;

-- 3. Verifikasi data sudah terhapus
SELECT 
    'Users count' as table_name,
    COUNT(*) as total_records
FROM "Users"
UNION ALL
SELECT 
    'Interns count' as table_name,
    COUNT(*) as total_records
FROM "Interns";

-- 4. Lihat data yang masih ada
SELECT 
    u.email,
    u.username,
    u.is_temporary,
    i.nama,
    i.status
FROM "Users" u
LEFT JOIN "Interns" i ON u.id = i."userId"
ORDER BY u.created_at DESC
LIMIT 10;