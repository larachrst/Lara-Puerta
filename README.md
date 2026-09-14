# Nuestro tiempo ♡

Una página para nuestra historia, desde el **25 de julio de 2026 a las 14:40**, en **America/Mexico_City**. HTML, CSS y JavaScript sin frameworks, cuentas adicionales ni servidor propio.

## 1. Archivos
- `index.html`: estructura, textos y enlace de respaldo.
- `style.css`: colores, tipografías del sistema, diseño adaptable y animaciones.
- `script.js`: fecha inicial, playlist y cálculo del contador.
- `favicon.svg`: icono de la pestaña, sin servicios externos.
- `.nojekyll`: indica que los archivos se sirven directamente.
- `tests/` y `.github/workflows/check.yml`: comprobaciones automáticas de desarrollo. No son necesarios para abrir la página.

Descarga el repositorio con **Code → Download ZIP**, descomprímelo y abre `index.html`. No requiere instalar nada. Conserva los archivos del sitio en la misma carpeta.

## 2. Cambiar la fecha
Al principio de `script.js`:
```js
const TIME_ZONE = "America/Mexico_City";
const relationshipStart = new Date("2026-07-25T14:40:00-06:00");
```
El sufijo `-06:00` fija el instante inicial: no lo elimines ni lo reemplaces por `Z`, porque cambiaría la hora. Si cambias de zona o de fecha, utiliza el desfase que corresponda al nuevo instante. Los textos de fecha se actualizan automáticamente con JavaScript; también puedes ajustar sus valores de respaldo en HTML.

## 3. Cambiar la playlist
Edita `const PLAYLIST_URL` en `script.js`. Ya contiene el enlace de Spotify solicitado. Actualiza también el `href` de `id="playlist-link"` en HTML si quieres que el nuevo enlace funcione con JavaScript desactivado. Abre una pestaña nueva con `noopener noreferrer`.

## 4. Cambiar textos y colores
Edita los encabezados y frases de `index.html`. Cambia las variables de `:root` en `style.css` para personalizar los colores. No cambies los atributos `id` del contador.

## 5. Subir a GitHub
Este proyecto corresponde al repositorio [larachrst/Lara-Puerta](https://github.com/larachrst/Lara-Puerta).
Para usar otro repositorio, crea uno público en GitHub, elige **Add file → Upload files**, arrastra el contenido de la carpeta (no el ZIP) y confirma con **Commit changes**. `index.html` debe quedar en la raíz de la rama `main`.

## 6. Activar GitHub Pages
1. Abre **Settings → Pages** del repositorio.
2. En **Build and deployment → Source**, elige **Deploy from a branch**.
3. Selecciona **main** y **/(root)**.
4. Presiona **Save**.

[Configuración directa de este repositorio](https://github.com/larachrst/Lara-Puerta/settings/pages).
[Guía oficial de GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 7. Obtener el enlace público
Después de activar Pages y completar su despliegue, GitHub mostrará **Visit site** en Settings → Pages. Para este repositorio, la dirección prevista es:
https://larachrst.github.io/Lara-Puerta/

La dirección solo estará disponible después de activar Pages y finalizar la publicación. Puedes guardarla en favoritos o añadirla a la pantalla de inicio del teléfono. GitHub Pages permite alojar este sitio estático en un repositorio público sin contratar un dominio.

## 8. Actualizar en el futuro
Abre el archivo que quieras modificar en GitHub, pulsa el lápiz, edita y confirma con **Commit changes**. Pages volverá a publicar desde `main`. Si ves la versión anterior, espera a que termine el despliegue y recarga.

## Cómo se cuenta el tiempo
Cada actualización compara el reloj del dispositivo con el instante inicial. El sitio no guarda ni acumula segundos, por lo que funciona aunque haya estado cerrado.

Se calculan meses completos mediante aniversarios del calendario gregoriano en México; 12 meses forman un año. Después se calculan días completos de calendario y las horas, minutos y segundos restantes. Los meses no equivalen a 30 días ni los años a 365. Para fechas configuradas en el día 29, 30 o 31, los aniversarios se ajustan al último día del mes cuando sea necesario, siempre anclados al día original.

Los instantes se convierten con `Intl.DateTimeFormat` y las reglas horarias IANA del navegador. Mantén el navegador y el reloj del dispositivo actualizados. No hay consultas a servidores de hora. Si se abre antes del inicio, muestra ceros y “Nuestra historia está por comenzar”.

## Accesibilidad y comprobaciones
Diseño de tres columnas en móvil y seis en pantallas amplias, foco visible, enlace para saltar al contador, unidades escritas y región timer sin anuncios cada segundo. Las animaciones respetan `prefers-reduced-motion`.

Puedes ejecutar `node tests/counter.cjs` si tienes Node. El flujo de GitHub Actions comprueba también el navegador, varios anchos de pantalla, otras zonas horarias, la apertura de la playlist, el modo local y los errores de consola. Las dependencias de pruebas se instalan solo en ese entorno; el sitio publicado no depende de ellas. La prueba de playlist verifica la URL y la nueva pestaña mediante una respuesta simulada, no la disponibilidad ni los permisos de reproducción de Spotify.
