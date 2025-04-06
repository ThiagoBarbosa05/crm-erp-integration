import axios from 'axios'
import { ploomesLimiter } from '../utils/rate-limiter'
import { retryWithBackOff } from './retry'
import 'dotenv/config'
import { CreatePloomesContact } from '../interfaces/create-ploomes-contact'
import { CreatePloomesTask } from '../interfaces/create-ploomes-task'

export async function getContactLocation(
  cityName: string,
): Promise<{ Id: number; StateId: number } | undefined> {
  const cityCache = new Map<string, { Id: number; StateId: number }>()

  if (cityCache.has(cityName)) {
    return cityCache.get(cityName)
  }

  const response = await ploomesLimiter.schedule(() =>
    retryWithBackOff(() =>
      axios.get<{ value: { Id: number; StateId: number }[] }>(
        `https://api2.ploomes.com/Cities?$filter=Name+eq+'${cityName}'`,
        {
          headers: { 'User-Key': `${process.env.PLOOMES_USER_KEY}` },
        },
      ),
    ),
  )

  cityCache.set(cityName, {
    Id: response.data.value[0].Id,
    StateId: response.data.value[0].StateId,
  })

  return {
    Id: response.data.value[0].Id,
    StateId: response.data.value[0].StateId,
  }
}

export async function existingPloomesContact(
  document: string,
): Promise<number | null> {
  const response = await ploomesLimiter.schedule(() =>
    retryWithBackOff(() =>
      axios.get(
        `https://api2.ploomes.com/Contacts?$filter=(((TypeId+eq+1)))+and+TypeId+eq+1+and+Register+eq+%27${document}%27&$expand=Owner($select=Id,Name,Email)&preload=true`,
        {
          headers: { 'User-Key': `${process.env.PLOOMES_USER_KEY}` },
        },
      ),
    ),
  )

  if (response.data.value.length === 0) {
    return null
  }

  return response.data.value[0].Id
}

export async function createPloomesContact(
  contact: CreatePloomesContact,
  stateRegistration: number,
): Promise<number> {
  const response = await ploomesLimiter.schedule(() =>
    retryWithBackOff(() =>
      axios.post(
        'https://api2.ploomes.com/Contacts',
        {
          ...contact,
          TypeId: 1,
          OtherProperties: [
            {
              FieldKey: 'contact_FA7A15F7-5ED9-4730-AB2E-8F090180F4B7', // ja vende vinhos?
              IntegerValue: 795033, // SIM
            },
            {
              FieldKey: 'contact_467DDF14-FCC3-4AC3-8B3C-919519E1A38A', // conhence a grand cru?
              IntegerValue: 795030, // SIM
            },
            {
              FieldKey: 'contact_796DB62A-10C9-4347-B20D-29E358229CC8', // inscrição estadual
              IntegerValue: stateRegistration,
            },
          ],
        },
        {
          headers: {
            'User-Key': `${process.env.PLOOMES_USER_KEY}`,
          },
        },
      ),
    ),
  )

  return response.data.value[0].Id
}

export async function createPloomesTask(
  task: CreatePloomesTask,
): Promise<{ TaskId: number }> {
  const response = await ploomesLimiter.schedule(() =>
    retryWithBackOff(() =>
      axios.post('https://api2.ploomes.com/Tasks', task, {
        headers: {
          'User-Key': `${process.env.PLOOMES_USER_KEY}`,
        },
      }),
    ),
  )

  return {
    TaskId: response.data.value[0].Id,
  }
}
