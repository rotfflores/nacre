/*
 * Alba — Nail Atelier · Configuración del negocio
 * ------------------------------------------------------------
 * Este es el ÚNICO archivo que necesitas editar para personalizar el sitio
 * con la información real del estudio. Deja un campo vacío ("") o en null
 * cuando el dato todavía no esté confirmado: el sitio lo ocultará o mostrará
 * un estado honesto en lugar de inventar información.
 */
window.NACRE_CONFIG = {
  business: {
    name: "Alba",
    descriptor: "Nail Atelier",
    // Número de WhatsApp de contacto (aparece en Contacto), formato internacional, solo dígitos.
    // México: 52 + 10 dígitos. Ejemplo de formato: "5215512345678" (no es un número real).
    whatsapp: "526182051723",
    instagram: {
      handle: "rotf.studio",
      url: "https://www.instagram.com/rotf.studio/"
    },
    address: {
      isSample: true,
      street: "Calle Alba 18", // Dirección ficticia para esta demostración
      neighborhood: "Colonia Jardín",
      city: "Durango",
      state: "Durango",
      postalCode: "34000",
      country: "MX",
      mapsUrl: ""            // Enlace de Google Maps (botón “Cómo llegar”)
    },
    // Horario. Ejemplo: { days: "Martes a viernes", hours: "10:00 – 19:00" }
    hours: [
      { days: "Lunes a viernes", hours: "10:00 – 19:00" },
      { days: "Sábado", hours: "10:00 – 16:00" }
    ],
    siteUrl: ""              // URL pública final, p. ej. "https://alba.mx" (para metadatos)
  },

  /*
   * Envío del formulario de citas (se envía dentro de la página).
   * Pega aquí la dirección del servicio que recibirá las solicitudes. Opciones sin servidor propio:
   *   • Formspree:  crea un formulario gratis en https://formspree.io y pega su URL,
   *                 p. ej. "https://formspree.io/f/abcdwxyz"
   *   • FormSubmit: usa "https://formsubmit.co/ajax/TU-CORREO@dominio.com" (el primer envío
   *                 manda un correo de activación a esa dirección).
   * Mientras esté vacío, el formulario funciona en modo vista previa y NO envía nada
   * (se lo indica claramente a quien lo usa).
   */
  booking: {
    endpoint: "",
    subject: "Nueva solicitud de cita — Alba"
  },

  // true: muestra “Por confirmar” en los datos de contacto faltantes (útil para presentar
  // la propuesta). Cámbialo a false antes de publicar para ocultarlos por completo.
  showPendingDetails: true,

  // Moneda para precios. Los precios solo se muestran si se capturan abajo.
  currency: "MXN",

  /*
   * Servicios. Catálogo propuesto: confirma disponibilidad antes de publicar.
   * price: número en MXN o null. priceFrom: true si es precio “desde”.
   * duration: texto como "60 min" o null. Nunca inventes montos.
   * image: foto del servicio (se revela al pasar el cursor; en celular aparece en miniatura).
   * color: color de su tarjeta y de su opción en el formulario.
   */
  services: [
    { id: "manicura", name: "Manicura", description: "Forma y cuidado para una apariencia limpia y natural.", price: null, priceFrom: false, duration: null, image: "assets/img/g-milky-nude-realistic.jpg", color: "#F6D9DF" },
    { id: "gel-semipermanente", name: "Gel semipermanente", description: "Color y acabado para acompañar tu estilo.", price: null, priceFrom: false, duration: null, image: "assets/img/g-burgundy-profundo-realistic.jpg", color: "#C02550" },
    { id: "unas-acrilicas", name: "Uñas acrílicas", description: "Explora distintas formas, largos y posibilidades de diseño.", price: null, priceFrom: false, duration: null, image: "assets/img/g-champagne-cromado-realistic.jpg", color: "#E7C99B" },
    { id: "refuerzo", name: "Refuerzo de uña natural", description: "Una opción para trabajar sobre el largo de tus propias uñas.", price: null, priceFrom: false, duration: null, image: "assets/img/g-nude-satinado-realistic.jpg", color: "#F49AAE" },
    { id: "nail-art", name: "Nail art", description: "Detalles y combinaciones para crear una propuesta personal.", price: null, priceFrom: false, duration: null, image: "assets/img/g-abstracto-blush-realistic.jpg", color: "#CDB9F2" },
    { id: "retiro-mantenimiento", name: "Retiro y mantenimiento", description: "Consulta la opción adecuada para tu aplicación actual.", price: null, priceFrom: false, duration: null, image: "assets/img/services-realistic.jpg", color: "#A8E0D2" }
  ],

  // Nota opcional bajo el menú de servicios (p. ej. condiciones de precios “desde”).
  pricingNote: "",

  /*
   * Galería. source:
   *   "illustration" → imagen ilustrativa de referencia (la que trae el sitio ahora).
   *   "inspiration"  → foto de inspiración de terceros (no es trabajo del estudio).
   *   "studio"       → trabajo real realizado en el estudio.
   * Mientras haya imágenes que no sean "studio", el sitio muestra una nota aclaratoria.
   * category debe ser una de: minimalistas, francesas, nail-art, especiales.
   */
  galleryNote: {
    illustration: "Imágenes ilustrativas de referencia; no corresponden a trabajos realizados en el estudio.",
    inspiration: "Algunas imágenes son inspiración de referencia y no corresponden a trabajos del estudio."
  },
  gallery: [
    { id: "milky-nude", name: "Milky nude", category: "minimalistas", image: "assets/img/g-milky-nude-realistic.jpg", width: 800, height: 1000, alt: "Cinco uñas almendradas en tono blanco lechoso translúcido, dispuestas en abanico sobre terciopelo color ciruela.", source: "illustration" },
    { id: "francesa-clasica", name: "Francesa clásica", category: "francesas", image: "assets/img/g-francesa-clasica-realistic.jpg", width: 800, height: 1000, alt: "Uñas cuadradas en tono nude con punta francesa blanca, en abanico sobre piedra oscura.", source: "illustration" },
    { id: "media-luna", name: "Media luna burgundy", category: "nail-art", image: "assets/img/g-media-luna-realistic.jpg", width: 800, height: 800, alt: "Uñas ovaladas color burgundy con una media luna en tono nude en la base delineada en champaña, sobre fondo oscuro.", source: "illustration" },
    { id: "burgundy-profundo", name: "Burgundy profundo", category: "especiales", image: "assets/img/g-burgundy-profundo-realistic.jpg", width: 800, height: 1000, alt: "Cuatro uñas almendradas en burgundy profundo con acabado brillante, en diagonal sobre fondo oscuro.", source: "illustration" },
    { id: "linea-fina", name: "Línea fina", category: "minimalistas", image: "assets/img/g-linea-fina-realistic.jpg", width: 800, height: 1067, alt: "Uña nude con una línea fina burgundy y un pequeño punto champaña, junto a una uña nude brillante, sobre terciopelo violeta.", source: "illustration" },
    { id: "micro-francesa", name: "Micro francesa", category: "francesas", image: "assets/img/g-micro-francesa-realistic.jpg", width: 800, height: 800, alt: "Uñas almendradas nude con una punta francesa muy delgada, en diagonal sobre terciopelo color cereza oscuro.", source: "illustration" },
    { id: "abstracto-blush", name: "Abstracto en blush", category: "nail-art", image: "assets/img/g-abstracto-blush-realistic.jpg", width: 800, height: 1067, alt: "Uñas en tono blush con trazos abstractos burgundy y una línea champaña, alternadas con uñas lisas, sobre terciopelo cereza oscuro.", source: "illustration" },
    { id: "perla-iridiscente", name: "Perla iridiscente", category: "especiales", image: "assets/img/g-perla-iridiscente-realistic.jpg", width: 800, height: 800, alt: "Dos uñas almendradas con acabado perlado iridiscente sobre terciopelo violeta.", source: "illustration" },
    { id: "nude-satinado", name: "Nude satinado", category: "minimalistas", image: "assets/img/g-nude-satinado-realistic.jpg", width: 800, height: 800, alt: "Fila de uñas ovaladas en tono nude con acabado satinado sobre piedra oscura.", source: "illustration" },
    { id: "francesa-burgundy", name: "Francesa burgundy", category: "francesas", image: "assets/img/g-francesa-burgundy-realistic.jpg", width: 800, height: 1067, alt: "Dos uñas coffin en tono nude con punta francesa color burgundy, sobre terciopelo color ciruela.", source: "illustration" },
    { id: "puntos-perla", name: "Puntos de perla", category: "nail-art", image: "assets/img/g-puntos-perla-realistic.jpg", width: 800, height: 1000, alt: "Uña nude con tres pequeños puntos perlados en línea, junto a una uña blanco lechoso, sobre terciopelo violeta.", source: "illustration" },
    { id: "champagne-cromado", name: "Champaña cromado", category: "especiales", image: "assets/img/g-champagne-cromado-realistic.jpg", width: 800, height: 1067, alt: "Uñas coffin con acabado cromado en tono champaña, dispuestas en abanico sobre terciopelo color ciruela.", source: "illustration" }
  ],

  // Filtros de la galería: color = punto de color de cada filtro.
  galleryFilters: [
    { id: "todos", label: "Todos", color: "conic-gradient(#F6C9D4 0 25%, #CDB9F2 0 50%, #E7C99B 0 75%, #D2335A 0)" },
    { id: "minimalistas", label: "Minimalistas", color: "#F6D9DF" },
    { id: "francesas", label: "Francesas", color: "#FBF4EF" },
    { id: "nail-art", label: "Nail art", color: "#CDB9F2" },
    { id: "especiales", label: "Especiales", color: "#E7C99B" }
  ],

  // Imágenes principales del sitio (sustitúyelas por fotografías reales del estudio).
  images: {
    studio: { src: "assets/img/studio-realistic.jpg", width: 1400, height: 934, alt: "Mesa de trabajo oscura con esmaltes cereza, lila, rosa y champaña, un abanico de muestras de uñas, perlas y un anillo dorado." },
    studioDetail: { src: "assets/img/studio-detail-realistic.jpg", width: 800, height: 1000, alt: "Carta de muestras con doce acabados y cuatro formas de uña sobre terciopelo violeta." }
  },

  // Preguntas frecuentes. Respuestas honestas mientras no haya políticas confirmadas.
  faq: [
    {
      q: "¿Puedo llevar una imagen de referencia?",
      a: "Sí. Puedes elegir un diseño de la galería con “Quiero un diseño similar” o describir tu idea en la solicitud y compartir tu imagen cuando el estudio te contacte. Nos ayuda a entender el estilo, los colores y la forma que tienes en mente."
    },
    {
      q: "¿Cómo se define el precio de un diseño?",
      a: "Depende del servicio base, el largo, la forma y el nivel de detalle del diseño. Escríbenos con tu idea o tu imagen de referencia y el estudio te compartirá la información correspondiente."
    },
    {
      q: "¿Debo indicar si necesito un retiro?",
      a: "Sí, por favor menciónalo en tu solicitud junto con el tipo de aplicación que llevas actualmente. Así el estudio puede considerar el tiempo necesario y recomendarte la opción adecuada."
    },
    {
      q: "¿Cómo se confirma mi cita?",
      a: "Envías tu solicitud desde el formulario de esta página. El estudio revisa la disponibilidad y te contacta al teléfono que dejaste para confirmar la fecha, el horario y los detalles. Tu cita queda confirmada solo cuando recibas esa confirmación."
    }
  ]
};
