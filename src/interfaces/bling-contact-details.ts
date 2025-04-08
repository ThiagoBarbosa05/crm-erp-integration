import { BlingAddress } from './bling-address'

interface AddressDetails {
  geral: BlingAddress
}

export interface BlingContactDetails {
  id: number
  nome: string
  numeroDocumento: string
  celular: string
  telefone: string
  fantasia: string
  ie: string
  email: string
  endereco: AddressDetails
  tiposContato: {
    id: number
    descricao: string
  }
  vendedor: {
    id: number
  }
}
