DO $$
DECLARE constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'users'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'teacher', 'admin'));

CREATE TABLE IF NOT EXISTS classrooms (
  id BIGSERIAL PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(8) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classrooms_teacher
  ON classrooms(teacher_id, created_at DESC);

CREATE TABLE IF NOT EXISTS classroom_students (
  classroom_id BIGINT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (classroom_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_classroom_students_student
  ON classroom_students(student_id, joined_at DESC);
