-- Add backup codes table to Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_backup_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(8) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, code)
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_backup_codes ENABLE ROW LEVEL SECURITY;

-- Create policy so users can only access their own backup codes
CREATE POLICY "Users can view their own backup codes" ON user_backup_codes
  FOR ALL USING (auth.uid() = user_id);

-- Create policy for inserting backup codes
CREATE POLICY "Users can insert their own backup codes" ON user_backup_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for updating backup codes (mark as used)
CREATE POLICY "Users can update their own backup codes" ON user_backup_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to generate backup codes
CREATE OR REPLACE FUNCTION generate_backup_codes(user_uuid UUID)
RETURNS TEXT[] AS $$
DECLARE
  codes TEXT[] := '{}';
  code TEXT;
  i INTEGER;
BEGIN
  -- Delete existing backup codes
  DELETE FROM user_backup_codes WHERE user_id = user_uuid;
  
  -- Generate 10 new backup codes
  FOR i IN 1..10 LOOP
    code := UPPER(LEFT(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 8));
    codes := array_append(codes, code);
    
    INSERT INTO user_backup_codes (user_id, code) 
    VALUES (user_uuid, code);
  END LOOP;
  
  RETURN codes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate backup code
CREATE OR REPLACE FUNCTION validate_backup_code(user_uuid UUID, input_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  code_record RECORD;
BEGIN
  -- Find unused matching code
  SELECT * INTO code_record 
  FROM user_backup_codes 
  WHERE user_id = user_uuid 
    AND UPPER(code) = UPPER(input_code)
    AND used = FALSE;
  
  IF FOUND THEN
    -- Mark code as used
    UPDATE user_backup_codes 
    SET used = TRUE, used_at = NOW()
    WHERE id = code_record.id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has unused backup codes
CREATE OR REPLACE FUNCTION has_unused_backup_codes(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM user_backup_codes 
    WHERE user_id = user_uuid AND used = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;