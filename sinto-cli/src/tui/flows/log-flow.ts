/**
 * MODULE: Log Flow
 * Interactive symptom logging flow: prompts BBT, menstrual data or mucus/mood/symptoms, calls POST /cycles/:id/logs.
 *
 * Endpoints: POST /cycles/:id/logs — save symptom log
 *
 * Exports: logFlow
 * Depends on: @clack/prompts, picocolors, lib/api, lib/credentials, lib/fmt
 */
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { apiPost } from '../../lib/api'
import { requireAuth, getActiveCycleId } from '../../lib/credentials'
import { handleError, today } from '../../lib/fmt'

export async function logFlow() {
  const creds = requireAuth()
  const cycleId = getActiveCycleId(creds)

  p.intro(pc.bold('Registrar síntomas de hoy'))

  const base = await p.group(
    {
      date: () =>
        p.text({
          message: 'Fecha',
          initialValue: today(),
          validate: (v) => (!/^\d{4}-\d{2}-\d{2}$/.test(v) ? 'Formato: YYYY-MM-DD' : undefined),
        }),
      temperature: () =>
        p.text({
          message: 'Temperatura basal (°C) — Enter para omitir',
          placeholder: '36.5',
          validate: (v) => {
            if (!v) return undefined
            const n = parseFloat(v)
            if (isNaN(n) || n < 35 || n > 42) return 'Debe estar entre 35.0 y 42.0'
          },
        }),
      isMenstruating: () =>
        p.confirm({ message: '¿Estás menstruando?' }),
    },
    { onCancel: () => { p.cancel('Cancelado.'); return null } },
  )

  if (p.isCancel(base) || base === null) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = {
    date: base.date,
    isMenstruating: base.isMenstruating,
  }

  if (base.temperature) body.temperature = parseFloat(base.temperature as string)

  if (base.isMenstruating) {
    const menstrual = await p.group(
      {
        flowLevel: () =>
          p.select({
            message: 'Nivel de flujo',
            options: [
              { value: 'SPOTTING', label: 'Manchado' },
              { value: 'LIGHT', label: 'Leve' },
              { value: 'MEDIUM', label: 'Moderado' },
              { value: 'HEAVY', label: 'Abundante' },
            ],
          }),
        color: () =>
          p.select({
            message: 'Color',
            options: [
              { value: 'BRIGHT_RED', label: 'Rojo brillante' },
              { value: 'DARK_RED', label: 'Rojo oscuro' },
              { value: 'PINK', label: 'Rosa' },
              { value: 'BROWN', label: 'Café/marrón' },
              { value: 'BLACK', label: 'Negro' },
            ],
          }),
        consistency: () =>
          p.select({
            message: 'Consistencia',
            options: [
              { value: 'WATERY', label: 'Acuosa' },
              { value: 'NORMAL', label: 'Normal' },
              { value: 'CLOTTY', label: 'Con coágulos' },
            ],
          }),
      },
      { onCancel: () => { p.cancel('Cancelado.'); return null } },
    )
    if (p.isCancel(menstrual) || menstrual === null) return
    body.menstrualLog = menstrual
  } else {
    const symptom = await p.group(
      {
        mood: () =>
          p.select({
            message: 'Estado de ánimo',
            options: [
              { value: '', label: 'Omitir' },
              { value: 'HAPPY', label: 'Feliz' },
              { value: 'CALM', label: 'Tranquila' },
              { value: 'ANXIOUS', label: 'Ansiosa' },
              { value: 'IRRITABLE', label: 'Irritable' },
              { value: 'SAD', label: 'Triste' },
              { value: 'ENERGETIC', label: 'Con energía' },
              { value: 'TIRED', label: 'Cansada' },
            ],
          }),
        mucusType: () =>
          p.select({
            message: 'Tipo de mucosa',
            options: [
              { value: '', label: 'Omitir' },
              { value: 'DRY', label: 'Seca' },
              { value: 'STICKY', label: 'Pegajosa' },
              { value: 'CREAMY', label: 'Cremosa' },
              { value: 'EGG_WHITE', label: 'Clara de huevo' },
              { value: 'WATERY', label: 'Acuosa' },
            ],
          }),
        mucusQuality: () =>
          p.select({
            message: 'Calidad de mucosa',
            options: [
              { value: 'NONE', label: 'Ninguna' },
              { value: 'LOW', label: 'Baja' },
              { value: 'MEDIUM', label: 'Media' },
              { value: 'HIGH', label: 'Alta' },
              { value: 'PEAK', label: 'Pico' },
            ],
          }),
        symptoms: () =>
          p.multiselect({
            message: 'Síntomas (spacebar para seleccionar)',
            options: [
              { value: 'NAUSEA', label: 'Náuseas' },
              { value: 'BREAST_PAIN', label: 'Dolor de senos' },
              { value: 'HEADACHE', label: 'Dolor de cabeza' },
              { value: 'CRAMPS', label: 'Cólicos' },
              { value: 'BLOATING', label: 'Hinchazón' },
              { value: 'BACKACHE', label: 'Dolor de espalda' },
              { value: 'FATIGUE', label: 'Fatiga' },
              { value: 'ACNE', label: 'Acné' },
              { value: 'INSOMNIA', label: 'Insomnio' },
            ],
            required: false,
          }),
      },
      { onCancel: () => { p.cancel('Cancelado.'); return null } },
    )
    if (p.isCancel(symptom) || symptom === null) return

    body.symptomLog = {
      mood: symptom.mood || undefined,
      mucusType: symptom.mucusType || undefined,
      mucusQuality: symptom.mucusQuality || undefined,
      symptoms: symptom.symptoms as string[],
    }
  }

  const spinner = p.spinner()
  spinner.start('Guardando...')
  try {
    await apiPost(`/cycles/${cycleId}/logs`, body, creds.accessToken)
    spinner.stop('Registro guardado.')
    p.outro(pc.green(`✓ Síntomas del ${body.date} registrados`))
  } catch (err) {
    spinner.stop('Error')
    handleError(err, 'guardar registro')
  }
}
