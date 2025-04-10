import { BlingProduct } from './product'

export interface NfeDetails {
  id: number
  numero: string
  dataEmissao: Date | string
  contato: {
    id: number
    nome: string
    numeroDocumento: string
    ie: string
    telefone: string
    email: string
    endereco: {
      endereco: string
      numero: string
      complemento: string
      bairro: string
      cep: string
      municipio: string
      uf: string
    }
  }
  vendedor: {
    id: number
  }
  valorNota: number
  itens: BlingProduct[]
}
