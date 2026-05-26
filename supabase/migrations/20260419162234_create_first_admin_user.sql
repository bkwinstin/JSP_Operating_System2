/*
  # Create First Admin User

  Creates a confirmed admin user to seed the system.
  Email: admin@jsp.org
  Password: JSPAdmin2024!

  - Inserts directly into auth.users with email_confirmed_at set (bypasses confirmation)
  - The handle_new_user trigger fires automatically and assigns 'admin' role
  - Safe to re-run: uses WHERE NOT EXISTS guard
*/

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@jsp.org') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@jsp.org',
      crypt('JSPAdmin2024!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;
