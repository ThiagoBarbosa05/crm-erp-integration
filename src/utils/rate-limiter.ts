import Bottleneck from 'bottleneck'

export const blingLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 350,
})

export const ploomesLimiter = new Bottleneck({
  reservoir: 500, // total por minuto
  reservoirRefreshAmount: 120,
  reservoirRefreshInterval: 60 * 1000, // a cada 1 minuto
  maxConcurrent: 1,
})
