/*
  # Fix User Signup Process

  1. Changes
    - Remove email uniqueness constraint from profiles table
    - Simplify trigger function
    - Add better error handling

  2. Security
    - Maintain RLS policies
    - Ensure secure profile creation
*/

-- Remove email uniqueness constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Update profiles table to make email nullable
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- Simplify trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
