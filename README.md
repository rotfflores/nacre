# Alba — Nail Atelier · Sitio web (versión 3, "nácar nocturno")

Sitio de una sola página para un estudio de uñas. Diseño oscuro con acentos cereza, lila, rosa y champaña, y un degradado perlado (nácar) en los titulares y botones principales.

Hecho con HTML, CSS y JavaScript sin dependencias. Las únicas peticiones externas son las fuentes de Google Fonts (Bricolage Grotesque e Instrument Sans).

## Archivos

```
index.html           Estructura y textos fijos de la página
styles.css           Diseño (colores, tipografía y medidas al inicio, en :root)
script.js            Interacciones y animaciones
business-config.js   DATOS DEL NEGOCIO: el único archivo que necesitas editar
assets/favicon.svg   Ícono del navegador
assets/img/          Imágenes (.webp) e imagen para redes sociales (og-image.jpg)
```

Si en esta carpeta quedaron `assets/img/hero-main.webp` y `assets/img/hero-detail.webp` de la versión anterior, ya no se usan y puedes borrarlos.

## Cómo verlo

- **Rápido:** abre `index.html` con doble clic en el navegador.
- **Recomendado (igual que en producción):** desde esta carpeta ejecuta `python -m http.server 8000` y abre `http://localhost:8000`.
- **Publicar:** sube la carpeta tal cual a cualquier hosting estático (Netlify, Vercel, GitHub Pages, cPanel…). No necesita servidor ni base de datos.

## Activar el envío del formulario (importante)

La solicitud de cita se envía dentro de la página (no abre WhatsApp). Como el sitio no tiene servidor propio, necesita un servicio que reciba las solicitudes y las mande por correo. Elige una opción y pega la dirección en `business-config.js` → `booking.endpoint`:

- **Formspree (recomendado):** crea una cuenta gratis en https://formspree.io, crea un formulario con el correo del estudio y copia su URL, por ejemplo `https://formspree.io/f/abcdwxyz`. Incluye protección contra spam y un panel con todas las solicitudes.
- **FormSubmit (sin cuenta):** usa `https://formsubmit.co/ajax/correo-del-estudio@dominio.com`. El primer envío manda un correo de activación a esa dirección; hay que confirmarlo una vez.

Mientras `endpoint` esté vacío, el formulario valida los datos y muestra una confirmación animada de demostración. La pantalla aclara que los datos no se enviaron y que la cita no quedó confirmada.

Cada solicitud incluye: nombre, teléfono/WhatsApp, correo (opcional), servicio, fecha preferida, horario, diseño de referencia (si eligió uno) y comentarios. Si falla la conexión, se muestra un error y los datos se conservan para reintentar. Hay un campo oculto contra bots.

## Personalización (business-config.js)

1. **Contacto:** `business.whatsapp` (formato internacional, solo dígitos; México: `52` + 10 dígitos), Instagram, dirección, enlace de Google Maps y horario. Aparecen en el boleto de Contacto; los datos vacíos no generan enlaces.
2. **`showPendingDetails`:** está en `true` para presentar la propuesta (muestra “Por confirmar”). **Cámbialo a `false` antes de publicar** para ocultar los datos que falten.
3. **Servicios:** nombre, descripción, `price` (número en MXN), `priceFrom: true` si es precio “desde”, `duration` (por ejemplo `"60 min"`), `image` (foto que se revela al pasar el cursor; en celular aparece en miniatura) y `color` (color de su tarjeta y de su opción en el formulario). Sin precio no se muestra ningún monto. “Consultar” lleva al paso 2 de la solicitud con ese servicio ya elegido.
4. **Galería:** cada diseño tiene `name`, `category` (`minimalistas`, `francesas`, `nail-art`, `especiales`), `image`, `width`, `height`, `alt` y `source` (`"studio"` trabajo real, `"inspiration"` foto de terceros, `"illustration"` ilustración incluida). Mientras haya imágenes que no sean `"studio"`, la galería y la vista ampliada muestran una nota aclaratoria. Los filtros tienen su propio color en `galleryFilters`.
5. **Imágenes del estudio:** en `images` (`studio` y `studioDetail`). Indica siempre `width` y `height` reales.
6. **Preguntas frecuentes:** en `faq`. Aparecen como chat: cada pregunta es un botón y la respuesta llega como mensaje. Ajusta las respuestas cuando el estudio confirme sus políticas.
7. **URL final:** `business.siteUrl`. Además, en `index.html` cambia `og:image` por la URL absoluta para que la vista previa funcione en redes y WhatsApp.

Los datos estructurados para buscadores (schema.org `NailSalon`) se agregan solos cuando hay dirección o WhatsApp reales.

### Cambiar imágenes

Recomendado: WebP o JPG, 1000 px de ancho como máximo para la galería y 1600 px para el estudio, menos de 250 KB por imagen. Si una imagen falta o no carga, el sitio muestra un recuadro “Imagen pendiente” con las mismas proporciones en lugar de una imagen rota.

Las uñas que flotan en la portada y en el cierre usan la prueba de recortes realistas generados con ImageGen (`assets/img/nail-*-realistic.png`, 300×520 px, fondo transparente). Son imágenes decorativas generadas, no fotografías de trabajos del estudio. Los seis prompts y las rutas están en `assets/img/nails-realistic-prompts.json`.

Para volver a las figuras anteriores, cambia las referencias `nail-*-realistic.png` de `index.html` por sus equivalentes `nail-*.webp`; los originales se conservan.

La galería, los servicios y las imágenes del estudio usan además quince imágenes realistas generadas (`assets/img/*-realistic.jpg`). Cada diseño respeta la forma, el color y el acabado descritos en el catálogo. El archivo `assets/img/catalog-realistic-prompts.json` contiene los prompts, las medidas y las rutas finales. Los archivos WebP anteriores se conservan como respaldo.

### Cambiar el nombre de la marca

El nombre actual es “Alba”. Para cambiarlo, actualízalo en `business-config.js`, en el logotipo de `index.html` (cabecera, boleto de contacto y la palabra grande del pie), en `<title>` y en las etiquetas `og:`. La imagen `og-image.jpg` también lleva el nombre.

## Qué incluye

- **Portada:** titular gigante que aparece letra por letra con desenfoque, la palabra “detalle.” con brillo perlado en movimiento y uñas flotantes con profundidad que siguen al cursor y se separan al hacer scroll.
- **Cabecera:** píldora flotante que se esconde al bajar y vuelve al subir (escritorio). En celular, menú a pantalla completa color cereza que se abre en círculo desde el botón.
- **Servicios:** mosaico de tarjetas de colores; al pasar el cursor, un brillo sigue al puntero y la foto del servicio se revela en círculo desde el cursor.
- **Diseños:** en escritorio la sección se queda fija y la galería avanza en horizontal con el scroll (con una ligera inclinación según la velocidad). En celular es un carrusel para deslizar. Filtros por estilo, burbuja “Ver” que sigue al cursor y vista ampliada en la que la imagen “vuela” desde la tarjeta; anterior/siguiente con flechas del teclado o deslizando; “Quiero un diseño similar” lleva el diseño a la solicitud.
- **El estudio:** cuatro tarjetas de colores que se apilan al hacer scroll; las anteriores se encogen y oscurecen. La foto se revela en círculo.
- **Solicitud de cita en 4 pasos:** servicio → fecha y horario (con atajos “Mañana”, “Este sábado”, “En una semana”) → tus datos → revisar y enviar. Validación por paso, botones “Cambiar” en el resumen, fechas pasadas bloqueadas y pantalla final con un “esmalte” que se llena.
- **Preguntas frecuentes en formato chat**, con indicador de “escribiendo”.
- **Contacto en forma de boleto** y un cierre cuyo texto se llena de color con el scroll; en el pie, la palabra “alba” gigante.
- Botones magnéticos y un destello suave que sigue al cursor (solo con mouse).
- Accesible con teclado y lector de pantalla: foco visible, menú y vista ampliada con manejo de foco, anuncios de cada paso del formulario.
- Respeta `prefers-reduced-motion` (sin animaciones, sin galería fija). Si JavaScript falla o tarda, el contenido se muestra igual.
- Probado sin desbordes horizontales en 360, 375, 900 y 1440 px.

## Pendiente por parte del negocio

**Datos**
- [ ] **Correo que recibirá las solicitudes** y alta en Formspree o FormSubmit (ver “Activar el envío del formulario”)
- [x] Nombre definitivo de la marca: Alba
- [x] Número de WhatsApp de contacto: 526182051723
- [x] Usuario y enlace de Instagram: @rotf.studio
- [ ] Sustituir la dirección ficticia de muestra por la dirección real y su enlace de Google Maps
- [ ] Confirmar el horario de muestra antes de publicar
- [ ] Confirmar qué servicios se ofrecen, con precios en MXN, condiciones de precios “desde” y duraciones (opcional)
- [ ] Respuestas reales de las preguntas frecuentes (precios de diseño, retiros, anticipos o cancelaciones si aplican)
- [ ] Confirmar que el texto de “El estudio” describe bien el ambiente y la atención
- [ ] Dominio / URL final

**Imágenes** (las actuales son ilustraciones de referencia generadas para esta propuesta; no son fotos de trabajos reales)
- [ ] Galería: 9 a 15 fotos de trabajos reales, idealmente con distintos tonos de piel, de cada categoría (minimalistas, francesas, nail art, especiales). Funcionan mejor con fondos oscuros o neutros.
- [ ] Estudio: foto horizontal del espacio (3:2) y un detalle vertical (4:5)
- [ ] Una foto por servicio (vertical), opcional
- [ ] Imagen para redes sociales 1200×630 px (`og-image.jpg`) con fotografía real
- [ ] Logotipo, si el estudio tiene uno (hoy es un logotipo tipográfico)
