export interface CreatePloomesContact {
  Name: string
  LegalName: string
  Email: string
  ZipCode: number
  Register: string
  StreetAddressNumber: string
  StreetAddress: string
  Neighborhood: string
  CityId: number | undefined
  StateId: number | undefined
  TypeId: number
  Phones: {
    PhoneNumber: string
  }[]
}
