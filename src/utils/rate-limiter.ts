import Bottleneck from 'bottleneck'

export const blingLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 350,
})

export const ploomesLimiter = new Bottleneck({
  minTime: 500,
  maxConcurrent: 1,
})
