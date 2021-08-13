/* eslint-disable no-console */
import React, { FC, useState } from 'react'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import { compose, graphql, useMutation, useQuery } from 'react-apollo'
import { Layout, PageBlock, PageHeader, Input, Button } from 'vtex.styleguide'

import SAVE_SETTINGS from './mutations/saveSettings.gql'
import CONFIG from './queries/config.gql'

import './styles.global.css'

const EasypostAdmin: FC<any> = ({ data: { config }, intl }) => {
  const messages = defineMessages({
    title: {
      id: 'admin/navigation.label',
      defaultMessage: 'Easypost Integration',
    },
    settingsLabel: {
      id: 'admin/settings.label',
      defaultMessage: 'Settings',
    },
    addressTitle: {
      id: 'admin/settings.address.title',
      defaultMessage: 'Default Return Address',
    },
    idLabel: {
      id: 'admin/settings.key.label',
      defaultMessage: 'Client Key',
    },
    nameLabel: {
      id: 'admin/settings.name.label',
      defaultMessage: 'Name or Company',
    },
    street1Label: {
      id: 'admin/settings.street1.label',
      defaultMessage: 'Street Address',
    },
    street2Label: {
      id: 'admin/settings.street2.label',
      defaultMessage: 'Address Line 2',
    },
    cityLabel: {
      id: 'admin/settings.city.label',
      defaultMessage: 'City',
    },
    stateLabel: {
      id: 'admin/settings.state.label',
      defaultMessage: 'State',
    },
    zipLabel: {
      id: 'admin/settings.zip.label',
      defaultMessage: 'Zip Code',
    },
    countryLabel: {
      id: 'admin/settings.country.label',
      defaultMessage: 'Country',
    },
    phoneLabel: {
      id: 'admin/settings.phone.label',
      defaultMessage: 'Phone Number',
    },
    weightLabel: {
      id: 'admin/settings.weight.label',
      defaultMessage: 'Default Weight',
    },
    weightHelp: {
      id: 'admin/settings.weight.help',
      defaultMessage: 'Set a default parcel weight for return labels (oz)',
    },
    saveLabel: {
      id: 'admin/settings.button.label',
      defaultMessage: 'Save',
    },
  })

  const [state, setState] = useState<any>({
    clientKey: '',
    street1: '',
    street2: '',
    city: '',
    stateAddress: '',
    zip: '',
    country: '',
    name: '',
    phone: '',
    weight: 10,
  })

  const {
    clientKey,
    name,
    street1,
    street2,
    city,
    stateAddress,
    zip,
    country,
    phone,
    weight,
  } = state

  const [saveSettings, { loading: saveLoading }] = useMutation(SAVE_SETTINGS)

  console.log('config', config)
  console.log('state', state)

  if (
    (config?.clientKey.length && !clientKey.length) ||
    (config?.street1.length && !street1.length)
  ) {
    setState({
      ...state,
      clientKey: config.clientKey,
      street1: config.street1,
      street2: config.street2,
      city: config.city,
      stateAddress: config.state,
      zip: config.zip,
      country: config.country,
      name: config.name,
      phone: config.phone,
      weight: config.weight,
    })
  }

  return (
    <Layout
      pageHeader={<PageHeader title={intl.formatMessage(messages.title)} />}
    >
      <PageBlock
        title={intl.formatMessage(messages.settingsLabel)}
        variation="full"
      >
        <div className="mt4">
          <Input
            label={intl.formatMessage(messages.idLabel)}
            value={clientKey}
            onChange={(e: any) =>
              setState({ ...state, clientKey: e.target.value })
            }
          />
        </div>
        <h4 className="t-heading-5 mt7 mb4">
          {intl.formatMessage(messages.addressTitle)}
        </h4>
        <div className="mt4">
          <Input
            label={intl.formatMessage(messages.nameLabel)}
            value={name}
            onChange={(e: any) => setState({ ...state, name: e.target.value })}
          />
        </div>
        <div className="mt4">
          <Input
            label={intl.formatMessage(messages.street1Label)}
            value={street1}
            onChange={(e: any) =>
              setState({ ...state, street1: e.target.value })
            }
          />
        </div>
        <div className="mt4">
          <Input
            label={intl.formatMessage(messages.street2Label)}
            value={street2}
            onChange={(e: any) =>
              setState({ ...state, street2: e.target.value })
            }
          />
        </div>
        <div className="mt4">
          <Input
            label={intl.formatMessage(messages.cityLabel)}
            value={city}
            onChange={(e: any) => setState({ ...state, city: e.target.value })}
          />
        </div>
        <div className="mt4">
          <Input
            label={intl.formatMessage(messages.stateLabel)}
            value={stateAddress}
            onChange={(e: any) =>
              setState({ ...state, stateAddress: e.target.value })
            }
          />
        </div>
        <div className="mt4">
          <Input
            label={intl.formatMessage(messages.zipLabel)}
            value={zip}
            onChange={(e: any) => setState({ ...state, zip: e.target.value })}
          />
        </div>
        <div className="mt4">
          <Input
            label={intl.formatMessage(messages.countryLabel)}
            value={country}
            onChange={(e: any) =>
              setState({ ...state, country: e.target.value })
            }
          />
        </div>
        <div className="mt4">
          <Input
            label={intl.formatMessage(messages.phoneLabel)}
            value={phone}
            onChange={(e: any) => setState({ ...state, phone: e.target.value })}
          />
        </div>
        <div className="mt4">
          <Input
            label={intl.formatMessage(messages.weightLabel)}
            value={weight}
            helpText={intl.formatMessage(messages.weightHelp)}
            onChange={(e: any) =>
              setState({ ...state, weight: e.target.value })
            }
          />
        </div>
        <div className="mt6">
          <Button
            isLoading={saveLoading}
            onClick={() => {
              saveSettings({
                variables: {
                  clientKey,
                  name,
                  street1,
                  street2,
                  city,
                  state: stateAddress,
                  zip,
                  country,
                  phone,
                  weight,
                },
              })
            }}
          >
            {intl.formatMessage(messages.saveLabel)}
          </Button>
        </div>
      </PageBlock>
    </Layout>
  )
}

export default injectIntl(
  compose(
    graphql(CONFIG, {
      options: { ssr: false },
    })
  )(EasypostAdmin)
)
