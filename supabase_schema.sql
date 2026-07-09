-- =========================================================================
-- SQL Schema for BEM Web Platform
-- Database: PostgreSQL (Supabase)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('super_admin', 'admin_sektoral');
CREATE TYPE tipe_isu AS ENUM ('tangible', 'intangible');
CREATE TYPE status_aspirasi AS ENUM ('draft', 'review', 'diterbitkan');

-- 2. Create Tables
CREATE TABLE public.kementerian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_kementerian TEXT NOT NULL UNIQUE,
    hierarki_order INT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'admin_sektoral',
    nama TEXT NOT NULL,
    kementerian_id UUID REFERENCES public.kementerian(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.aspirasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipe_isu tipe_isu NOT NULL,
    identitas JSONB, -- NULL jika pengirim memilih anonim
    prodi TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    bukti_url TEXT, -- URL file di storage bucket 'bukti-aspirasi'
    status status_aspirasi NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.peminjaman_ruangan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    ruangan_utama TEXT NOT NULL,
    ruangan_tambahan TEXT,
    nama_ormawa TEXT NOT NULL,
    nama_agenda TEXT NOT NULL,
    jam_acara TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pengurus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kementerian_id UUID NOT NULL REFERENCES public.kementerian(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    jabatan TEXT NOT NULL,
    prestasi_akademik TEXT[] NOT NULL DEFAULT '{}',
    prestasi_non_akademik TEXT[] NOT NULL DEFAULT '{}',
    riwayat_organisasi TEXT[] NOT NULL DEFAULT '{}',
    foto_url TEXT,
    periode_tahun TEXT NOT NULL, -- Format: "2025/2026"
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.kementerian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aspirasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peminjaman_ruangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengurus ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Profiles
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admin has full control over profiles"
    ON public.profiles FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Users can update their own profile names"
    ON public.profiles FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 5. RLS Policies: Kementerian
CREATE POLICY "Kementerian is publicly readable"
    ON public.kementerian FOR SELECT USING (true);

CREATE POLICY "Super admin has full control over kementerian"
    ON public.kementerian FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
        )
    );

-- 6. RLS Policies: Pengurus (Role-Based Access Control)
CREATE POLICY "Pengurus is publicly readable"
    ON public.pengurus FOR SELECT USING (true);

CREATE POLICY "Admin can manage pengurus"
    ON public.pengurus FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'super_admin' OR (profiles.role = 'admin_sektoral' AND profiles.kementerian_id = pengurus.kementerian_id))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.role = 'super_admin' OR (profiles.role = 'admin_sektoral' AND profiles.kementerian_id = pengurus.kementerian_id))
        )
    );

-- 7. RLS Policies: Peminjaman Ruangan
CREATE POLICY "Peminjaman ruangan is publicly readable"
    ON public.peminjaman_ruangan FOR SELECT USING (true);

CREATE POLICY "Admin can manage peminjaman ruangan"
    ON public.peminjaman_ruangan FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid()
        )
    );

-- 8. RLS Policies: Aspirasi
CREATE POLICY "Anyone can submit aspirations"
    ON public.aspirasi FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view published aspirations"
    ON public.aspirasi FOR SELECT USING (status = 'diterbitkan');

CREATE POLICY "Admin can view all aspirations"
    ON public.aspirasi FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can update aspirations"
    ON public.aspirasi FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid()
        )
    );

-- 9. Automatic Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nama, role, kementerian_id)
    VALUES (
        new.id,
        coalesce(new.raw_user_meta_data->>'nama', 'Pengurus BEM'),
        CASE 
            WHEN new.email = 'bem@universitas.ac.id' THEN 'super_admin'::user_role
            ELSE 'admin_sektoral'::user_role
        END,
        (new.raw_user_meta_data->>'kementerian_id')::uuid
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- Storage Bucket and RLS Setup (Run this in Supabase SQL editor or API)
-- =========================================================================

-- Create private bucket 'bukti-aspirasi' inside storage schema
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bukti-aspirasi', 'bukti-aspirasi', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage objects
CREATE POLICY "Public can upload proof files" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'bukti-aspirasi');

CREATE POLICY "Only authenticated admins can read/download proof files" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'bukti-aspirasi');
