-- Add INSERT policy for chargers table
CREATE POLICY "Authenticated users can insert chargers"
  ON chargers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Remove the old update policy, as it doesn't allow for inserting new chargers.
DROP POLICY IF EXISTS "Owners can update their chargers" ON chargers;

-- Recreate the update policy with correct permissions
CREATE POLICY "Owners can update their chargers"
  ON chargers FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
