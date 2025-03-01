export type Data = {
  username: string
  password: string
  age: number
  notes: {
    title: string
    description: string
    dateModified: string
  }[]
  statistics: {
    goalScore: number
    dayProgression: number
    dayTaskScores: {
      task: string
      scores: number[]
      weekScores: number[]
      monthScores: number[]
    }[]
    dayRegistered: string
    dayTotalPointsCompleted: number[]
  }
  timers: {
    originalTimers: number[]
    task: string
    taskTimers: number[]
  }[]
}

export const gData: Data = {
  username: "michael90gaming",
  password: "",
  age: 17,
  notes: [{
    title: "Yin Yang",
    description: "The duality of opposites",
    dateModified: "2025-03-01T00:00:00.000Z"
  }],
  statistics: {
    goalScore: 0,
    dayProgression: 0,
    dayTaskScores: [
      {
        task: "Study",
        scores: [0],
        weekScores: [0],
        monthScores: [0]
      },
      {
        task: "Work",
        scores: [0],
        weekScores: [0],
        monthScores: [0]
      },
      {
        task: "Health",
        scores: [0],
        weekScores: [0],
        monthScores: [0]
      },
      {
        task: "Meditation",
        scores: [0],
        weekScores: [0],
        monthScores: [0]
      }
    ],
    dayRegistered: "2025-03-01T00:00:00.000Z",
    dayTotalPointsCompleted: [0]
  },
  timers: [{
    originalTimers: [],
    task: "Study",
    taskTimers: [],
  },
  {
    originalTimers: [],
    task: "Work",
    taskTimers: [],
  },
  {
    originalTimers: [],
    task: "Health",
    taskTimers: [],
  }, {
    originalTimers: [],
    task: "Meditation",
    taskTimers: [],
  },
  ]
}

export type Rect = {
  height: number
  width: number
}