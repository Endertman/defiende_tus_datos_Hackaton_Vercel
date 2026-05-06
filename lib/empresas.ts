export type Sector = "banco" | "retail" | "telco" | "fintech" | "plataforma" | "seguro_afp"
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
}

export const SECTOR_COLOR: Record<Sector, string> = {
  banco: "#1e40af",
  retail: "#7c3aed",
  telco: "#0891b2",
  fintech: "#059669",
  plataforma: "#d97706",
  seguro_afp: "#dc2626",
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
