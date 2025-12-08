
import { createClient } from '@supabase/supabase-js';

// Configuration provided by the user
const SUPABASE_URL = 'https://cbyikofnphjoxnnwtunw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieWlrb2ZucGhqb3hubnd0dW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTY3MzYsImV4cCI6MjA4MDc5MjczNn0.e2SvbpRLTXm1MPdYXNA3DOKijEHtEiHTxCd37uP_Z7o';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- SQL SCHEMA INSTRUCTIONS ---
// Copy and Run the following SQL in your Supabase SQL Editor to create the necessary tables.

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

-- Enable RLS (Optional, for demo purposes we assume public or authenticated access)
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

-- SEED DATA (Optional) --
INSERT INTO patients (name, phone, age, gender, notes, last_visit, vitals) VALUES
('Wanjiku Kamau', '+254 712 345 678', 34, 'Female', 'Patient complains of persistent headache.', '2023-10-15', '{"bp": "140/90", "heartRate": "88", "temp": "37.8", "weight": "68"}'),
('Juma Ochieng', '+254 722 987 654', 45, 'Male', 'Follow up on fractured arm.', '2023-10-20', '{"bp": "120/80", "heartRate": "72", "temp": "36.5", "weight": "75"}');

INSERT INTO inventory (name, stock, min_stock_level, unit, category, price) VALUES
('Paracetamol 500mg', 1500, 500, 'Tablets', 'Medicine', 5),
('Amoxicillin 250mg', 400, 200, 'Tablets', 'Medicine', 15),
('Malaria Test Kit', 45, 50, 'Kits', 'Lab', 200);
*/
