import { useState } from 'react'
import { calculateFactors } from './calculateFactors.js'

function formatDate(dobString) {
  const d = new Date(`${dobString}T00:00:00`)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function FactorBar({ row }) {
  const motherPct = (row.mother / row.total) * 100
  const fatherPct = 100 - motherPct

  return (
    <div className="factor-row">
      <div className="factor-row__head">
        <span className="factor-row__name">{row.name}</span>
        <span className="factor-row__range">
          band {row.min.toFixed(3)}–{row.max.toFixed(3)}
        </span>
      </div>
      <div className="factor-row__bar" role="img" aria-label={`${row.name}: mother ${row.mother}, father ${row.father}`}>
        <div className="factor-row__segment factor-row__segment--mother" style={{ width: `${motherPct}%` }}>
          <span>{row.mother.toFixed(3)}</span>
        </div>
        <div className="factor-row__segment factor-row__segment--father" style={{ width: `${fatherPct}%` }}>
          <span>{row.father.toFixed(3)}</span>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [dob, setDob] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!dob) {
      setError('Enter a date of birth to continue.')
      setResult(null)
      return
    }
    try {
      setResult(calculateFactors(dob))
    } catch (err) {
      setError(err.message)
      setResult(null)
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <span className="hero__eyebrow">Parental Legacy</span>
        <h1 className="hero__title">Life Factors, traced to a birth date</h1>
        <p className="hero__subtitle">
          Every date of birth carries a fixed inheritance ledger — seven factors, split
          between mother and father, that always settle to exactly 100.
        </p>

        <form className="dob-form" onSubmit={handleSubmit}>
          <label htmlFor="dob" className="dob-form__label">
            Date of birth
          </label>
          <div className="dob-form__row">
            <input
              id="dob"
              type="date"
              value={dob}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDob(e.target.value)}
            />
            <button type="submit">Calculate</button>
          </div>
          {error && <p className="dob-form__error">{error}</p>}
        </form>
      </header>

      {result && (
        <main className="results">
          <div className="results__summary">
            <div>
              <span className="results__label">Date entered</span>
              <span className="results__value">{formatDate(result.dob)}</span>
            </div>
            <div>
              <span className="results__label">Day of month</span>
              <span className="results__value">{result.dayOfMonth}</span>
            </div>
            <div>
              <span className="results__label">Dominant lineage</span>
              <span className={`results__badge results__badge--${result.dominantParent}`}>
                {result.dominantParent === 'mother' ? 'Mother' : 'Father'}
              </span>
            </div>
          </div>

          <div className="legend">
            <span className="legend__item legend__item--mother">Mother</span>
            <span className="legend__item legend__item--father">Father</span>
            <span className="legend__note">
              Mother leads on odd dates (1, 3, 5…31); Father leads on even dates (2, 4, 6…30).
            </span>
          </div>

          <div className="factor-list">
            {result.rows.map((row) => (
              <FactorBar key={row.key} row={row} />
            ))}
          </div>

          <div className="grand-total">
            <div>
              <span className="grand-total__label">Mother total</span>
              <span className="grand-total__value">{result.motherTotal.toFixed(3)}</span>
            </div>
            <div>
              <span className="grand-total__label">Father total</span>
              <span className="grand-total__value">{result.fatherTotal.toFixed(3)}</span>
            </div>
            <div className="grand-total__grand">
              <span className="grand-total__label">Grand total</span>
              <span className="grand-total__value">{result.grandTotal.toFixed(3)}</span>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
