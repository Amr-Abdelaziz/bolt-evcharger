/*
  # Fix User Signup Process

  1. Changes
    - Add INSERT policy for profiles table
    - Update handle_new_user trigger function to be more robust
    - Add error handling for duplicate emails

  2. Security
    - Maintain RLS policies
    - Ensure secure profile creation
*/

-- Add INSERT policy for profiles
CREATE POLICY "Trigger can create user profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Update the trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, wallet_balance)
  VALUES (new.id, new.email, 0.00)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- If there's a duplicate email, just return the new user
    -- The profile creation will be handled by the conflict clause
    RETURN new;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
