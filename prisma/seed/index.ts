import 'dotenv/config'
import { PrismaClient, Phase, ContentCategory } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const phaseContent: Array<{
  phase: Phase
  category: ContentCategory
  title: string
  body: string
}> = [
  // ─── FASE MENSTRUAL ──────────────────────────────────────────────────────
  {
    phase: Phase.MENSTRUAL,
    category: ContentCategory.GENERAL,
    title: 'Qué es la fase menstrual',
    body: 'La fase menstrual inicia el primer día de sangrado y dura entre 3 y 7 días. El útero expulsa su revestimiento porque no hubo fertilización. Los niveles de estrógeno y progesterona están en su punto más bajo.',
  },
  {
    phase: Phase.MENSTRUAL,
    category: ContentCategory.EXERCISE,
    title: 'Ejercicio recomendado',
    body: 'Opta por actividad suave: yoga restaurativo, caminatas cortas, estiramientos o pilates de bajo impacto. Evita entrenamientos de alta intensidad los primeros días. Escucha tu cuerpo — el descanso también es válido.',
  },
  {
    phase: Phase.MENSTRUAL,
    category: ContentCategory.NUTRITION,
    title: 'Alimentación en la menstruación',
    body: 'Prioriza alimentos ricos en hierro (legumbres, espinacas, carnes magras) para compensar la pérdida de sangre. Consume vitamina C para mejorar la absorción del hierro. Reduce la sal para minimizar la hinchazón. Magnesio (chocolate negro, almendras) ayuda con los cólicos. Mantente bien hidratada.',
  },
  {
    phase: Phase.MENSTRUAL,
    category: ContentCategory.TIPS,
    title: 'Consejos para esta fase',
    body: 'Aplica calor local en el abdomen para aliviar cólicos. Descansa más de lo habitual. Usa ropa cómoda. Lleva un registro de la intensidad del flujo, color y consistencia — esta información es clave para el método sintotérmico. Aprovecha para reflexionar y planear el ciclo.',
  },
  {
    phase: Phase.MENSTRUAL,
    category: ContentCategory.DANGERS,
    title: 'Señales de alerta',
    body: 'Consulta a un médico si: el sangrado es tan abundante que cambias toallas cada hora durante más de 2 horas, los cólicos son incapacitantes, el sangrado dura más de 7 días, hay coágulos muy grandes (mayores a 2.5 cm), o si experimentas fiebre con el sangrado.',
  },

  // ─── FASE FOLICULAR ──────────────────────────────────────────────────────
  {
    phase: Phase.FOLLICULAR,
    category: ContentCategory.GENERAL,
    title: 'Qué es la fase folicular',
    body: 'Comienza el primer día del ciclo (coincide con la menstruación) y termina con la ovulación. Los folículos del ovario maduran bajo la influencia del estrógeno, que sube progresivamente. Te sentirás con más energía y claridad mental a medida que avanza esta fase.',
  },
  {
    phase: Phase.FOLLICULAR,
    category: ContentCategory.EXERCISE,
    title: 'Ejercicio en la fase folicular',
    body: 'Tu energía aumenta — aprovéchala con cardio moderado, entrenamiento de fuerza, baile o deportes en grupo. Es un buen momento para aprender nuevas rutinas o aumentar la intensidad del ejercicio. Tu recuperación muscular es más rápida en esta fase.',
  },
  {
    phase: Phase.FOLLICULAR,
    category: ContentCategory.NUTRITION,
    title: 'Alimentación en la fase folicular',
    body: 'Favorece alimentos fermentados (yogur, kéfir, kimchi) para apoyar el microbioma. Incluye proteínas magras, verduras crucíferas (brócoli, coliflor) que ayudan a metabolizar el estrógeno, y carbohidratos complejos para energía sostenida. Semillas de linaza y de calabaza apoyan el balance hormonal (seed cycling).',
  },
  {
    phase: Phase.FOLLICULAR,
    category: ContentCategory.TIPS,
    title: 'Consejos para esta fase',
    body: 'Aprovecha tu mayor claridad mental para planear proyectos, tomar decisiones y aprender cosas nuevas. Es la fase ideal para iniciar hábitos. Observa y registra la mucosa cervical: en esta fase comenzará siendo seca o pegajosa y evolucionará hacia cremosa conforme se acerca la ovulación.',
  },
  {
    phase: Phase.FOLLICULAR,
    category: ContentCategory.DANGERS,
    title: 'Señales de alerta',
    body: 'Ciclos muy cortos (menos de 21 días) pueden indicar fase folicular insuficiente. Si observas sangrado intermenstrual, sensación de bulto en el abdomen o ausencia de cambios en la mucosa durante múltiples ciclos, consulta a tu ginecólogo.',
  },

  // ─── FASE OVULATORIA ─────────────────────────────────────────────────────
  {
    phase: Phase.OVULATORY,
    category: ContentCategory.GENERAL,
    title: 'Qué es la fase ovulatoria',
    body: 'Dura aproximadamente 3 días alrededor de la ovulación. Un pico de LH desencadena la liberación del óvulo desde el folículo dominante. Es el momento de máxima fertilidad. El estrógeno alcanza su pico y hay un breve aumento de testosterona que incrementa el deseo sexual y la confianza.',
  },
  {
    phase: Phase.OVULATORY,
    category: ContentCategory.EXERCISE,
    title: 'Ejercicio en la ovulación',
    body: 'Es tu punto álgido de fuerza y resistencia. Ideal para entrenamientos de alta intensidad (HIIT), competencias deportivas, crossfit o actividades sociales activas. Tu coordinación y fuerza muscular están en su mejor momento. Cuidado con el riesgo de lesiones de ligamentos — el estrógeno alto aumenta la laxitud articular.',
  },
  {
    phase: Phase.OVULATORY,
    category: ContentCategory.NUTRITION,
    title: 'Alimentación en la ovulación',
    body: 'Incluye antioxidantes (frutas de colores, frutos rojos, verduras de hoja verde) para apoyar la liberación del óvulo. Zinc (semillas de calabaza, mariscos) favorece la ovulación. Fibra alta para metabolizar el exceso de estrógeno. Hidratación abundante. Reduce el alcohol y la cafeína.',
  },
  {
    phase: Phase.OVULATORY,
    category: ContentCategory.TIPS,
    title: 'Identificar la ovulación (método sintotérmico)',
    body: 'Señales clave: mucosa cervical tipo clara de huevo (transparente, elástica, resbaladiza), temperatura basal sube 0.2°C o más y se mantiene elevada al menos 3 días, posible dolor leve en un lado del abdomen (Mittelschmerz). Registra todos los signos para mayor precisión en la predicción.',
  },
  {
    phase: Phase.OVULATORY,
    category: ContentCategory.DANGERS,
    title: 'Señales de alerta',
    body: 'Dolor ovulatorio muy intenso (diferente al leve Mittelschmerz) puede indicar endometriosis o quistes. Ausencia de cambios en la mucosa o temperatura durante varios ciclos puede indicar anovulación. Si sospechas anovulación crónica, consulta a un especialista.',
  },

  // ─── FASE LÚTEA ──────────────────────────────────────────────────────────
  {
    phase: Phase.LUTEAL,
    category: ContentCategory.GENERAL,
    title: 'Qué es la fase lútea',
    body: 'Después de la ovulación, el folículo vacío se convierte en cuerpo lúteo y produce progesterona. Esta hormona eleva la temperatura basal, engrosa el endometrio y puede causar síntomas premenstruales. Dura típicamente 12-16 días. Si no hay embarazo, el cuerpo lúteo se disuelve y comienza la menstruación.',
  },
  {
    phase: Phase.LUTEAL,
    category: ContentCategory.EXERCISE,
    title: 'Ejercicio en la fase lútea',
    body: 'La primera mitad permite actividad moderada-alta. En la segunda mitad, cuando suelen aparecer síntomas SPM, prefiere yoga, pilates, caminatas y natación. El ejercicio aeróbico moderado ayuda a reducir la ansiedad y la retención de líquidos. No te exijas demasiado si te sientes fatigada.',
  },
  {
    phase: Phase.LUTEAL,
    category: ContentCategory.NUTRITION,
    title: 'Alimentación en la fase lútea',
    body: 'Magnesio (chocolate negro, espinacas, semillas) reduce los síntomas del SPM. Vitamina B6 (plátano, pollo, garbanzos) apoya el estado de ánimo. Reduce sal, azúcar y cafeína para minimizar hinchazón e irritabilidad. Come cada 3-4 horas para evitar hipoglucemia. Calcio (lácteos, sardinas, tofu) ayuda con los cambios de humor.',
  },
  {
    phase: Phase.LUTEAL,
    category: ContentCategory.TIPS,
    title: 'Manejo del SPM',
    body: 'Registra tus síntomas para identificar patrones. Prioriza el sueño (la progesterona puede generar somnolencia). Practica técnicas de manejo del estrés: meditación, respiración, journaling. La temperatura basal elevada y sostenida confirma que sí ovulaste. Si la temperatura no sube, el ciclo fue anovulatorio.',
  },
  {
    phase: Phase.LUTEAL,
    category: ContentCategory.DANGERS,
    title: 'Señales de alerta',
    body: 'El TDPM (Trastorno Disfórico Premenstrual) es un SPM severo que requiere atención médica. Señales: depresión intensa, ansiedad o ira que interfieren con tu vida diaria. Fase lútea corta (menos de 10 días) puede indicar insuficiencia lútea — importante si buscas embarazo. Consulta a tu médico si los síntomas son incapacitantes.',
  },
]

async function main() {
  console.log('Seeding phase content...')

  for (const content of phaseContent) {
    await prisma.phaseContent.upsert({
      where: {
        phase_category_title_locale: {
          phase: content.phase,
          category: content.category,
          title: content.title,
          locale: 'es',
        },
      },
      update: { body: content.body },
      create: { ...content, locale: 'es' },
    })
  }

  console.log(`✓ Seeded ${phaseContent.length} phase content entries`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
