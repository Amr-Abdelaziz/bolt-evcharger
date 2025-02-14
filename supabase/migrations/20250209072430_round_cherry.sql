/*
  # Initial Schema Setup for EV Charger App

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, matches auth.users)
      - `email` (text)
      - `name` (text)
      - `phone` (text)
      - `wallet_balance` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `chargers`
      - `id` (uuid, primary key)
      - `type` (text)
      - `status` (text)
      - `price_per_kwh` (decimal)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `owner_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `reservations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `charger_id` (uuid, references chargers)
      - `start_time` (timestamp)
      - `duration` (interval)
      - `status` (text)
      - `estimated_cost` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  name text,
  phone text,
  wallet_balance decimal(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Chargers table
CREATE TABLE chargers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('fast', 'standard')),
  status text NOT NULL CHECK (status IN ('available', 'occupied', 'maintenance')),
  price_per_kwh decimal(10,2) NOT NULL,
  latitude decimal(10,8) NOT NULL,
  longitude decimal(11,8) NOT NULL,
  owner_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chargers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chargers"
  ON chargers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners can update their chargers"
  ON chargers FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Reservations table
CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  charger_id uuid REFERENCES chargers(id) NOT NULL,
  start_time timestamptz NOT NULL,
  duration interval NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  estimated_cost decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, wallet_balance)
  VALUES (new.id, new.email, 0.00);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
