-- SQL Script untuk Insert User & Intern Spesifik (sesuai data lo)
-- Ganti data di bawah sesuai kebutuhan lo

-- Data yang mau diinsert (GANTI SESUAI KEBUTUHAN):
-- Email: zainabb@gmail.com
-- Nama: Zainab Aqilah
-- NIM: 2217011114
-- NIK: 2340928349028234234
-- Prodi: Ilmu Komputer
-- Kampus: Universitas Lampung

BEGIN;

-- 1. Insert User
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
    gen_random_uuid(),
    'temp-firebase-' || extract(epoch from now())::text,  -- Temporary Firebase UID unik
    'Zainab Aqilah',                     -- Ganti nama sesuai kebutuhan
    'zainabb@gmail.com',                 -- Ganti email sesuai kebutuhan
    'intern',
    true,
    NOW(),
    NOW()
);

-- 2. Insert Intern
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
    gen_random_uuid(),
    (SELECT id FROM "Users" WHERE email = 'zainabb@gmail.com' ORDER BY created_at DESC LIMIT 1),
    'zainabb@gmail.com',                 -- Email yang sama
    'Zainab Aqilah',                     -- Nama lengkap
    '2217011114',                        -- NIM
    '2340928349028234234',               -- NIK
    'Ilmu Komputer',                     -- Program Studi
    'Universitas Lampung',               -- Kampus
    '2025-06-16',                        -- Tanggal mulai
    '2025-08-01',                        -- Tanggal selesai
    '-',                                 -- Divisi
    'pending',                           -- Status
    true,                                -- is_temporary
    NOW(),
    NOW()
);

COMMIT;

-- Verifikasi hasil
SELECT 
    'SUCCESS: Data inserted' as message,
    u.id as user_id,
    u.email,
    u.username,
    i.id as intern_id,
    i.nama,
    i.nim,
    i.nik
FROM "Users" u
JOIN "Interns" i ON u.id = i."userId"
WHERE u.email = 'zainabb@gmail.com';