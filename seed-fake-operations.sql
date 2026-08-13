-- Añade operaciones ficticias únicamente a los 15 jugadores de prueba
-- que todavía no tengan ninguna operación registrada.
-- No modifica usuarios reales ni duplica operaciones si vuelves a ejecutar el script.

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
      ('dragon10@example.com',   920),
      ('ninjapro@example.com',   845),
      ('gatoloco@example.com',   770),
      ('maxpower@example.com',   690),
      ('panda22@example.com',    625),
      ('rayoazul@example.com',   560),
      ('tigrepro@example.com',   505),
      ('pixel10@example.com',    450),
      ('superleo@example.com',   395),
      ('lucasx@example.com',     340),
      ('estrellita@example.com', 290),
      ('lunagamer@example.com',  235),
      ('rocky10@example.com',    180),
      ('capitanx@example.com',   125),
      ('megapanda@example.com',   75)
    ) AS seed(email, operation_count) ON seed.email = u.email
    WHERE NOT EXISTS (
      SELECT 1
      FROM practice_operations po
      WHERE po.user_id = u.id
    )
  LOOP
    session_uuid := gen_random_uuid();

    INSERT INTO practice_sessions (
      id,
      user_id,
      table_number,
      points_awarded,
      correct_count,
      wrong_count,
      average_time_seconds,
      started_at,
      completed_at
    ) VALUES (
      session_uuid,
      player.id,
      2,
      0,
      player.operation_count,
      0,
      4.25,
      NOW() - INTERVAL '30 days',
      NOW() - INTERVAL '29 days'
    );

    FOR i IN 1..player.operation_count LOOP
      table_num := 1 + ((i - 1) % 12);
      multiplier_num := 1 + ((i - 1) % 10);

      INSERT INTO practice_operations (
        user_id,
        session_id,
        table_number,
        multiplier,
        is_correct,
        response_time_seconds,
        created_at
      ) VALUES (
        player.id,
        session_uuid,
        table_num,
        multiplier_num,
        true,
        2.5 + ((i % 8) * 0.35),
        NOW() - INTERVAL '29 days' + (i * INTERVAL '2 minutes')
      );
    END LOOP;
  END LOOP;
END $$;
