import dayjs from 'dayjs'
import { getBlingNfes, getNfeDetails } from './services/bling'
import { getOwner } from './services/owner'

import {
  createPloomesContact,
  createPloomesTask,
  existingPloomesContact,
  getContactLocation,
} from './services/ploomes'
import { formatZipCode } from './utils/format-zip-code'
import { logger } from './utils/logger'

export const handler = async () => {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL',
  })

  logger.info('📃 Listando Notas Fiscais Emitidas do Bling')

  const blingNfes = await getBlingNfes()

  logger.success(
    `
    -----------------------------------------------
    ✅ ${blingNfes.length} Notas encontradas: ${blingNfes.map((nfe) => nfe.numero)}
    -----------------------------------------------
    `,
  )

  if (blingNfes.length === 0) {
    logger.info('Nenhuma nota encotrada.')
  } else {
    for (const nfe of blingNfes) {
      try {
        logger.info(
          `⏳ Buscando detalhes da nota fiscal do cliente - ${nfe.contato.nome}`,
        )
        const nfeDetails = await getNfeDetails(nfe.id)
        logger.success(
          `✅ Nota do cliente encontrada - ${nfeDetails.numero} - ${nfeDetails.valorNota}`,
        )

        logger.info(`⏳ Buscando contato no Ploomes - ${nfe.contato.nome}`)
        const existingPloomesContactResponse = await existingPloomesContact(
          nfe.contato.numeroDocumento,
        )
        logger.success(
          `✅ Contato encontrado - ${nfe.contato.nome} - ${existingPloomesContactResponse}`,
        )

        const owner = await getOwner(nfeDetails.vendedor.id)

        if (existingPloomesContactResponse === null) {
          const contactLocation = await getContactLocation(
            nfeDetails.contato.endereco.municipio,
          )

          logger.info(
            `⏳ Buscando responsável pelo contato - ${nfe.contato.nome}`,
          )

          logger.info(`🧑‍💻 Criando contato no Ploomes - ${nfe.contato.nome}`)
          const createdPloomesContact = await createPloomesContact(
            {
              Name: nfeDetails.contato.nome,
              LegalName: nfeDetails.contato.nome,
              OwnerId: owner.ploomesId,
              Email: nfeDetails.contato.email,
              ZipCode: formatZipCode(nfeDetails.contato.endereco.cep),
              Register: nfeDetails.contato.numeroDocumento,
              CityId: contactLocation?.Id,
              Neighborhood: `${nfeDetails.contato.endereco.bairro},  ${nfeDetails.contato.endereco.municipio}, ${nfeDetails.contato.endereco.uf}`,
              StateId: contactLocation?.StateId,
              StreetAddress: nfeDetails.contato.endereco.endereco,
              StreetAddressNumber: nfeDetails.contato.endereco.numero,
              Phones: [{ PhoneNumber: nfeDetails.contato.telefone }],
              TypeId: 1,
            },
            Number(nfeDetails.contato.ie),
          )

          logger.success(
            `✅ Contato ${createdPloomesContact} - ${nfeDetails.contato.nome} criado com sucesso`,
          )

          logger.info(
            `🧑‍💻 Criando tarefa para o contato ${nfeDetails.contato.nome}`,
          )
          const newContactTaskCreated = await createPloomesTask(
            {
              ContactId: createdPloomesContact,
              Title: `Venda Realizada - ${dayjs(nfeDetails.dataEmissao).format(
                'DD/MM/YYYY',
              )}`,
              Description: `
            ${nfeDetails.itens
              .map(
                (item) => `
            ➡️ Produto: ${item.descricao}
            ➡️ Preço: ${currencyFormatter.format(item.valor)}
            ➡️ Quantidade: ${item.quantidade}
            ➡️ Total: ${currencyFormatter.format(item.valorTotal)}
            `,
              )
              .join('\n')}
            💲 Total da Nota: ${currencyFormatter.format(nfeDetails.valorNota)}
          `,
            },
            owner.ploomesId,
          )

          logger.success(
            `✅ Task ${newContactTaskCreated.TaskId} criada com sucesso`,
          )
        } else {
          logger.info(
            `🧑‍💻 Criando tarefa para o contato existente - ${nfe.contato.nome}`,
          )
          const existingContactTaskCreated = await createPloomesTask(
            {
              ContactId: existingPloomesContactResponse,
              Title: `Venda Realizada - ${dayjs(nfeDetails.dataEmissao).format(
                'DD/MM/YYYY',
              )}`,
              Description: `
            ${nfeDetails.itens
              .map(
                (item) => `
            ➡️ Produto: ${item.descricao}
            ➡️ Preço: ${currencyFormatter.format(item.valor)}
            ➡️ Quantidade: ${item.quantidade}
            ➡️ Total: ${currencyFormatter.format(item.valorTotal)}
            `,
              )
              .join('\n')}
            💲 Total da Nota: ${currencyFormatter.format(nfeDetails.valorNota)}
          `,
            },
            owner.ploomesId,
          )

          logger.success(
            `✅ Task ${existingContactTaskCreated.TaskId} criada com sucesso`,
          )
        }
      } catch (error) {
        logger.error('❌ Erro ao realizar busca do contato', error)
      }
    }
  }
}
handler()
