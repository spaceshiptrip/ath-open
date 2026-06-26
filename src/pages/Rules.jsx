import { TOURNAMENT } from '../config'

export default function Rules() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="section-title mb-1">Tournament Rules</h1>
      <p className="text-gray-500 text-sm mb-6">{TOURNAMENT.subtitle}</p>

      <div className="card space-y-4">
        <Section title="Schedule">
          <Rule>Warm-up: <strong>8:00 AM</strong></Rule>
          <Rule>Match time: <strong>{TOURNAMENT.matchTime}</strong></Rule>
          <Rule>Location: <strong>{TOURNAMENT.location}</strong></Rule>
        </Section>

        <Section title="Match Play">
          <Rule>Coin/paddle toss to determine 1st server of each game.</Rule>
          <SubRule>At 11-all: game point — <strong>Receivers' Choice</strong>.</SubRule>
          <Rule>Play <strong>11 points per game</strong>, win by 2 points.</Rule>
          <Rule>Report <strong>WIN ONLY</strong> to your captain.</Rule>
        </Section>

        <Section title="Player Format">
          <Rule>Each man plays <strong>3 games</strong> (top 2 seeds play 4), each with a different partner.</Rule>
          <Rule>3 women play <strong>2 games</strong> each; captain plays 1 game.</Rule>
          <Rule>Couples always play together in Mixed Doubles.</Rule>
        </Section>

        <Section title="Games Breakdown">
          <Rule><strong>18 total games</strong> — 9 rounds × 2 courts.</Rule>
          <Rule>11 Men's Doubles + 7 Mixed Doubles (★).</Rule>
          <Rule>Mixed Doubles in rounds 4, 5 (South only), 7, and 9.</Rule>
        </Section>

        <Section title="Scoring Key">
          <Rule>S = South Court · N = North Court</Rule>
          <Rule>★ = Mixed Doubles</Rule>
          <Rule>© = Captain's game</Rule>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-display font-bold text-pickle-800 text-base border-b border-pickle-100 pb-1 mb-2">
        {title}
      </h2>
      <ul className="space-y-1.5">{children}</ul>
    </div>
  )
}

function Rule({ children }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-700">
      <span className="text-pickle-400 mt-0.5 shrink-0">▸</span>
      <span>{children}</span>
    </li>
  )
}

function SubRule({ children }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-600 ml-5">
      <span className="text-gray-300 mt-0.5 shrink-0">◦</span>
      <span>{children}</span>
    </li>
  )
}
