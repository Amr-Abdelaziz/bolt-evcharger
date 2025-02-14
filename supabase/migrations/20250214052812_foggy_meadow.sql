/*
  # Add test user with proper UUID

  1. Changes
    - Add test user with proper UUID format
    - Add corresponding profile entry
    - Set initial wallet balance
*/

-- Create a test user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Create profile for test user
INSERT INTO profiles (id, email, name, wallet_balance)
VALUES (
  'a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
  'test@example.com',
  'Test User',
  100.00
)
ON CONFLICT (id) DO NOTHING;
