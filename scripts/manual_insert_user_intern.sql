-- SQL Script untuk Insert Manual User & Intern ke PostgreSQL
-- Jalankan di PostgreSQL client (pgAdmin, psql, dll)

-- 1. Insert ke tabel Users dulu
INSERT INTO "Users" (
    id,
    firebase_uid,
    username,
    email,
    role,
    is_temporary,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),                    -- Generate UUID otomatis
    'temp-firebase-uid-' || gen_random_uuid()::text,  -- Temporary Firebase UID
    'Test User Manual',                   -- Username
    'testuser@gmail.com',                 -- Email (ganti sesuai kebutuhan)
    'intern',                            -- Role
    true,                                -- is_temporary = true
    NOW(),                               -- created_at
    NOW()                                -- updated_at
);

-- 2. Insert ke tabel Interns (pakai User ID yang baru dibuat)
INSERT INTO "Interns" (
    id,
    "userId",
    email,
    nama,
    nim,
    nik,
    prodi,
    kampus,
    "tanggalMulai",
    "tanggalSelesai",
    divisi,
    status,
    is_temporary,
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(),                    -- Generate UUID otomatis
    (SELECT id FROM "Users" WHERE email = 'testuser@gmail.com' LIMIT 1),  -- Ambil User ID dari insert sebelumnya
    'testuser@gmail.com',                 -- Email yang sama
    'Test User Manual',                   -- Nama lengkap
    '1234567890',                         -- NIM
    '1234567890123456',                   -- NIK (16 digit)
    'Teknik Informatika',                 -- Program Studi
    'Universitas Test',                   -- Kampus
    '2025-06-01',                        -- Tanggal mulai magang
    '2025-08-01',                        -- Tanggal selesai magang
    '-',                                 -- Divisi (default)
    'pending',                           -- Status
    true,                                -- is_temporary = true
    NOW(),                               -- createdAt
    NOW()                                -- updatedAt
);

-- 3. Verifikasi data sudah masuk
SELECT 
    u.id as user_id,
    u.email,
    u.username,
    u.role,
    u.is_temporary as user_temp,
    i.id as intern_id,
    i.nama,
    i.nim,
    i.nik,
    i.status,
    i.is_temporary as intern_temp
FROM "Users" u
LEFT JOIN "Interns" i ON u.id = i."userId"
WHERE u.email = 'testuser@gmail.com';

-- 4. (Optional) Kalau mau hapus data test
-- DELETE FROM "Interns" WHERE email = 'testuser@gmail.com';
-- DELETE FROM "Users" WHERE email = 'testuser@gmail.com';