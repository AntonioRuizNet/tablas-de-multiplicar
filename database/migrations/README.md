# Migraciones de base de datos

Las migraciones SQL de esta carpeta se ejecutan automáticamente al arrancar el contenedor mediante `npm run db:migrate`.

## Crear una migración nueva

1. Añade un archivo `.sql` con un nombre ordenable por fecha, por ejemplo:
   `2026-09-10_teacher_classrooms.sql`.
2. No modifiques una migración que ya haya sido desplegada. El runner guarda un checksum y detendrá el arranque si detecta cambios en un archivo ya aplicado.
3. No incluyas `BEGIN`, `COMMIT` ni `ROLLBACK` dentro del archivo. El runner ejecuta todas las migraciones pendientes dentro de una transacción protegida por un advisory lock.
4. Evita operaciones destructivas salvo que sean imprescindibles y estén expresamente revisadas.

## Cómo funciona

El runner crea, si no existe, la tabla `schema_migrations`, donde registra el nombre, checksum y fecha de cada migración aplicada.

En cada arranque:

- ordena los `.sql` por nombre;
- omite los que ya constan en `schema_migrations`;
- ejecuta únicamente los pendientes;
- registra los nuevos al terminar correctamente;
- hace rollback completo si alguna migración falla.

Las migraciones existentes antes de introducir este sistema son idempotentes, por lo que el primer despliegue puede volver a ejecutarlas de forma segura y quedarán registradas sin borrar datos existentes.
