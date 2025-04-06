import { describe, it, expect, vi } from 'vitest'
import { retryWithBackOff } from '../src/services/retry'

describe('retryWithBackoff', () => {
  it('deve retornar o valor se a função não falhar', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await retryWithBackOff(fn)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('deve tentar novamente se a função falhar', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('falha 1'))
      .mockResolvedValueOnce('ok depois')

    const result = await retryWithBackOff(fn, 2, 100)
    expect(result).toBe('ok depois')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('deve lançar erro após todas tentativas falharem', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('sempre falha'))
    await expect(() => retryWithBackOff(fn, 2, 10)).rejects.toThrow(
      'sempre falha',
    )
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
