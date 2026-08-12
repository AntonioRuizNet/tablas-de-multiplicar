# Implementación SEO y producto

## Cambios críticos
- SSR/SSG: el contenido principal ya no espera a Redux Persist en `_app.js`.
- `/tabla-del-1` a `/tabla-del-12` se generan estáticamente con `getStaticPaths/getStaticProps`.
- Redirecciones 301 de `/tabla-1` ... `/tabla-12` a las URLs canónicas.
- Cualquier slug no válido capturado por `[tabla].js` devuelve 404 gracias a `fallback: false`.
- Canonical, title, description y schema `Article` propios en cada artículo.
- Renderer de artículos ampliado a `h2`, `h3`, `p`, `ul` y `ol`.
- Sitemap regenerado con URLs nuevas y `lastmod`.
- Corregido `apple-touch-icon`, eliminada la precarga innecesaria de `og-image` y unificadas las peticiones de Google Fonts.

## Nuevas páginas y recursos
- Todas las tablas del 1 al 12.
- Tabla pitagórica imprimible.
- Tablas completas para imprimir.
- Generador de fichas y 12 fichas individuales.
- Contrarreloj de 60 segundos.
- Prueba de 30 operaciones.
- Diploma con prueba de 40 operaciones y umbral del 90%.
- Juego de memoria.
- Práctica basada en los errores guardados del usuario.
- Hub de juegos y hub de ejercicios.
- Guía para aprender, trucos, metodología, profesores, familias y sobre nosotros.

## Páginas de tabla
Cada `/tabla-del-X` mantiene el juego a pantalla completa y añade debajo HTML indexable con:
- Tabla completa del 1 al 12.
- Truco específico para esa tabla.
- Consejos de práctica.
- Enlaces a ficha, contrarreloj, prueba y tabla pitagórica.
- FAQ visible.
- Navegación anterior/siguiente y breadcrumbs con schema.

## Verificación antes de producción
1. Ejecutar `npm install`.
2. Ejecutar `npm run sitemap`.
3. Ejecutar `npm run build`.
4. Probar al menos `/`, `/tabla-del-7`, `/tabla-7` (debe redirigir), `/articulos/...`, `/contrarreloj`, `/fichas-tablas-de-multiplicar` y `/diploma-tablas-de-multiplicar`.
5. Tras desplegar, enviar `https://tablasdemultiplicar.app/sitemap.xml` en Google Search Console.
6. Solicitar reindexación de `/`, algunas `/tabla-del-X` y las nuevas páginas prioritarias.
7. Vigilar que las URLs antiguas `/tabla-X` desaparezcan progresivamente del índice.

## Contacto
Se ha dejado `src/pages/contacto.jsx` como plantilla, pero NO se incluye en el sitemap porque falta un correo/canal de contacto real confirmado. Sustituye el texto por tus datos reales antes de indexarla.

## Nota de entorno
En el entorno usado para esta modificación, `npm install` agotó el límite de ejecución antes de descargar las dependencias. Se validó la sintaxis de todos los JS/JSX con el parser de TypeScript y también se verificó que todos los imports relativos existentes resuelven a archivos reales. La compilación final `next build` debe ejecutarse en tu entorno tras instalar dependencias.
