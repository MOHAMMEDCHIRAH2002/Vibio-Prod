INSERT INTO users (id, email, name, role, "passwordHash", "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'mohammedchirah2002@gmail.com',
  'Mohammed Chirah',
  'ADMIN',
  '$2a$12$ai7t0YI2rkiFRO33DZxyruMzHC4pZ93WPKu4lhHbe1X3zNQrMm8.a',
  NOW(), NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'ADMIN',
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "emailVerified" = NOW(),
  "updatedAt" = NOW();
