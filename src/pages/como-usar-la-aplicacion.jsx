import React from "react";
import Link from "next/link";
import { ResourceLayout } from "../components/resources/ResourceLayout";
import styles from "./como-usar-la-aplicacion.module.css";

const INDEX = [
  ["primeros-pasos", "Primeros pasos"],
  ["cuenta", "Cuenta y perfil"],
  ["tablas", "Tablas de multiplicar"],
  ["juegos", "Juegos y práctica"],
  ["progreso", "Puntos, niveles y logros"],
  ["rankings", "Rankings y perfiles"],
  ["errores", "Repasar errores"],
  ["aulas", "Aulas para profesores y alumnos"],
  ["retos", "Retos de aula"],
  ["estadisticas", "Estadísticas para profesores"],
  ["glosario", "Glosario"],
];

function Section({ id, title, children }) {
  return <section id={id} className={styles.section}><h2>{title}</h2>{children}<a className={styles.back} href="#indice">↑ Volver al índice</a></section>;
}

export default function ComoUsarLaAplicacion() {
  return <ResourceLayout
    title="Cómo usar la aplicación"
    description="Guía completa para usar tablasdemultiplicar.app: tablas, juegos, puntos, logros, rankings, aulas, retos y estadísticas para profesores."
    path="/como-usar-la-aplicacion"
  >
    <main className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Guía de uso</span>
        <h1>Cómo usar tablasdemultiplicar.app</h1>
        <p>Esta guía explica de forma ordenada las principales secciones de la aplicación, tanto para alumnos y familias como para profesores. Puedes leerla completa o usar el índice para ir directamente a la funcionalidad que necesitas.</p>
      </header>

      <nav id="indice" className={styles.index} aria-label="Índice de la guía">
        <h2>Índice rápido</h2>
        <div className={styles.indexGrid}>{INDEX.map(([id, label], index) => <a key={id} href={`#${id}`}><span>{index + 1}</span>{label}</a>)}</div>
      </nav>

      <Section id="primeros-pasos" title="1. Primeros pasos">
        <p>Puedes utilizar muchas actividades sin registrarte, pero crear una cuenta permite guardar tu progreso, puntos, logros, resultados y estadísticas.</p>
        <div className={styles.steps}>
          <article><strong>1</strong><div><h3>Crea tu cuenta</h3><p>Regístrate con un nombre de usuario y contraseña. El correo electrónico es opcional, aunque es recomendable añadirlo para poder recuperar la contraseña.</p></div></article>
          <article><strong>2</strong><div><h3>Empieza por una tabla</h3><p>Entra en <Link href="/todas-las-tablas-de-multiplicar">Todas las tablas</Link> y selecciona la tabla que quieras aprender o repasar.</p></div></article>
          <article><strong>3</strong><div><h3>Practica de distintas formas</h3><p>Alterna práctica normal, juegos, contrarreloj y actividades para mantener el aprendizaje variado.</p></div></article>
        </div>
      </Section>

      <Section id="cuenta" title="2. Cuenta y perfil">
        <p>Desde <Link href="/perfil">Mi perfil</Link> puedes consultar tus datos, cambiar tu nombre de usuario cuando esté permitido, actualizar la contraseña y personalizar tu avatar.</p>
        <div className={styles.callout}><strong>Consejo:</strong> añade un correo electrónico a tu cuenta. No es obligatorio para jugar, pero permite recuperar el acceso si olvidas la contraseña.</div>
        <p>El avatar utiliza personajes y colores predefinidos. Aparece en el perfil público y en los rankings para que cada jugador pueda reconocerse fácilmente.</p>
      </Section>

      <Section id="tablas" title="3. Tablas de multiplicar">
        <p>La sección <Link href="/todas-las-tablas-de-multiplicar">Todas las tablas</Link> reúne las tablas del 1 al 12. Cada tabla dispone de su propia página para aprenderla y practicarla.</p>
        <p>La práctica registra las operaciones realizadas cuando el usuario ha iniciado sesión. Esto permite calcular progreso, precisión y actividad acumulada.</p>
      </Section>

      <Section id="juegos" title="4. Juegos y práctica">
        <div className={styles.cards}>
          <article><h3>Juegos de multiplicar</h3><p>Actividades centradas específicamente en multiplicaciones para practicar de forma más dinámica.</p><Link href="/juegos-tablas-de-multiplicar">Ver juegos</Link></article>
          <article><h3>Otros juegos</h3><p>Incluye actividades de sumas, restas y divisiones con distintos niveles de dificultad.</p><Link href="/otros-juegos">Ver otros juegos</Link></article>
          <article><h3>Contrarreloj</h3><p>Actividad para trabajar agilidad mental y responder el mayor número posible de operaciones.</p><Link href="/contrarreloj">Ir a Contrarreloj</Link></article>
          <article><h3>Tabla pitagórica</h3><p>Una forma visual de comprender las relaciones entre las distintas tablas de multiplicar.</p><Link href="/tabla-pitagorica">Ver tabla pitagórica</Link></article>
        </div>
      </Section>

      <Section id="progreso" title="5. Puntos, niveles y logros">
        <p>Las actividades realizadas con una cuenta pueden generar puntos. Los puntos hacen avanzar de nivel y permiten comparar el progreso de una forma sencilla.</p>
        <p>Los logros se desbloquean al cumplir determinados objetivos, por ejemplo completar actividades o alcanzar ciertos resultados. Puedes consultarlos en tu perfil.</p>
        <div className={styles.callout}><strong>Importante:</strong> los puntos son un elemento de motivación. No sustituyen a la precisión ni al aprendizaje real; conviene revisar también los errores y el porcentaje de aciertos.</div>
      </Section>

      <Section id="rankings" title="6. Rankings y perfiles públicos">
        <p>En el menú lateral aparecen clasificaciones de usuarios por puntos y por número de operaciones realizadas. Las primeras posiciones se distinguen con medallas.</p>
        <p>Al pulsar en un jugador puedes consultar su perfil público, donde se muestran datos generales de progreso, logros y estadísticas. No se muestra su correo electrónico.</p>
      </Section>

      <Section id="errores" title="7. Repasar errores">
        <p>La sección <Link href="/practicar-errores">Mis errores</Link> permite volver sobre operaciones que han costado más. Es especialmente útil después de practicar varias tablas o completar actividades.</p>
        <p>La recomendación es combinar práctica normal con repasos de errores en lugar de repetir siempre las mismas operaciones que ya se dominan.</p>
      </Section>

      <Section id="aulas" title="8. Aulas para profesores y alumnos">
        <p>Los usuarios registrados pueden acceder a <Link href="/mi-aula">Mi aula</Link>. Un profesor puede activar su perfil de profesor, crear varias aulas y obtener un código único para cada una.</p>
        <div className={styles.twoCol}>
          <article><h3>Para profesores</h3><p>Crea un aula, comparte su código y consulta el progreso de los alumnos que se unan. No necesitas recopilar sus correos electrónicos.</p></article>
          <article><h3>Para alumnos</h3><p>Introduce el código facilitado por el profesor para unirte al aula. Un mismo alumno puede pertenecer a varias aulas.</p></article>
        </div>
        <p>El profesor puede ver nombre, nivel, puntos, operaciones, porcentaje de aciertos y última actividad de sus alumnos. Estas estadísticas no se comparten con otros alumnos.</p>
      </Section>

      <Section id="retos" title="9. Retos de aula">
        <p>Dentro de un aula, el profesor puede crear retos seleccionando las tablas que quiere trabajar, el número de operaciones y, si lo desea, una fecha límite.</p>
        <p>Cada reto genera un enlace directo que se puede compartir en Classroom, Moodle, Séneca, WhatsApp u otras herramientas. Los alumnos pueden abrir ese enlace y completar la actividad.</p>
        <p>El profesor puede consultar quién está pendiente, quién ha empezado, quién lo ha completado, el porcentaje de aciertos y el tiempo empleado.</p>
      </Section>

      <Section id="estadisticas" title="10. Estadísticas para profesores">
        <p>La sección de estadísticas del aula ayuda a detectar rápidamente qué alumnos y qué tablas necesitan más atención.</p>
        <p>Los profesores pueden filtrar la información por hoy, últimos 7 días o últimos 30 días y consultar operaciones, precisión, alumnos con baja precisión y alumnos sin actividad reciente.</p>
        <p>También se muestran las tablas con menor porcentaje de aciertos para facilitar la planificación de próximos repasos y retos.</p>
      </Section>

      <Section id="glosario" title="11. Glosario">
        <dl className={styles.glossary}>
          <div><dt>Aula</dt><dd>Grupo creado por un profesor al que los alumnos se unen mediante un código.</dd></div>
          <div><dt>Avatar</dt><dd>Personaje y color que identifica visualmente a un usuario.</dd></div>
          <div><dt>Precisión</dt><dd>Porcentaje de operaciones respondidas correctamente.</dd></div>
          <div><dt>Puntos</dt><dd>Recompensa obtenida al completar correctamente determinadas actividades.</dd></div>
          <div><dt>Nivel</dt><dd>Indicador de progreso que aumenta a medida que se acumulan puntos.</dd></div>
          <div><dt>Logro</dt><dd>Reconocimiento desbloqueado al alcanzar un objetivo concreto dentro de la aplicación.</dd></div>
          <div><dt>Ranking</dt><dd>Clasificación de jugadores basada en puntos u operaciones realizadas.</dd></div>
          <div><dt>Reto</dt><dd>Actividad creada por un profesor para una de sus aulas.</dd></div>
          <div><dt>Código de aula</dt><dd>Código único que permite a un alumno unirse a una clase.</dd></div>
          <div><dt>Perfil público</dt><dd>Vista con estadísticas generales de un jugador sin mostrar datos privados como el correo.</dd></div>
          <div><dt>Operación</dt><dd>Cada cálculo individual respondido durante una práctica, juego o reto.</dd></div>
          <div><dt>Última actividad</dt><dd>Fecha de la operación más reciente registrada para un usuario.</dd></div>
        </dl>
      </Section>

      <section className={styles.finalCta}><h2>¿Por dónde empezar?</h2><p>Si eres alumno, empieza eligiendo una tabla. Si eres profesor, crea tu primera aula y comparte el código con tus alumnos.</p><div><Link href="/todas-las-tablas-de-multiplicar">Elegir una tabla</Link><Link href="/mi-aula">Ir a Mi aula</Link></div></section>
    </main>
  </ResourceLayout>;
}
