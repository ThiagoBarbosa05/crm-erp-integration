export interface BlingProduct {
  codigo: string
  descricao: string
  quantidade: number
  valor: number
  valorTotal: number
}

export interface PloomeProduct {
  Id: number
  Name: string
}

export interface PloomesOrderProduct {
  ProductId: number
  CurrencyId: number
  Quantity: number
  UnitPrice: number
  Total: number
}
