// SEO Configuration for Hazlo con Peques
// Central configuration for all SEO-related metadata

// Centralized logo URL - validated and should be used across all SEO metadata
const LOGO_URL = "https://i.postimg.cc/NFNFJPm1/Logo-hazlo-con-peques.png";

export const SEO_CONFIG = {
  siteName: "Hazlo con Peques",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://hazloconpeques.com",
  defaultTitle: "Hazlo con Peques - Eventos y Actividades para Niños",
  defaultDescription: "Descubre eventos, talleres y actividades para niños cerca de ti. Ciencia, arte, música, naturaleza y más experiencias educativas para peques de 2 a 10 años.",
  locale: "es_ES",
  language: "es",

  // Social media
  twitter: "@hazloconpeques",

  // Default OG image - use logo for now since og-image.png may not exist
  defaultOgImage: LOGO_URL,
  ogImageWidth: 1200,
  ogImageHeight: 630,

  // Organization info for Schema.org
  organization: {
    name: "Hazlo con Peques",
    url: "https://hazloconpeques.com",
    logo: LOGO_URL,
    contactEmail: "hola@hazloconpeques.com",
  },
};

// Spanish cities with SEO content
export const SEO_CITIES = [
  {
    slug: "madrid",
    name: "Madrid",
    region: "Comunidad de Madrid",
    description: "Descubre las mejores actividades y eventos para niños en Madrid. Talleres, cuentacuentos, ciencia y arte para peques en la capital.",
    metaDescription: "Encuentra eventos y actividades para niños en Madrid. Talleres creativos, cuentacuentos, ciencia, música y más planes divertidos para peques cerca de ti.",
    neighborhoods: ["Chamberí", "Salamanca", "Retiro", "Chamartín", "Moncloa", "Arganzuela"],
    lat: 40.4168,
    lng: -3.7038,
  },
  {
    slug: "barcelona",
    name: "Barcelona",
    region: "Cataluña",
    description: "Explora actividades infantiles en Barcelona. Desde talleres de arte hasta experimentos científicos para los más pequeños de la casa.",
    metaDescription: "Eventos y actividades para niños en Barcelona. Descubre talleres, cuentacuentos, ciencia para peques y planes en familia en la Ciudad Condal.",
    neighborhoods: ["Eixample", "Gràcia", "Sarrià", "Sant Martí", "Sants"],
    lat: 41.3851,
    lng: 2.1734,
  },
  {
    slug: "valencia",
    name: "Valencia",
    region: "Comunidad Valenciana",
    description: "Encuentra planes con niños en Valencia. Actividades educativas, talleres creativos y eventos para disfrutar en familia.",
    metaDescription: "Actividades y eventos para niños en Valencia. Talleres de manualidades, ciencia, música y más planes divertidos para disfrutar con tus peques.",
    neighborhoods: ["Ciutat Vella", "L'Eixample", "Benimaclet", "Russafa"],
    lat: 39.4699,
    lng: -0.3763,
  },
  {
    slug: "sevilla",
    name: "Sevilla",
    region: "Andalucía",
    description: "Descubre actividades para niños en Sevilla. Talleres de flamenco, ciencia, arte y mucho más para los peques sevillanos.",
    metaDescription: "Eventos y planes con niños en Sevilla. Encuentra talleres creativos, cuentacuentos, actividades al aire libre y experiencias únicas para peques.",
    neighborhoods: ["Triana", "Nervión", "Santa Cruz", "Los Remedios"],
    lat: 37.3891,
    lng: -5.9845,
  },
  {
    slug: "bilbao",
    name: "Bilbao",
    region: "País Vasco",
    description: "Actividades infantiles en Bilbao. Desde museos hasta talleres de ciencia, descubre qué hacer con niños en la capital vizcaína.",
    metaDescription: "Planes y actividades para niños en Bilbao. Talleres educativos, ciencia, arte y eventos familiares en el País Vasco.",
    neighborhoods: ["Abando", "Deusto", "Indautxu", "Casco Viejo"],
    lat: 43.263,
    lng: -2.935,
  },
  {
    slug: "malaga",
    name: "Málaga",
    region: "Andalucía",
    description: "Planes con niños en Málaga. Actividades al aire libre, talleres creativos y eventos para disfrutar del sol con los peques.",
    metaDescription: "Descubre eventos y actividades para niños en Málaga. Talleres, ciencia, arte y planes al aire libre para peques en la Costa del Sol.",
    neighborhoods: ["Centro Histórico", "El Palo", "Teatinos", "La Malagueta"],
    lat: 36.7213,
    lng: -4.4214,
  },
  {
    slug: "zaragoza",
    name: "Zaragoza",
    region: "Aragón",
    description: "Encuentra actividades para niños en Zaragoza. Talleres, cuentacuentos y eventos educativos para los peques aragoneses.",
    metaDescription: "Eventos y actividades infantiles en Zaragoza. Descubre talleres creativos, ciencia para niños y planes familiares en Aragón.",
    neighborhoods: ["Centro", "Delicias", "Actur", "La Almozara"],
    lat: 41.6488,
    lng: -0.8891,
  },
];

// Categories with SEO content
export const SEO_CATEGORIES = [
  {
    slug: "ciencia",
    name: "Ciencia para Niños",
    shortName: "Ciencia",
    icon: "🔬",
    color: "#3B82F6",
    description: "Talleres de ciencia y experimentos para niños. Descubre actividades donde los peques aprenden física, química y biología de forma divertida.",
    metaDescription: "Talleres de ciencia para niños. Experimentos, laboratorios y actividades científicas donde los peques aprenden jugando. Física, química y biología divertida.",
    keywords: ["experimentos para niños", "ciencia divertida", "talleres científicos", "laboratorio infantil"],
    faqs: [
      {
        question: "¿A qué edad pueden empezar los niños con talleres de ciencia?",
        answer: "Los talleres de ciencia están diseñados para diferentes edades. Los más pequeños (3-5 años) pueden participar en experimentos sensoriales y de observación, mientras que los mayores (6-10 años) realizan experimentos más complejos con hipótesis y conclusiones."
      },
      {
        question: "¿Son seguros los experimentos científicos para niños?",
        answer: "Absolutamente. Todos nuestros talleres utilizan materiales seguros y apropiados para cada edad. Los monitores están formados en seguridad infantil y supervisan cada actividad de cerca."
      },
      {
        question: "¿Qué materiales se necesitan para los talleres de ciencia?",
        answer: "Normalmente todos los materiales están incluidos en el taller. En algunos casos de actividades en casa, se utilizan materiales cotidianos como bicarbonato, vinagre, colorantes alimentarios, etc."
      }
    ]
  },
  {
    slug: "arte",
    name: "Arte y Manualidades",
    shortName: "Arte",
    icon: "🎨",
    color: "#F97316",
    description: "Talleres de arte y manualidades para niños. Pintura, escultura, collage y técnicas creativas para desarrollar la imaginación de los peques.",
    metaDescription: "Talleres de arte para niños. Manualidades, pintura, escultura y actividades creativas donde los peques desarrollan su imaginación y habilidades artísticas.",
    keywords: ["manualidades niños", "arte infantil", "pintura niños", "talleres creativos"],
    faqs: [
      {
        question: "¿Qué beneficios tiene el arte para el desarrollo infantil?",
        answer: "El arte estimula la creatividad, mejora la motricidad fina, desarrolla la expresión emocional y fomenta la autoestima. Los niños aprenden a resolver problemas de forma creativa y a comunicar sus ideas."
      },
      {
        question: "¿Los niños se ensucian mucho en los talleres de arte?",
        answer: "Recomendamos ropa cómoda que se pueda manchar. Proporcionamos delantales y los materiales que usamos son lavables y seguros para niños."
      },
      {
        question: "¿Pueden participar niños que nunca han hecho manualidades?",
        answer: "¡Por supuesto! No se requiere experiencia previa. Los talleres están diseñados para todos los niveles y los monitores guían a cada niño según su ritmo."
      }
    ]
  },
  {
    slug: "musica",
    name: "Música y Movimiento",
    shortName: "Música",
    icon: "🎵",
    color: "#8B5CF6",
    description: "Talleres de música para niños. Ritmos, instrumentos, canto y movimiento corporal para despertar el oído musical de los más pequeños.",
    metaDescription: "Clases de música para niños. Talleres de ritmo, instrumentos, canto y movimiento. Desarrolla el oído musical de tus peques de forma divertida.",
    keywords: ["música niños", "instrumentos infantiles", "ritmos niños", "educación musical"],
    faqs: [
      {
        question: "¿A qué edad es bueno empezar con la música?",
        answer: "Nunca es demasiado pronto. Los bebés desde los 6 meses pueden beneficiarse de la estimulación musical. Para clases estructuradas, a partir de 2-3 años los niños ya pueden participar activamente."
      },
      {
        question: "¿Los niños necesitan saber tocar algún instrumento?",
        answer: "No, nuestros talleres están diseñados para iniciación. Usamos instrumentos de percusión sencillos, el cuerpo como instrumento y juegos musicales adaptados a cada edad."
      },
      {
        question: "¿Qué beneficios tiene la música en el desarrollo infantil?",
        answer: "La música mejora la coordinación, desarrolla el lenguaje, potencia la memoria, fomenta la socialización y ayuda a regular las emociones. Además, los niños que hacen música suelen tener mejor rendimiento académico."
      }
    ]
  },
  {
    slug: "naturaleza",
    name: "Naturaleza y Aire Libre",
    shortName: "Naturaleza",
    icon: "🌿",
    color: "#22C55E",
    description: "Actividades en la naturaleza para niños. Excursiones, huertos, observación de animales y plantas para conectar a los peques con el medio ambiente.",
    metaDescription: "Actividades de naturaleza para niños. Excursiones, huertos, animales y plantas. Conecta a tus peques con el medio ambiente de forma divertida y educativa.",
    keywords: ["naturaleza niños", "actividades aire libre", "huerto infantil", "excursiones niños"],
    faqs: [
      {
        question: "¿Las actividades de naturaleza se cancelan si llueve?",
        answer: "Depende de la intensidad. Una lluvia ligera puede ser parte de la experiencia. En caso de mal tiempo severo, se reprograma la actividad o se ofrece una alternativa en interior."
      },
      {
        question: "¿Qué deben llevar los niños a las actividades al aire libre?",
        answer: "Ropa y calzado cómodo apropiado para la época del año, protección solar, agua y snack. Para algunas actividades específicas se indica material adicional."
      },
      {
        question: "¿Son seguras las excursiones a la naturaleza?",
        answer: "Todas las actividades están supervisadas por monitores formados. Las rutas están adaptadas a la edad de los participantes y contamos con protocolos de seguridad para cada tipo de actividad."
      }
    ]
  },
  {
    slug: "lectura",
    name: "Cuentacuentos y Lectura",
    shortName: "Lectura",
    icon: "📚",
    color: "#EAB308",
    description: "Cuentacuentos y clubs de lectura para niños. Historias mágicas, teatro y actividades literarias para fomentar el amor por los libros.",
    metaDescription: "Cuentacuentos para niños. Sesiones de lectura, teatro y actividades literarias. Fomenta el amor por los libros en tus peques con historias mágicas.",
    keywords: ["cuentacuentos", "lectura infantil", "club lectura niños", "historias niños"],
    faqs: [
      {
        question: "¿A partir de qué edad son los cuentacuentos?",
        answer: "Tenemos sesiones desde los 2 años, adaptadas con historias cortas, mucha expresividad y elementos visuales. Para mayores de 4 años, las historias son más elaboradas con participación activa."
      },
      {
        question: "¿Los cuentacuentos ayudan a que los niños lean más?",
        answer: "Sí, los cuentacuentos despiertan el interés por las historias y los libros. Los niños que participan regularmente desarrollan mejor vocabulario, comprensión y motivación por la lectura."
      },
      {
        question: "¿Pueden los padres quedarse durante el cuentacuentos?",
        answer: "Normalmente sí, especialmente para los más pequeños. Para niños mayores de 4 años, a veces es mejor que los padres se queden fuera para que los peques participen con más libertad."
      }
    ]
  },
  {
    slug: "experimentos",
    name: "Experimentos y Laboratorio",
    shortName: "Experimentos",
    icon: "🧪",
    color: "#EC4899",
    description: "Talleres de experimentos para niños. Laboratorio infantil con actividades prácticas de química, física y biología adaptadas a los más pequeños.",
    metaDescription: "Experimentos para niños. Talleres de laboratorio con química, física y biología divertida. Actividades científicas prácticas para peques curiosos.",
    keywords: ["experimentos niños", "laboratorio infantil", "química divertida", "física niños"],
    faqs: [
      {
        question: "¿Qué diferencia hay entre ciencia y experimentos?",
        answer: "Los talleres de experimentos son más prácticos y enfocados en 'hacer'. Cada sesión incluye varios experimentos que los niños realizan con sus propias manos, mientras que ciencia puede incluir también teoría y observación."
      },
      {
        question: "¿Los niños pueden repetir los experimentos en casa?",
        answer: "Muchos de nuestros experimentos están diseñados para poder hacerse en casa con materiales cotidianos. Proporcionamos instrucciones para que las familias puedan seguir experimentando."
      },
      {
        question: "¿Son aptos para niños con TDAH o alta sensibilidad?",
        answer: "Sí, de hecho los talleres prácticos suelen funcionar muy bien porque mantienen la atención activa. Los monitores están preparados para adaptar el ritmo según las necesidades de cada grupo."
      }
    ]
  },
  {
    slug: "cocina",
    name: "Cocina para Niños",
    shortName: "Cocina",
    icon: "👨‍🍳",
    color: "#F59E0B",
    description: "Talleres de cocina infantil. Recetas divertidas, repostería y alimentación saludable donde los peques aprenden cocinando.",
    metaDescription: "Talleres de cocina para niños. Recetas divertidas, repostería y alimentación saludable. Los peques aprenden a cocinar de forma segura y divertida.",
    keywords: ["cocina niños", "repostería infantil", "talleres cocina", "recetas para niños"],
    faqs: [
      {
        question: "¿Es segura la cocina para niños pequeños?",
        answer: "Nuestros talleres están diseñados con la seguridad como prioridad. Usamos utensilios adaptados, no hay contacto con fuego directo para los más pequeños y siempre hay supervisión adulta."
      },
      {
        question: "¿Se tienen en cuenta las alergias alimentarias?",
        answer: "Sí, siempre preguntamos por alergias e intolerancias al inscribirse. Adaptamos las recetas o proporcionamos alternativas para que todos puedan participar."
      },
      {
        question: "¿Los niños se llevan lo que cocinan a casa?",
        answer: "En la mayoría de talleres sí. Los niños se llevan sus creaciones en recipientes proporcionados. En algunos casos, especialmente en talleres de cocina salada, se degustan in situ."
      }
    ]
  },
  {
    slug: "deportes",
    name: "Deportes y Juegos",
    shortName: "Deportes",
    icon: "⚽",
    color: "#EF4444",
    description: "Actividades deportivas para niños. Juegos en equipo, psicomotricidad y deportes adaptados para que los peques se diviertan moviéndose.",
    metaDescription: "Actividades deportivas para niños. Juegos en equipo, psicomotricidad y deportes adaptados. Los peques se divierten mientras desarrollan habilidades motrices.",
    keywords: ["deportes niños", "juegos infantiles", "psicomotricidad", "actividades físicas niños"],
    faqs: [
      {
        question: "¿Las actividades deportivas son competitivas?",
        answer: "Nuestro enfoque es lúdico y cooperativo, no competitivo. El objetivo es que los niños disfruten del movimiento, desarrollen habilidades y aprendan a trabajar en equipo."
      },
      {
        question: "¿Qué equipación necesitan los niños?",
        answer: "Ropa deportiva cómoda, zapatillas adecuadas y agua. Para algunas actividades específicas (natación, patinaje...) se indica el material necesario."
      },
      {
        question: "¿Hay actividades para niños que no les gustan los deportes tradicionales?",
        answer: "Sí, ofrecemos alternativas como yoga infantil, danza creativa, circo, parkour suave y juegos cooperativos que no se parecen al deporte convencional."
      }
    ]
  },
];

// Helper function to get city by slug
export function getCityBySlug(slug: string) {
  return SEO_CITIES.find(city => city.slug === slug);
}

// Helper function to get category by slug
export function getCategoryBySlug(slug: string) {
  return SEO_CATEGORIES.find(cat => cat.slug === slug);
}

// Generate title for different page types
export function generateTitle(type: 'home' | 'city' | 'category' | 'cityCategory' | 'event', params?: { city?: string; category?: string; eventTitle?: string }) {
  const base = SEO_CONFIG.siteName;

  switch (type) {
    case 'home':
      return `${base} - Eventos y Actividades para Niños`;
    case 'city':
      const city = getCityBySlug(params?.city || '');
      return city
        ? `Eventos con Niños en ${city.name} | ${base}`
        : `${base} - Eventos para Niños`;
    case 'category':
      const category = getCategoryBySlug(params?.category || '');
      return category
        ? `${category.name} | Talleres para Niños | ${base}`
        : `${base} - Actividades para Niños`;
    case 'cityCategory':
      const cityCC = getCityBySlug(params?.city || '');
      const catCC = getCategoryBySlug(params?.category || '');
      if (cityCC && catCC) {
        return `${catCC.shortName} para Niños en ${cityCC.name} | ${base}`;
      }
      return `${base} - Actividades para Niños`;
    case 'event':
      return params?.eventTitle
        ? `${params.eventTitle} | ${base}`
        : `Evento para Niños | ${base}`;
    default:
      return base;
  }
}

// Generate meta description for different page types
export function generateDescription(type: 'home' | 'city' | 'category' | 'cityCategory' | 'event', params?: { city?: string; category?: string; eventDescription?: string }) {
  switch (type) {
    case 'home':
      return SEO_CONFIG.defaultDescription;
    case 'city':
      const city = getCityBySlug(params?.city || '');
      return city?.metaDescription || SEO_CONFIG.defaultDescription;
    case 'category':
      const category = getCategoryBySlug(params?.category || '');
      return category?.metaDescription || SEO_CONFIG.defaultDescription;
    case 'cityCategory':
      const cityCC = getCityBySlug(params?.city || '');
      const catCC = getCategoryBySlug(params?.category || '');
      if (cityCC && catCC) {
        return `Talleres de ${catCC.shortName.toLowerCase()} para niños en ${cityCC.name}. ${catCC.description.split('.')[0]}.`;
      }
      return SEO_CONFIG.defaultDescription;
    case 'event':
      return params?.eventDescription || SEO_CONFIG.defaultDescription;
    default:
      return SEO_CONFIG.defaultDescription;
  }
}
