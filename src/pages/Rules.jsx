import { TOURNAMENT, RULES } from '../config'

export default function Rules() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="section-title mb-1">Tournament Rules</h1>
      <p className="text-gray-500 text-sm mb-6">{TOURNAMENT.subtitle}</p>

      <div className="card space-y-4">
        <Section title="Schedule">
          <Rule>Warm-up: <strong>8:00 AM</strong></Rule>
          <Rule>Match time: <strong>8:30 AM – Noon</strong></Rule>
          <Rule>Location: <strong>{TOURNAMENT.location}</strong></Rule>
        </Section>

        <Section title="Match Play">
          <Rule>Coin/paddle toss to determine 1st server of each game.</Rule>
          <Rule>Play <strong>11 points per game</strong>, win by 2 points.</Rule>
          <Rule>At 11-all, the next point is game point — <strong>Receivers' Choice</strong>.</Rule>
          <Rule>Report <strong>WIN ONLY</strong> to your captain.</Rule>
        </Section>

        <Section title="Player Format">
          <Rule>Each player will play at least <strong>2 games</strong>, maximum <strong>3</strong>.</Rule>
          <Rule>Captain may play 1 different pairing each game.</Rule>
          <Rule>Each man plays <strong>3 games</strong>, each with a different partner.</Rule>
          <Rule>2 women play 2 games; captain plays 1 game.</Rule>
        </Section>

        <Section title="Games Breakdown">
          <Rule>16 total games (8 rounds × 2 courts).</Rule>
          <Rule>27 Men's Doubles + 5 Mixed Doubles games.</Rule>
          <Rule>Mixed Doubles marked with ★ on the schedule (Rounds 3, 4, 6).</Rule>
        </Section>

        <Section title="Scoring">
          <Rule>S = South Court · N = North Court</Rule>
          <Rule>★ = Mixed Doubles</Rule>
          <Rule>Only wins are recorded — no score tracking.</Rule>
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
