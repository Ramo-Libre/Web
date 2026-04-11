ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestion individual de backups"
ON backups
FOR ALL -- SELECT, INSERT, UPDATE y DELETE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
