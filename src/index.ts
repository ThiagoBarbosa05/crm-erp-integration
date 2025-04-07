import { getBlingContact, getBlingNfes } from './services/bling'

import {
  createPloomesContact,
  createPloomesTask,
  existingPloomesContact,
  getContactLocation,
} from './services/ploomes'
import { formatZipCode } from './utils/format-zip-code'
import { logger } from './utils/logger'

export const handler = async () => {
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
        logger.info(`⏳ Buscando contato no Ploomes - ${nfe.contato.nome}`)
        const existingPloomesContactResponse = await existingPloomesContact(
          nfe.contato.numeroDocumento,
        )

        logger.success(
          `✅ Contato encontrado - ${nfe.contato.nome} - ${existingPloomesContactResponse}`,
        )

        if (existingPloomesContactResponse === null) {
          logger.info(`⏳ Buscando contato no Bling - ${nfe.contato.nome}`)
          const blingContact = await getBlingContact(nfe.contato.id)

          const contactLocation = await getContactLocation(
            blingContact.data.endereco.geral.municipio,
          )

          logger.info(`🧑‍💻 Criando contato no Ploomes - ${nfe.contato.nome}`)
          const createdPloomesContact = await createPloomesContact(
            {
              Name: blingContact.data.nome,
              LegalName: blingContact.data.fantasia,
              Email: blingContact.data.email,
              ZipCode: formatZipCode(blingContact.data.endereco.geral.cep),
              Register: blingContact.data.numeroDocumento,
              CityId: contactLocation?.Id,
              Neighborhood: `${blingContact.data.endereco.geral.bairro},  ${blingContact.data.endereco.geral.municipio}, ${blingContact.data.endereco.geral.uf}`,
              StateId: contactLocation?.StateId,
              StreetAddress: blingContact.data.endereco.geral.endereco,
              StreetAddressNumber: blingContact.data.endereco.geral.numero,
              Phones: [{ PhoneNumber: blingContact.data.celular }],
              TypeId: 1,
            },
            Number(blingContact.data.ie),
          )

          logger.success(
            `✅ Contato ${createdPloomesContact} - ${blingContact.data.fantasia} criado com sucesso`,
          )

          logger.info(
            `🧑‍💻 Criando tarefa para o contato ${blingContact.data.fantasia}`,
          )
          const newContactTaskCreated = await createPloomesTask({
            ContactId: createdPloomesContact,
            Title: 'Tarefa TESTE',
            Description: `Testando a criação de tarefa - contato ${blingContact.data.nome} criado.`,
          })

          logger.success(
            `✅ Task ${newContactTaskCreated.TaskId} criada com sucesso`,
          )
        } else {
          logger.info(
            `🧑‍💻 Criando tarefa para o contato existente - ${nfe.contato.nome}`,
          )
          const existingContactTaskCreated = await createPloomesTask({
            ContactId: existingPloomesContactResponse,
            Title: 'Tarefa TESTE',
            Description: `Testando a criação de tarefa - contato ${nfe.contato.nome} criado.`,
          })

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
