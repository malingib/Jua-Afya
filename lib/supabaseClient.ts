import { createClient } from '@supabase/supabase-js';

// Safe environment variable retrieval
const getEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore reference errors
  }
  return undefined;
};

// Fallback values prevent the "supabaseUrl is required" crash
// This allows the app to initialize and fail gracefully into Demo Mode later
const SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') || 'placeholder';

if (SUPABASE_URL === 'https://placeholder.supabase.co') {
  console.warn('Supabase URL is missing or using placeholder. App will default to Demo Mode.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- SQL SCHEMA INSTRUCTIONS ---
// Ensure your Supabase Database has the following tables.
// Run this SQL in your Supabase SQL Editor.

/*
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Clinics
create table if not exists clinics (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text,
  phone text,
  location text,
  currency text default 'KSh',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Patients
create table if not exists patients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text,
  age int,
  gender text,
  notes text,
  last_visit date,
  history jsonb default '[]'::jsonb,
  vitals jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Inventory
create table if not exists inventory (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text,
  stock int default 0,
  min_stock_level int default 10,
  unit text,
  price numeric default 0,
  batch_number text,
  expiry_date date,
  supplier_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Appointments
create table if not exists appointments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id),
  patient_name text,
  date date,
  time text,
  reason text,
  status text default 'Scheduled',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Visits (Workflow)
create table if not exists visits (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id),
  patient_name text,
  stage text,
  stage_start_time text,
  start_time text,
  queue_number int,
  priority text,
  vitals jsonb default '{}'::jsonb,
  lab_orders jsonb default '[]'::jsonb,
  prescription jsonb default '[]'::jsonb,
  medications_dispensed boolean default false,
  consultation_fee numeric default 0,
  total_bill numeric default 0,
  payment_status text default 'Pending',
  chief_complaint text,
  diagnosis text,
  doctor_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Suppliers
create table if not exists suppliers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  contact_person text,
  phone text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table patients enable row level security;
create policy "Public access" on patients for all using (true);
alter table inventory enable row level security;
create policy "Public access" on inventory for all using (true);
alter table appointments enable row level security;
create policy "Public access" on appointments for all using (true);
alter table visits enable row level security;
create policy "Public access" on visits for all using (true);
alter table suppliers enable row level security;
create policy "Public access" on suppliers for all using (true);
*/