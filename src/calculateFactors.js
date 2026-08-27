export const FACTORS = [
  { key: 'genetic', name: 'Genetic Inheritance', min: 9.333, max: 10.777 },
  { key: 'constitutional', name: 'Constitutional Vitality', min: 8.111, max: 9.111 },
  { key: 'mental', name: 'Mental Patterns', min: 6.111, max: 7.111 },
  { key: 'intellectual', name: 'Intellectual Capacity', min: 6.333, max: 6.999 },
  { key: 'emotional', name: 'Emotional Foundation', min: 7.111, max: 7.999 },
  { key: 'spiritual', name: 'Spiritual Lineage', min: 5.011, max: 6.011 },
  { key: 'soul', name: 'Soul Connections', min: 5.111, max: 6.222 },
]

const GRAND_TOTAL = 100
const ROUND_TO = 3

function hashString(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return hash >>> 0
}

function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function round(value, decimals = ROUND_TO) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function balanceToTarget(items, target, passes = 6) {
  const values = items.map((item) => item.value)

  for (let pass = 0; pass < passes; pass++) {
    const total = values.reduce((sum, v) => sum + v, 0)
    const delta = target - total
    if (Math.abs(delta) < 1e-9) break

    const headroom = items.map((item, i) =>
      delta > 0 ? Math.max(item.max - values[i], 0) : Math.max(values[i] - item.min, 0)
    )
    const totalHeadroom = headroom.reduce((sum, h) => sum + h, 0)
    if (totalHeadroom < 1e-9) break

    for (let i = 0; i < items.length; i++) {
      values[i] += (delta * headroom[i]) / totalHeadroom
      values[i] = Math.min(items[i].max, Math.max(items[i].min, values[i]))
    }
  }

  return values
}


export function calculateFactors(dobString) {
  if (!dobString) {
    throw new Error('A date of birth is required.')
  }

  const dob = new Date(`${dobString}T00:00:00`)
  if (Number.isNaN(dob.getTime())) {
    throw new Error('That date of birth is not valid.')
  }

  const dayOfMonth = dob.getDate()
  const dominantParent = dayOfMonth % 2 === 1 ? 'mother' : 'father'

  const rng = mulberry32(hashString(dobString))

  const rawRows = FACTORS.map((factor) => {
    const a = factor.min + rng() * (factor.max - factor.min)
    const b = factor.min + rng() * (factor.max - factor.min)
    const higher = Math.max(a, b)
    const lower = Math.min(a, b)

    return {
      ...factor,
      mother: dominantParent === 'mother' ? higher : lower,
      father: dominantParent === 'father' ? higher : lower,
    }
  })

  const items = rawRows.flatMap((row) => [
    { min: row.min, max: row.max, value: row.mother },
    { min: row.min, max: row.max, value: row.father },
  ])
  const balanced = balanceToTarget(items, GRAND_TOTAL)

  const rows = rawRows.map((row, i) => {
    const mother = balanced[i * 2]
    const father = balanced[i * 2 + 1]
    return {
      key: row.key,
      name: row.name,
      min: row.min,
      max: row.max,
      mother,
      father,
      total: mother + father,
    }
  })

  const roundedRows = rows.map((row) => ({
    key: row.key,
    name: row.name,
    min: row.min,
    max: row.max,
    mother: round(row.mother),
    father: round(row.father),
  }))

  const rawTotal = round(
    roundedRows.reduce((sum, r) => sum + r.mother + r.father, 0)
  )
  const residual = round(GRAND_TOTAL - rawTotal)
  if (Math.abs(residual) > 0) {
    const last = roundedRows[roundedRows.length - 1]
    const field = dominantParent
    last[field] = round(last[field] + residual)
  }

  roundedRows.forEach((row) => {
    row.total = round(row.mother + row.father)
  })

  const motherTotal = round(roundedRows.reduce((s, r) => s + r.mother, 0))
  const fatherTotal = round(roundedRows.reduce((s, r) => s + r.father, 0))

  return {
    dob: dobString,
    dayOfMonth,
    dominantParent,
    rows: roundedRows,
    motherTotal,
    fatherTotal,
    grandTotal: round(motherTotal + fatherTotal),
  }
}
