import {
  DynamoDBClient,
  GetItemCommand,
  GetItemInput,
  PutItemCommand,
  PutItemInput,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

type SaleDB = {
  id: string | undefined
  name: string | undefined
}

export class DynamoRepository {
  private client: DynamoDBClient

  constructor() {
    this.client = new DynamoDBClient({ region: 'us-east-2' })
  }

  async getSale(saleId: number): Promise<SaleDB | null> {
    const getItem: GetItemInput = {
      TableName: 'BlingSales',
      Key: marshall({
        id: saleId,
      }),
    }
    const getItemCommand = new GetItemCommand(getItem)
    const response = await this.client.send(getItemCommand)

    if (!response.Item) return null

    return {
      id: response.Item?.id.N,
      name: response.Item?.name.S,
    }
  }

  async saveSale(sale: SaleDB) {
    const dbInput: PutItemInput = {
      TableName: 'BlingSales',
      Item: marshall({
        id: Number(sale.id),
        name: sale.name,
      }),
    }

    const dbCommand = new PutItemCommand(dbInput)
    await this.client.send(dbCommand)
  }
}
