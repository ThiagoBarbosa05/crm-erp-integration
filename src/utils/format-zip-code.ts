export function formatZipCode(zipCode: string) {
  return Number(zipCode.replace(/[^0-9]/g, ''))
}
