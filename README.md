# Parental Legacy — Life Factors Calculator

A small React app: enter a date of birth, click **Calculate**, and it displays
the 7 "Life Factors" (Genetic Inheritance, Constitutional Vitality, Mental
Patterns, Intellectual Capacity, Emotional Foundation, Spiritual Lineage,
Soul Connections) split between Mother and Father, per the reference sheet.

## How the numbers are calculated (read this before submitting)

The supplied spreadsheet gives each factor a fixed `[Minimum, Maximum]` band
and two rules, but no explicit formula tying a specific DOB to specific
decimals:

1. Mother's value is higher when the DOB's **day of month is odd**; Father's
   is higher when it's **even**.
2. All 14 values (7 factors × Mother/Father) always **sum to exactly 100**,
   even though each value moves inside its own band.

Since the formula itself isn't in the sheet, `src/calculateFactors.js`
implements a deterministic interpretation of those two rules:

- The same DOB always seeds the same result (via a small hash + PRNG), so
  it's reproducible and testable — not random on every click.
- Two candidate values are drawn per factor inside its band; the higher one
  is assigned to whichever parent the odd/even rule says should dominate.
- All 14 values are then nudged (proportionally, respecting every band) so
  the grand total lands on exactly 100.000.

**If the actual formula is different** (e.g. derived from numerology digits
of the DOB, or a specific proprietary calculation), only `calculateFactors.js`
needs to change — the UI already just calls `calculateFactors(dob)` and
renders whatever comes back. Worth flagging this assumption to whoever
reviews the task, in case they expect a specific formula.

## Project structure

```
src/
  calculateFactors.js   the calculation logic (documented above)
  App.jsx               the form + results UI
  App.css               styling
  main.jsx              React entry point
```

## Running it locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:5173`).

## Building for submission / deployment

```bash
npm run build
```

This produces a static `dist/` folder. To share a live link, the fastest
options are:

- **Vercel**: `npx vercel` from this folder (or drag-and-drop `dist/` at
  vercel.com if you don't want the CLI).
- **Netlify**: drag-and-drop the `dist/` folder at app.netlify.com/drop.
- **GitHub Pages**: push this folder to a repo, then serve `dist/` via
  Pages (or run `npm run build` in a GitHub Action).

Any of these gives you a shareable URL in a couple of minutes.
