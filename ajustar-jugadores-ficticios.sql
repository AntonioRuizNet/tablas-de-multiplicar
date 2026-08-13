-- Reduce puntos y operaciones de los 15 jugadores ficticios existentes.
-- Solo afecta a las cuentas de prueba indicadas por email.

BEGIN;

-- Puntos bajos para que un usuario real pueda entrar pronto en el ranking.
UPDATE user_progress p
SET
  points = seed.points,
  level = FLOOR(seed.points / 100.0)::int,
  rank = FLOOR((FLOOR(seed.points / 100.0)::int) / 2.0)::int,
  updated_at = NOW()
FROM users u
JOIN (VALUES
  ('dragon10@example.com',   160),
  ('ninjapro@example.com',   140),
  ('gatoloco@example.com',   125),
  ('maxpower@example.com',   110),
  ('panda22@example.com',     95),
  ('rayoazul@example.com',    82),
  ('tigrepro@example.com',    70),
  ('pixel10@example.com',     60),
  ('superleo@example.com',    50),
  ('lucasx@example.com',      42),
  ('estrellita@example.com',  34),
  ('lunagamer@example.com',   27),
  ('rocky10@example.com',     20),
  ('capitanx@example.com',    14),
  ('megapanda@example.com',    8)
) AS seed(email, points) ON seed.email = u.email
WHERE p.user_id = u.id;

-- Eliminamos únicamente las sesiones/operaciones de los jugadores ficticios.
-- practice_operations se borra automáticamente por ON DELETE CASCADE.
DELETE FROM practice_sessions ps
USING users u
WHERE ps.user_id = u.id
  AND u.email IN (
    'dragon10@example.com','ninjapro@example.com','gatoloco@example.com',
    'maxpower@example.com','panda22@example.com','rayoazul@example.com',
    'tigrepro@example.com','pixel10@example.com','superleo@example.com',
    'lucasx@example.com','estrellita@example.com','lunagamer@example.com',
    'rocky10@example.com','capitanx@example.com','megapanda@example.com'
  );

-- Creamos una cantidad pequeña de operaciones para cada jugador ficticio.
DO $$
DECLARE
  player RECORD;
  session_uuid UUID;
  i INTEGER;
  table_num INTEGER;
  multiplier_num INTEGER;
BEGIN
  FOR player IN
    SELECT u.id, seed.operation_count
    FROM users u
    JOIN (VALUES
      ('dragon10@example.com',    45),
      ('ninjapro@example.com',    41),
      ('gatoloco@example.com',    37),
      ('maxpower@example.com',    33),
      ('panda22@example.com',     29),
      ('rayoazul@example.com',    25),
      ('tigrepro@example.com',    22),
      ('pixel10@example.com',     19),
      ('superleo@example.com',    17),
      ('lucasx@example.com',      15),
      ('estrellita@example.com',  13),
      ('lunagamer@example.com',   11),
      ('rocky10@example.com',      9),
      ('capitanx@example.com',     7),
      ('megapanda@example.com',    5)
    ) AS seed(email, operation_count) ON seed.email = u.email
  LOOP
    session_uuid := gen_random_uuid();

    INSERT INTO practice_sessions (
      id, user_id, table_number, points_awarded, correct_count,
      wrong_count, average_time_seconds, started_at, completed_at
    ) VALUES (
      session_uuid, player.id, 2, 0, player.operation_count,
      0, 4.25, NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days'
    );

    FOR i IN 1..player.operation_count LOOP
      table_num := 1 + ((i - 1) % 12);
      multiplier_num := 1 + ((i - 1) % 10);

      INSERT INTO practice_operations (
        user_id, session_id, table_number, multiplier,
        is_correct, response_time_seconds, created_at
      ) VALUES (
        player.id, session_uuid, table_num, multiplier_num,
        true, 2.5 + ((i % 8) * 0.35),
        NOW() - INTERVAL '13 days' + (i * INTERVAL '3 minutes')
      );
    END LOOP;
  END LOOP;
END $$;

COMMIT;
