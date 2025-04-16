import dayjs from 'dayjs'
import { getBlingAccessToken } from './token'

import axios from 'axios'
import { BlingNfe } from '../interfaces/bling-nfe'
import { BlingContactDetails } from '../interfaces/bling-contact-details'
import { blingLimiter } from '../utils/rate-limiter'
import { retryWithBackOff } from './retry'
import { NfeDetails } from '../interfaces/bling-nfe-details'

export async function getBlingNfes() {
  const accessToken = await getBlingAccessToken()

  const startOfDay = dayjs().startOf('day')
  const endOfDay = dayjs().endOf('day')

  const response = await blingLimiter.schedule(() =>
    retryWithBackOff(() =>
      axios.get<{ data: BlingNfe[] }>(`https://api.bling.com.br/Api/v3/nfe`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          dataEmissaoInicial: startOfDay.format('YYYY-MM-DD HH:mm:ss'),
          dataEmissaoFinal: endOfDay.format('YYYY-MM-DD HH:mm:ss'),
        },
      }),
    ),
  )

  const nonDuplicateContacts = Array.from(
    new Map(
      response.data.data.map((nfe) => [nfe.contato.numeroDocumento, nfe]),
    ).values(),
  )

  return nonDuplicateContacts
}

export async function getNfeDetails(nfeId: number) {
  const accessToken = await getBlingAccessToken()

  const nfeDetailsResponse = await blingLimiter.schedule(() =>
    retryWithBackOff(() =>
      axios.get<{ data: NfeDetails }>(
        `https://api.bling.com.br/Api/v3/nfe/${nfeId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    ),
  )

  const nfeDetails = nfeDetailsResponse.data.data

  return nfeDetails
}

export async function getBlingContact(
  id: number,
): Promise<{ data: BlingContactDetails }> {
  const accessToken = await getBlingAccessToken()

  const response = await blingLimiter.schedule(() =>
    retryWithBackOff(() =>
      axios.get(`https://api.bling.com.br/Api/v3/contatos/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    ),
  )

  return response.data
}
