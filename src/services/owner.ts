import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { Owner } from '../interfaces/owner'

export async function getOwner(blingId: number) {
  const db = new DynamoDBClient({
    region: 'us-east-2',
  })

  const params: GetItemCommandInput = {
    TableName: 'PloomesUsers',
    Key: marshall({
      id: 'sellers',
    }),
  }

  const response = await db.send(new GetItemCommand(params))
  const users = unmarshall(response.Item ?? {})

  const owners = users.ListAttribute.map((owner: Owner) => owner)

  return owners.find((owner: Owner) => owner.blingId === blingId)
}
