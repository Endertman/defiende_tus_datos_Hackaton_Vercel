export type Sector = "banco" | "retail" | "telco" | "fintech" | "plataforma" | "seguro_afp" | "utilidad"
export type Riesgo = "alto" | "medio" | "bajo"

export interface EmpresaPerfil {
  id: string
  nombre: string
  sector: Sector
  emoji: string
  datos: string[]
  riesgo: Riesgo
  cmf: boolean
  arco: {
    canal: string
    url?: string
    plazo: string
    notas: string
  }
}

export const EMPRESAS: EmpresaPerfil[] = [
  // ── Bancos ──────────────────────────────────────────────────────────────────
  {
    id: "banco-estado",
    nombre: "Banco Estado",
    sector: "banco",
    emoji: "🏛️",
    datos: ["RUT", "nombre completo", "historial crediticio", "saldo cuentas", "domicilio", "correo", "teléfono"],
    riesgo: "alto",
    cmf: true,
    arco: {
      canal: "BancoEstado.cl → Atención al Cliente → Solicitud de datos",
      url: "https://www.bancoestado.cl",
      plazo: "30 días hábiles",
      notas: "Puedes pedir rectificación si apareces en DICOM por una deuda ya pagada (Art. 7 Ley 21.719).",
    },
  },
  {
    id: "banco-chile",
    nombre: "Banco de Chile",
    sector: "banco",
    emoji: "🏦",
    datos: ["RUT", "historial crediticio", "productos contratados", "correo", "teléfono", "dirección"],
    riesgo: "alto",
    cmf: true,
    arco: {
      canal: "Portal web o sucursal → Formulario ARCO",
      url: "https://www.bancochile.cl",
      plazo: "30 días",
      notas: "Si usaste su tarjeta de crédito, tienen historial de compras.",
    },
  },
  {
    id: "santander",
    nombre: "Santander Chile",
    sector: "banco",
    emoji: "🏦",
    datos: ["RUT", "nombre", "historial crediticio", "movimientos", "correo", "teléfono"],
    riesgo: "alto",
    cmf: true,
    arco: {
      canal: "Santander.cl → Contáctanos → Protección de datos",
      url: "https://www.santander.cl",
      plazo: "30 días",
      notas: "Tienen obligación de eliminar datos si cierras todos tus productos.",
    },
  },
  {
    id: "bci",
    nombre: "BCI",
    sector: "banco",
    emoji: "🏦",
    datos: ["RUT", "historial crédito", "perfil de riesgo", "correo", "datos de contacto"],
    riesgo: "alto",
    cmf: true,
    arco: {
      canal: "BCI.cl → Contacto → Solicitud protección de datos",
      plazo: "30 días",
      notas: "Solicita tu perfil de scoring si te han negado crédito.",
    },
  },
  // ── Retail / Fintech ────────────────────────────────────────────────────────
  {
    id: "cmr-falabella",
    nombre: "CMR Falabella",
    sector: "retail",
    emoji: "🛍️",
    datos: ["RUT", "historial de compras", "historial crediticio CMR", "correo", "teléfono", "dirección de despacho"],
    riesgo: "alto",
    cmf: true,
    arco: {
      canal: "Falabella.com → Mi cuenta → Datos personales / o CMR.cl",
      url: "https://www.cmr.cl",
      plazo: "30 días",
      notas: "Puedes pedir portabilidad de historial de pagos para cambiarte a otro banco.",
    },
  },
  {
    id: "ripley",
    nombre: "Banco Ripley",
    sector: "retail",
    emoji: "🛍️",
    datos: ["RUT", "historial compras", "perfil crediticio", "correo", "datos de contacto"],
    riesgo: "alto",
    cmf: true,
    arco: {
      canal: "Ripley.cl → Atención al cliente → Privacidad",
      plazo: "30 días",
      notas: "Si tienes o tuviste tarjeta Ripley, tienen historial completo.",
    },
  },
  {
    id: "walmart-chile",
    nombre: "Walmart Chile (Lider)",
    sector: "retail",
    emoji: "🛒",
    datos: ["RUT", "historial de compras Lider", "correo", "teléfono", "datos de despacho"],
    riesgo: "medio",
    cmf: false,
    arco: {
      canal: "Lider.cl → Atención al cliente",
      plazo: "30 días",
      notas: "Si usas tarjeta Lider o app, tienen historial detallado de compras.",
    },
  },
  {
    id: "sodimac",
    nombre: "Sodimac / Corona",
    sector: "retail",
    emoji: "🔨",
    datos: ["RUT", "historial compras", "correo", "teléfono"],
    riesgo: "bajo",
    cmf: false,
    arco: {
      canal: "Sodimac.cl → Contacto",
      plazo: "30 días",
      notas: "Datos vinculados a tu cuenta Sodimac y programa de fidelidad.",
    },
  },
  // ── Telcos ──────────────────────────────────────────────────────────────────
  {
    id: "entel",
    nombre: "Entel",
    sector: "telco",
    emoji: "📡",
    datos: ["RUT", "nombre", "dirección", "historial llamadas (metadata)", "correo", "datos de contrato"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "Entel.cl → Atención → Solicitud protección datos / SERNAC",
      plazo: "30 días",
      notas: "Las telcos retienen metadata de llamadas por ley. Puedes pedir qué conservan de ti.",
    },
  },
  {
    id: "movistar",
    nombre: "Movistar Chile",
    sector: "telco",
    emoji: "📱",
    datos: ["RUT", "nombre", "dirección", "metadata comunicaciones", "correo"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "Movistar.cl → Mi Movistar → Privacidad",
      plazo: "30 días",
      notas: "Si tienes plan pospago tienen dirección y datos de pago.",
    },
  },
  {
    id: "claro",
    nombre: "Claro Chile",
    sector: "telco",
    emoji: "📱",
    datos: ["RUT", "nombre", "dirección", "historial pagos", "correo"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "Claro.cl → Atención al cliente",
      plazo: "30 días",
      notas: "Puedes pedir portabilidad de tu número y datos asociados.",
    },
  },
  {
    id: "wom",
    nombre: "WOM",
    sector: "telco",
    emoji: "📱",
    datos: ["RUT", "nombre", "correo", "datos de contrato"],
    riesgo: "medio",
    cmf: false,
    arco: {
      canal: "WOM.cl → Soporte → Protección de datos",
      plazo: "30 días",
      notas: "WOM fue sancionado por SERNAC por prácticas de datos en 2023.",
    },
  },
  // ── Plataformas digitales ────────────────────────────────────────────────
  {
    id: "mercadolibre",
    nombre: "Mercado Libre",
    sector: "plataforma",
    emoji: "🟡",
    datos: ["RUT / DNI", "nombre", "correo", "teléfono", "dirección", "historial compras/ventas", "datos bancarios de pago"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "MercadoLibre.cl → Centro de privacidad → Solicitar mis datos",
      url: "https://www.mercadolibre.cl/privacidad",
      plazo: "30 días",
      notas: "Puedes exportar todos tus datos desde el centro de privacidad. Si eres vendedor, tienen datos fiscales.",
    },
  },
  {
    id: "uber",
    nombre: "Uber / Cornershop",
    sector: "plataforma",
    emoji: "🚗",
    datos: ["nombre", "correo", "teléfono", "historial de viajes/pedidos", "ubicaciones frecuentes", "datos de pago"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "Uber.com → Privacidad → Descargar mis datos",
      plazo: "30 días",
      notas: "Uber registra ubicaciones de inicio y fin de todos tus viajes. Puedes solicitar eliminación.",
    },
  },
  {
    id: "rappi",
    nombre: "Rappi",
    sector: "plataforma",
    emoji: "🛵",
    datos: ["nombre", "correo", "teléfono", "dirección", "historial pedidos", "datos de pago"],
    riesgo: "medio",
    cmf: false,
    arco: {
      canal: "App Rappi → Perfil → Privacidad / o soporte@rappi.com",
      plazo: "30 días",
      notas: "Comparte datos con restaurantes asociados. Puedes pedir la lista de terceros.",
    },
  },
  // ── Fintechs ────────────────────────────────────────────────────────────────
  {
    id: "tenpo",
    nombre: "Tenpo",
    sector: "fintech",
    emoji: "💳",
    datos: ["RUT", "nombre", "correo", "historial transacciones", "perfil de gasto"],
    riesgo: "alto",
    cmf: true,
    arco: {
      canal: "App Tenpo → Ajustes → Privacidad / soporte@tenpo.cl",
      plazo: "30 días",
      notas: "Como fintech regulada por CMF, debe responder solicitudes ARCO. Tienen perfil de scoring.",
    },
  },
  {
    id: "mach",
    nombre: "MACH (BCI)",
    sector: "fintech",
    emoji: "💳",
    datos: ["RUT", "nombre", "correo", "historial de pagos", "datos biométricos (selfie de verificación)"],
    riesgo: "alto",
    cmf: true,
    arco: {
      canal: "App MACH → Perfil → Privacidad",
      plazo: "30 días",
      notas: "MACH almacena tu selfie de verificación facial. Puedes pedir su eliminación.",
    },
  },
  // ── Seguros / AFP ────────────────────────────────────────────────────────────
  {
    id: "afp-modelo",
    nombre: "AFP Modelo",
    sector: "seguro_afp",
    emoji: "🏦",
    datos: ["RUT", "nombre", "historial laboral completo", "sueldo imponible", "empleadores anteriores", "dirección", "datos de salud (si aplica)"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "AFPModelo.cl → Mi AFP Modelo → Solicitud de datos personales",
      url: "https://www.afpmodelo.cl",
      plazo: "30 días",
      notas: "AFP Modelo es la AFP con más afiliados en Chile. Tiene tu historial laboral desde que cotizas. Puedes pedir acceso, rectificación o portabilidad.",
    },
  },
  {
    id: "afp-habitat",
    nombre: "AFP Habitat",
    sector: "seguro_afp",
    emoji: "🏠",
    datos: ["RUT", "nombre", "historial laboral", "sueldo imponible", "dirección", "datos de salud (si aplica)"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "Habitat.cl → Mi Habitat → Datos personales",
      plazo: "30 días",
      notas: "Las AFP tienen tu historial laboral completo. Datos de salud son categoría especial bajo Ley 21.719.",
    },
  },
  {
    id: "consalud",
    nombre: "Consalud (Isapre)",
    sector: "seguro_afp",
    emoji: "🏥",
    datos: ["RUT", "nombre", "historial médico", "cargas familiares", "sueldo", "datos de salud detallados"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "Consalud.cl → Atención virtual → Solicitud de datos",
      plazo: "30 días",
      notas: "Las isapres tienen la información más sensible. Los datos de salud son categoría especial bajo la ley.",
    },
  },
  // ── Bancos adicionales ──────────────────────────────────────────────────────
  {
    id: "scotiabank",
    nombre: "Scotiabank Chile",
    sector: "banco",
    emoji: "🏦",
    datos: ["RUT", "nombre", "historial crediticio", "productos contratados", "correo", "teléfono", "dirección"],
    riesgo: "alto",
    cmf: true,
    arco: {
      canal: "Scotiabank.cl → Atención al cliente → Protección de datos",
      url: "https://www.scotiabank.cl",
      plazo: "30 días",
      notas: "Absorbió BBVA Chile en 2018. Si tuviste cuenta BBVA, tus datos migraron a Scotiabank.",
    },
  },
  {
    id: "itau",
    nombre: "Itaú Chile",
    sector: "banco",
    emoji: "🏦",
    datos: ["RUT", "nombre", "historial crediticio", "movimientos", "correo", "teléfono", "dirección"],
    riesgo: "alto",
    cmf: true,
    arco: {
      canal: "Itau.cl → Contáctanos → Protección de datos personales",
      url: "https://www.itau.cl",
      plazo: "30 días",
      notas: "Absorbió CorpBanca en 2016. Si tuviste cuenta CorpBanca, tus datos migraron a Itaú.",
    },
  },
  {
    id: "banco-consorcio",
    nombre: "Banco Consorcio",
    sector: "banco",
    emoji: "🏦",
    datos: ["RUT", "nombre", "historial crediticio", "productos de ahorro/APV", "correo", "teléfono"],
    riesgo: "medio",
    cmf: true,
    arco: {
      canal: "BancoConsorcio.cl → Atención al cliente → Solicitud de datos",
      plazo: "30 días",
      notas: "Especializado en ahorro e inversión. Tienen datos de APV si cotizas voluntariamente con ellos.",
    },
  },
  {
    id: "coopeuch",
    nombre: "Coopeuch",
    sector: "fintech",
    emoji: "🤝",
    datos: ["RUT", "nombre", "historial crediticio", "saldo cuentas", "correo", "teléfono", "datos laborales"],
    riesgo: "medio",
    cmf: false,
    arco: {
      canal: "Coopeuch.cl → Atención al socio → Solicitud de datos personales",
      url: "https://www.coopeuch.cl",
      plazo: "30 días",
      notas: "Mayor cooperativa de crédito de Chile con +600.000 socios. Si fuiste socio, tienen historial crediticio completo.",
    },
  },
  // ── AFPs restantes ────────────────────────────────────────────────────────
  {
    id: "afp-capital",
    nombre: "AFP Capital",
    sector: "seguro_afp",
    emoji: "🏛️",
    datos: ["RUT", "nombre", "historial laboral completo", "sueldo imponible", "empleadores anteriores", "dirección", "datos de salud (si aplica)"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "AFPCapital.cl → Mi AFP Capital → Solicitud de datos personales",
      url: "https://www.afpcapital.cl",
      plazo: "30 días",
      notas: "Pertenece al grupo ING. Tienen tu historial laboral completo desde que empezaste a cotizar.",
    },
  },
  {
    id: "afp-cuprum",
    nombre: "AFP Cuprum",
    sector: "seguro_afp",
    emoji: "🏛️",
    datos: ["RUT", "nombre", "historial laboral completo", "sueldo imponible", "perfil de inversión", "dirección"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "Cuprum.cl → Mi Cuprum → Datos personales",
      url: "https://www.cuprum.cl",
      plazo: "30 días",
      notas: "AFP orientada a altos ingresos. Tienen perfil de inversión y datos de APV voluntario.",
    },
  },
  {
    id: "afp-planvital",
    nombre: "AFP PlanVital",
    sector: "seguro_afp",
    emoji: "🏛️",
    datos: ["RUT", "nombre", "historial laboral completo", "sueldo imponible", "empleadores anteriores", "dirección"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "PlanVital.cl → Mi PlanVital → Solicitud de datos personales",
      url: "https://www.planvital.cl",
      plazo: "30 días",
      notas: "Historial laboral completo desde que empezaste a cotizar.",
    },
  },
  {
    id: "afp-provida",
    nombre: "AFP ProVida",
    sector: "seguro_afp",
    emoji: "🏛️",
    datos: ["RUT", "nombre", "historial laboral completo", "sueldo imponible", "empleadores anteriores", "dirección", "datos de beneficiarios"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "ProVida.cl → Mi ProVida → Datos personales",
      url: "https://www.provida.cl",
      plazo: "30 días",
      notas: "Administrada por MetLife. Tienen datos de beneficiarios y causahabientes además del historial laboral.",
    },
  },
  // ── Isapres ───────────────────────────────────────────────────────────────
  {
    id: "colmena",
    nombre: "Colmena Golden Cross",
    sector: "seguro_afp",
    emoji: "🏥",
    datos: ["RUT", "nombre", "historial médico completo", "cargas familiares", "sueldo", "prestaciones utilizadas"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "Colmena.cl → Atención digital → Solicitud de datos personales",
      url: "https://www.colmena.cl",
      plazo: "30 días",
      notas: "Mayor isapre de Chile por número de afiliados. Los datos de salud son categoría especial bajo Ley 21.719.",
    },
  },
  {
    id: "cruz-blanca",
    nombre: "Cruz Blanca (Bupa Chile)",
    sector: "seguro_afp",
    emoji: "🏥",
    datos: ["RUT", "nombre", "historial médico", "cargas familiares", "datos de salud detallados", "sueldo"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "CruzBlanca.cl → Mi Cruz Blanca → Protección de datos",
      url: "https://www.cruzblanca.cl",
      plazo: "30 días",
      notas: "Filial de Bupa internacional. Puedes pedir portabilidad de historial médico entre isapres (Art. 13 Ley 21.719).",
    },
  },
  {
    id: "banmedica",
    nombre: "Banmédica",
    sector: "seguro_afp",
    emoji: "🏥",
    datos: ["RUT", "nombre", "historial médico", "prestaciones", "cargas familiares", "sueldo"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "Banmedica.cl → Sucursal virtual → Solicitud de datos",
      url: "https://www.banmedica.cl",
      plazo: "30 días",
      notas: "Datos de salud requieren consentimiento expreso para ser compartidos con terceros (Art. 16 Ley 21.719).",
    },
  },
  {
    id: "fonasa",
    nombre: "Fonasa",
    sector: "seguro_afp",
    emoji: "🏛️",
    datos: ["RUT", "nombre", "tramo de ingreso", "historial de atenciones GES/AUGE", "beneficiarios", "datos de salud"],
    riesgo: "medio",
    cmf: false,
    arco: {
      canal: "Fonasa.cl → Oficina Virtual → Solicitud de datos personales",
      url: "https://www.fonasa.cl",
      plazo: "30 días",
      notas: "Cubre al 75% de los chilenos. Al ser servicio público, aplica también Ley 20.285 de transparencia activa.",
    },
  },
  // ── Seguros / Mutuales ────────────────────────────────────────────────────
  {
    id: "metlife",
    nombre: "MetLife Chile",
    sector: "seguro_afp",
    emoji: "🛡️",
    datos: ["RUT", "nombre", "edad", "historial de salud declarado", "beneficiarios", "datos financieros"],
    riesgo: "medio",
    cmf: false,
    arco: {
      canal: "MetLife.cl → Atención al cliente → Solicitud ARCO",
      url: "https://www.metlife.cl",
      plazo: "30 días",
      notas: "Si tienes o tuviste seguro de vida o APV con MetLife, tienen tu declaración de salud.",
    },
  },
  {
    id: "mutual-seguridad",
    nombre: "Mutual de Seguridad CChC",
    sector: "seguro_afp",
    emoji: "🦺",
    datos: ["RUT", "nombre", "historial de accidentes laborales", "diagnósticos", "empleador", "datos de salud ocupacional"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "MutualdeSeguridad.cl → Solicitudes → Protección de datos",
      url: "https://www.mutual.cl",
      plazo: "30 días",
      notas: "Si sufriste un accidente del trabajo, tienen datos médicos muy sensibles. Categoría especial bajo Ley 21.719.",
    },
  },
  // ── Retail adicional ──────────────────────────────────────────────────────
  {
    id: "cencosud",
    nombre: "Cencosud (Paris / Jumbo / Easy)",
    sector: "retail",
    emoji: "🛍️",
    datos: ["RUT", "nombre", "historial compras Jumbo/Easy", "historial crediticio Paris", "correo", "teléfono", "dirección despacho"],
    riesgo: "alto",
    cmf: true,
    arco: {
      canal: "Paris.cl → Mi Cuenta → Privacidad / Formulario ARCO",
      url: "https://www.paris.cl",
      plazo: "30 días",
      notas: "Si tienes Tarjeta Paris, Cencosud tiene historial crediticio completo además de compras en Jumbo y Easy.",
    },
  },
  {
    id: "la-polar",
    nombre: "La Polar",
    sector: "retail",
    emoji: "🛍️",
    datos: ["RUT", "nombre", "historial crediticio", "historial compras", "correo", "teléfono"],
    riesgo: "alto",
    cmf: true,
    arco: {
      canal: "LaPolar.cl → Atención al cliente → Datos personales",
      url: "https://www.lapolar.cl",
      plazo: "30 días",
      notas: "La Polar fue sancionada en 2011 por repactaciones unilaterales. Si tuviste deuda, verifica tu historial.",
    },
  },
  // ── Plataformas adicionales ───────────────────────────────────────────────
  {
    id: "pedidosya",
    nombre: "PedidosYa",
    sector: "plataforma",
    emoji: "🛵",
    datos: ["nombre", "correo", "teléfono", "dirección habitual", "historial pedidos", "datos de pago", "ubicación GPS"],
    riesgo: "medio",
    cmf: false,
    arco: {
      canal: "PedidosYa.cl → Perfil → Privacidad",
      plazo: "30 días",
      notas: "Registra tu ubicación GPS en cada pedido y comparte datos con restaurantes y repartidores.",
    },
  },
  {
    id: "amazon-chile",
    nombre: "Amazon Chile",
    sector: "plataforma",
    emoji: "📦",
    datos: ["nombre", "correo", "teléfono", "dirección", "historial compras", "datos de pago", "historial de búsquedas"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "Amazon.com/privacyprefs → Solicitar mis datos",
      url: "https://www.amazon.com/privacyprefs",
      plazo: "30 días",
      notas: "Puedes descargar historial completo desde amazon.com/privacyprefs. Incluye búsquedas, compras y reseñas.",
    },
  },
  {
    id: "airbnb",
    nombre: "Airbnb",
    sector: "plataforma",
    emoji: "🏠",
    datos: ["nombre", "correo", "teléfono", "historial hospedajes/arriendos", "datos de pago", "foto de identidad"],
    riesgo: "medio",
    cmf: false,
    arco: {
      canal: "Airbnb.com → Privacidad → Descargar datos personales",
      url: "https://www.airbnb.com/privacy",
      plazo: "30 días",
      notas: "Para verificación almacenan fotocopia de tu cédula o pasaporte. Puedes pedir eliminación.",
    },
  },
  {
    id: "netflix",
    nombre: "Netflix",
    sector: "plataforma",
    emoji: "🎬",
    datos: ["nombre", "correo", "historial de visualización", "datos de pago", "perfil de gustos"],
    riesgo: "bajo",
    cmf: false,
    arco: {
      canal: "Netflix.com → Cuenta → Privacidad → Descargar mis datos",
      url: "https://www.netflix.com/account/getmyinfo",
      plazo: "30 días",
      notas: "Tienen perfil detallado de tus gustos y hábitos de consumo de contenido.",
    },
  },
  // ── Servicios básicos ──────────────────────────────────────────────────────
  {
    id: "enel",
    nombre: "Enel Chile",
    sector: "utilidad",
    emoji: "⚡",
    datos: ["RUT", "nombre", "dirección suministro", "historial de consumo eléctrico", "correo", "teléfono", "datos de pago"],
    riesgo: "bajo",
    cmf: false,
    arco: {
      canal: "Enel.cl → Atención al cliente → Protección de datos",
      url: "https://www.enel.cl",
      plazo: "30 días",
      notas: "El historial de consumo puede revelar patrones de vida en el hogar. Opera en RM y otras regiones.",
    },
  },
  {
    id: "aguas-andinas",
    nombre: "Aguas Andinas",
    sector: "utilidad",
    emoji: "💧",
    datos: ["RUT", "nombre", "dirección", "historial de consumo de agua", "correo", "datos de pago"],
    riesgo: "bajo",
    cmf: false,
    arco: {
      canal: "AguasAndinas.cl → Oficina Virtual → Protección de datos",
      url: "https://www.aguasandinas.cl",
      plazo: "30 días",
      notas: "Opera en la Región Metropolitana. Si vives en otra región, busca tu sanitaria local.",
    },
  },
  // ── Fintech / Pagos adicionales ───────────────────────────────────────────
  {
    id: "transbank",
    nombre: "Transbank",
    sector: "fintech",
    emoji: "💳",
    datos: ["RUT", "nombre", "historial de transacciones RedCompra", "comercios visitados", "montos y fechas"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "Transbank.cl → Contacto → Solicitud ARCO",
      url: "https://www.transbank.cl",
      plazo: "30 días",
      notas: "Procesa el ~70% de las transacciones con tarjeta en Chile. Tienen mapa completo de tus hábitos de compra.",
    },
  },
  {
    id: "fintual",
    nombre: "Fintual",
    sector: "fintech",
    emoji: "📈",
    datos: ["RUT", "nombre", "correo", "perfil de riesgo inversor", "patrimonio declarado", "historial de inversiones"],
    riesgo: "medio",
    cmf: true,
    arco: {
      canal: "Fintual.com → Configuración → Privacidad y datos",
      url: "https://fintual.com",
      plazo: "30 días",
      notas: "CMF-regulada. Tienen declaración de patrimonio y perfil de riesgo. Puedes pedir portabilidad del historial.",
    },
  },
  {
    id: "khipu",
    nombre: "Khipu",
    sector: "fintech",
    emoji: "🔗",
    datos: ["RUT", "nombre", "correo", "cuentas bancarias vinculadas", "historial de pagos"],
    riesgo: "medio",
    cmf: false,
    arco: {
      canal: "Khipu.com → Soporte → Solicitud de datos personales",
      url: "https://khipu.com",
      plazo: "30 días",
      notas: "Actúa como intermediario de pago. Tiene acceso temporal a credenciales bancarias para procesar pagos.",
    },
  },
  {
    id: "equifax-dicom",
    nombre: "Equifax / DICOM",
    sector: "fintech",
    emoji: "📊",
    datos: ["RUT", "nombre", "historial crediticio completo", "deudas vigentes y pagadas", "scoring crediticio", "consultas de crédito"],
    riesgo: "alto",
    cmf: false,
    arco: {
      canal: "Equifax.cl → Consulta tu historial / Solicitud de rectificación",
      url: "https://www.equifax.cl",
      plazo: "30 días",
      notas: "Puedes obtener un informe gratuito. Si hay errores, tienes derecho a rectificación inmediata (Art. 17 Ley 19.628).",
    },
  },
]

export const SECTOR_LABEL: Record<Sector, string> = {
  banco: "Banco",
  retail: "Retail / Tarjeta",
  telco: "Telecomunicaciones",
  fintech: "Fintech",
  plataforma: "Plataforma digital",
  seguro_afp: "Seguro / AFP",
  utilidad: "Servicios básicos",
}

export const SECTOR_COLOR: Record<Sector, string> = {
  banco: "#1e40af",
  retail: "#7c3aed",
  telco: "#0891b2",
  fintech: "#059669",
  plataforma: "#d97706",
  seguro_afp: "#dc2626",
  utilidad: "#64748b",
}

export const RIESGO_COLOR: Record<Riesgo, string> = {
  alto: "#dc2626",
  medio: "#d97706",
  bajo: "#16a34a",
}

// ── RUT validation ───────────────────────────────────────────────────────────

export function validateRut(raw: string): { valid: boolean; formatted: string } {
  const clean = raw.replace(/[.\s]/g, "").toUpperCase()
  const match = clean.match(/^(\d{7,8})-?([0-9K])$/)
  if (!match) return { valid: false, formatted: raw }

  const digits = match[1]
  const verifier = match[2]

  let sum = 0
  let mul = 2
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const rem = 11 - (sum % 11)
  const expected = rem === 11 ? "0" : rem === 10 ? "K" : String(rem)

  const valid = verifier === expected
  const num = parseInt(digits).toLocaleString("es-CL")
  return { valid, formatted: `${num}-${verifier}` }
}
