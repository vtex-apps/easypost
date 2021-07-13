/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable no-console */
import { Apps } from '@vtex/api'

const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ''
}
const SCHEMA_VERSION = 'v0.2'
const schemaLabels = {
  properties: {
    labelUrl: {
      type: 'string',
      title: 'Label URL',
    },
    creationDate: {
      type: 'string',
      title: 'Creation Date',
    },
  },
  'v-indexed': ['orderId'],
  'v-cache': false,
}

const routes = {
  baseUrl: (account: string) =>
    `http://${account}.vtexcommercestable.com.br/api`,
  labelEntity: (account: string) =>
    `${routes.baseUrl(account)}/dataentities/label`,

  saveSchemaLabel: (account: string) =>
    `${routes.labelEntity(account)}/schemas/${SCHEMA_VERSION}`,
}

const defaultHeaders = (authToken: string) => ({
  'Content-Type': 'application/json',
  Accept: 'application/vnd.vtex.ds.v10+json',
  VtexIdclientAutCookie: authToken,
  'Proxy-Authorization': authToken,
})

export const resolvers = {
  Query: {
    config: async (_: any, __: any, ctx: any) => {
      const {
        vtex: { account, authToken },
        clients: { hub },
      } = ctx

      const apps = new Apps(ctx.vtex)
      const app: string = getAppId()
      let settings = await apps.getAppSettings(app)
      const defaultSettings = {
        schema: false,
        schemaVersion: null,
        title: 'Easypost',
        clientKey: '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        name: '',
        phone: '',
      }

      if (!settings.title) {
        settings = defaultSettings
      }

      let schemaError = false

      if (!settings.schema || settings.schemaVersion !== SCHEMA_VERSION) {
        try {
          const url = routes.saveSchemaLabel(account)
          const headers = defaultHeaders(authToken)

          await hub.put(url, schemaLabels, headers)
        } catch (e) {
          if (e.response.status >= 400) {
            schemaError = true
          }
        }

        settings.schema = !schemaError
        settings.schemaVersion = !schemaError ? SCHEMA_VERSION : null

        console.log(settings)

        await apps.saveAppSettings(app, settings)
      }

      return settings
    },
  },
  Mutation: {
    saveSettings: async (_: any, args: any, ctx: Context) => {
      const apps = new Apps(ctx.vtex)
      const app: string = getAppId()

      const settings = {
        schema: null,
        schemaVersion: SCHEMA_VERSION,
        title: 'Easypost',
        clientKey: args.clientKey,
        street1: args.street1,
        street2: args.street2,
        city: args.city,
        state: args.state,
        zip: args.zip,
        country: args.country,
        name: args.name,
        phone: args.phone,
      }

      try {
        await apps.saveAppSettings(app, settings)

        return { status: 'success', message: '' }
      } catch (e) {
        return { status: 'error', message: e }
      }
    },
    createLabel: async (_: any, args: any, ctx: Context) => {
      const apps = new Apps(ctx.vtex)
      const app: string = getAppId()
      const settings: any = await apps.getAppSettings(app)
      const {
        street1,
        street2,
        city,
        state,
        zip,
        country,
        name,
        phone,
        height,
        length,
        width,
        weight,
      } = args

      const argAddress = {
        street1,
        street2,
        city,
        state,
        zip,
        country,
        name,
        phone,
      }

      const returnAddress = {
        street1: settings.street1,
        street2: settings.street2,
        city: settings.city,
        state: settings.state,
        zip: settings.zip,
        country: settings.country,
        name: settings.name,
        phone: settings.phone,
      }

      const argParcel = {
        height: parseFloat(height),
        length: parseFloat(length),
        width: parseFloat(width),
        weight: parseFloat(weight),
      }

      console.log('settings', settings)
      console.log('key', settings.clientKey)
      console.log('argAddress', argAddress)
      console.log('argParcel', argParcel)

      require('babel-polyfill')
      const Easypost = require('@easypost/api')
      const api = new Easypost(settings.clientKey)

      const toAddress = new api.Address(returnAddress)
      const fromAddress = new api.Address(argAddress)
      const parcel = new api.Parcel(argParcel)

      console.log('toAddress', toAddress)
      console.log('fromAddress', fromAddress)
      console.log('parcel', parcel)

      const shipment = new api.Shipment({
        to_address: toAddress,
        from_address: fromAddress,
        parcel,
      })

      let labelUrl

      try {
        await shipment
          .save()
          .then((s: any) =>
            s.buy(shipment.lowestRate()).then(console.log).catch(console.log)
          )
          .then(() => {
            labelUrl = shipment.postage_label.label_url
          })
      } catch (e) {
        console.log(e.error.error.errors)
      }

      return { labelUrl }
    },
  },
}
