import { BlingAddress } from './bling-address'

export interface BlingContact {
  id: number
  nome: string
  numeroDocumento: string
  ie: string
  telefone: string
  email: string
  endereco: BlingAddress
}
