-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'caretaker')),
  school TEXT,
  profile_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lodges table
CREATE TABLE IF NOT EXISTS lodges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caretaker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  school TEXT,
  price_per_year NUMERIC,
  gender_allowed TEXT CHECK (gender_allowed IN ('male', 'female', 'mixed')),
  distance_from_school TEXT,
  available_rooms INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lodge photos table
CREATE TABLE IF NOT EXISTS lodge_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lodge_id UUID REFERENCES lodges(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
