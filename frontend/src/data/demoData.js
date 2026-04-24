export const demoData = {
  organization: {
    id: 'org_nbg',
    name: 'Northeast Bucket Getters'
  },
  teams: [
    {
      id: 'team_15u',
      name: 'NBG 15U',
      ageGroup: '15U',
      level: 'AAU',
      rosterCount: 5
    },
    {
      id: 'team_17u',
      name: 'NBG 17U',
      ageGroup: '17U',
      level: 'AAU',
      rosterCount: 3
    }
  ],
  players: [
    {
      id: 'player_jaylen',
      teamId: 'team_15u',
      firstName: 'Jaylen',
      lastName: 'Smith',
      position: 'Guard',
      jerseyNumber: '2',
      graduationYear: 2029,
      dominantHand: 'Right',
      injuryStatus: 'healthy',
      guardianName: 'Michelle Smith',
      guardianEmail: 'parent@example.com'
    },
    {
      id: 'player_malik',
      teamId: 'team_15u',
      firstName: 'Malik',
      lastName: 'Johnson',
      position: 'Wing',
      jerseyNumber: '11',
      graduationYear: 2028,
      dominantHand: 'Right',
      injuryStatus: 'healthy',
      guardianName: 'Angela Johnson',
      guardianEmail: 'angela@example.com'
    },
    {
      id: 'player_noah',
      teamId: 'team_15u',
      firstName: 'Noah',
      lastName: 'Davis',
      position: 'Forward',
      jerseyNumber: '24',
      graduationYear: 2028,
      dominantHand: 'Left',
      injuryStatus: 'limited',
      guardianName: 'Marcus Davis',
      guardianEmail: 'marcus@example.com'
    },
    {
      id: 'player_kai',
      teamId: 'team_15u',
      firstName: 'Kai',
      lastName: 'Brown',
      position: 'Guard',
      jerseyNumber: '1',
      graduationYear: 2029,
      dominantHand: 'Right',
      injuryStatus: 'healthy',
      guardianName: 'Nicole Brown',
      guardianEmail: 'nicole@example.com'
    },
    {
      id: 'player_elijah',
      teamId: 'team_15u',
      firstName: 'Elijah',
      lastName: 'Miller',
      position: 'Center',
      jerseyNumber: '34',
      graduationYear: 2028,
      dominantHand: 'Right',
      injuryStatus: 'healthy',
      guardianName: 'Tara Miller',
      guardianEmail: 'tara@example.com'
    },
    {
      id: 'player_zion',
      teamId: 'team_17u',
      firstName: 'Zion',
      lastName: 'White',
      position: 'Wing',
      jerseyNumber: '5',
      graduationYear: 2027,
      dominantHand: 'Right',
      injuryStatus: 'healthy',
      guardianName: 'Lisa White',
      guardianEmail: 'lisa@example.com'
    },
    {
      id: 'player_isaiah',
      teamId: 'team_17u',
      firstName: 'Isaiah',
      lastName: 'Clark',
      position: 'Guard',
      jerseyNumber: '12',
      graduationYear: 2026,
      dominantHand: 'Left',
      injuryStatus: 'healthy',
      guardianName: 'Dorian Clark',
      guardianEmail: 'dorian@example.com'
    },
    {
      id: 'player_aj',
      teamId: 'team_17u',
      firstName: 'AJ',
      lastName: 'Thomas',
      position: 'Forward',
      jerseyNumber: '22',
      graduationYear: 2027,
      dominantHand: 'Right',
      injuryStatus: 'healthy',
      guardianName: 'Kesha Thomas',
      guardianEmail: 'kesha@example.com'
    }
  ],
  evaluations: [
    {
      id: 'eval_1',
      teamId: 'team_15u',
      playerId: 'player_jaylen',
      evaluationType: 'game',
      createdAt: '2026-04-18T20:15:00.000Z',
      ballHandling: 6,
      finishing: 5,
      shooting: 6,
      passingDecision: 5,
      defenseOnBall: 8,
      defenseHelp: 5,
      rebounding: 4,
      communication: 6,
      motorEffort: 8,
      basketballIq: 5,
      strengths: 'Pressures the ball and competes every possession.',
      priorities: 'Needs earlier weak-side reads and more balanced finishes.',
      notes: 'Late rotations on weak side. Rushed on two drives. Strong defensive energy.'
    },
    {
      id: 'eval_2',
      teamId: 'team_15u',
      playerId: 'player_malik',
      evaluationType: 'practice',
      createdAt: '2026-04-17T22:00:00.000Z',
      ballHandling: 7,
      finishing: 6,
      shooting: 7,
      passingDecision: 6,
      defenseOnBall: 6,
      defenseHelp: 6,
      rebounding: 5,
      communication: 5,
      motorEffort: 7,
      basketballIq: 6,
      strengths: 'Shot prep and pace off the catch improved.',
      priorities: 'Talk earlier and finish possessions with better box outs.',
      notes: 'Best shooting practice in the last two weeks.'
    },
    {
      id: 'eval_3',
      teamId: 'team_15u',
      playerId: 'player_noah',
      evaluationType: 'practice',
      createdAt: '2026-04-16T21:00:00.000Z',
      ballHandling: 4,
      finishing: 6,
      shooting: 5,
      passingDecision: 5,
      defenseOnBall: 6,
      defenseHelp: 7,
      rebounding: 8,
      communication: 6,
      motorEffort: 7,
      basketballIq: 6,
      strengths: 'Impacts the game on the glass and rotates well.',
      priorities: 'Needs cleaner handles and stronger outlet decisions.',
      notes: 'Still managing lower-leg soreness. Should stay on a monitored workload.'
    },
    {
      id: 'eval_4',
      teamId: 'team_17u',
      playerId: 'player_zion',
      evaluationType: 'game',
      createdAt: '2026-04-19T18:45:00.000Z',
      ballHandling: 7,
      finishing: 7,
      shooting: 8,
      passingDecision: 6,
      defenseOnBall: 7,
      defenseHelp: 6,
      rebounding: 5,
      communication: 6,
      motorEffort: 7,
      basketballIq: 7,
      strengths: 'Created spacing pressure and made catch-and-shoot threes.',
      priorities: 'Need more rim pressure and stronger closeout discipline.',
      notes: 'Very efficient scoring night.'
    }
  ],
  recentAiReports: [
    {
      id: 'report_1',
      playerId: 'player_jaylen',
      reportType: 'player_summary',
      headline: 'Jaylen needs calmer reads in traffic',
      content:
        'Competes hard and brings strong point-of-attack defense. Next step is slowing down on downhill attacks and seeing the second defender earlier.'
    },
    {
      id: 'report_2',
      playerId: null,
      reportType: 'practice_plan',
      headline: 'Next practice emphasis: shell defense + two-foot finishes',
      content:
        'Focus on early help communication, stopping the ball with discipline, and finishing through contact with pace control.'
    }
  ]
};
