function safeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

async function buildPlayerSummary(input) {
  const strengths = safeArray(input.strengths, [
    'Competes consistently',
    'Responds well to coaching'
  ]);
  const priorities = safeArray(input.priorities, [
    'Decision-making under pressure',
    'Finishing through contact'
  ]);

  return {
    headline: input.headline || 'Player development summary',
    strengths,
    developmentPriorities: priorities,
    coachFocus:
      input.coachFocus ||
      'Emphasize repetition, pace control, and clearer reads this week.',
    playerMessage:
      input.playerMessage ||
      'You are showing progress, but your next step is slowing down enough to make stronger reads and finish with balance.',
    parentDraft:
      input.parentDraft ||
      'Your athlete showed strong effort and competitiveness this week. The next area of emphasis is making better decisions under pressure and finishing more efficiently in traffic.'
  };
}

async function buildTeamSummary(input) {
  return {
    headline: input.headline || 'Team trend summary',
    strengths: safeArray(input.strengths, [
      'Good effort level',
      'Strong transition energy'
    ]),
    recurringIssues: safeArray(input.recurringIssues, [
      'Late help defense',
      'Rushed offensive decisions'
    ]),
    nextPracticeFocus: safeArray(input.nextPracticeFocus, [
      'Shell defense',
      'Advantage decision-making'
    ]),
    coachingPoints: safeArray(input.coachingPoints, [
      'Talk early',
      'Play off two feet'
    ])
  };
}

async function buildPracticePlan(input) {
  return {
    practiceTheme:
      input.practiceTheme || 'Play with balance, discipline, and communication',
    priorities: safeArray(input.priorities, [
      'Help defense',
      'Finishing under pressure',
      'Decision-making'
    ]),
    segmentPlan: [
      { block: '10 min', focus: 'dynamic warmup + footwork prep' },
      { block: '20 min', focus: 'shell defense and rotation discipline' },
      { block: '20 min', focus: 'finishing through contact' },
      { block: '20 min', focus: 'small-sided advantage games' },
      { block: '15 min', focus: 'controlled scrimmage with constraints' },
      { block: '5 min', focus: 'free throws + recap' }
    ],
    coachingEmphasis:
      'Demand communication, controlled pace, and game-speed execution.'
  };
}

async function buildParentUpdate(input) {
  return {
    message:
      input.message ||
      'This week your athlete showed strong effort and competitiveness. Our next focus is improving decision-making under pressure and staying balanced on finishes around the basket.'
  };
}

module.exports = {
  buildPlayerSummary,
  buildTeamSummary,
  buildPracticePlan,
  buildParentUpdate
};
