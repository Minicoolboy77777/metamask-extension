const Component = require('react').Component
const h = require('react-hyperscript')
const inherits = require('util').inherits
const exportAsFile = require('../util').exportAsFile
const copyToClipboard = require('copy-to-clipboard')
const actions = require('../actions')
const ethUtil = require('ethereumjs-util')
const connect = require('../metamask-connect')
const t = require('../../i18n-helper').getMessage

module.exports = connect(mapStateToProps)(ExportAccountView)

inherits(ExportAccountView, Component)
function ExportAccountView () {
  Component.call(this)
}

function mapStateToProps (state) {
  return {
    warning: state.appState.warning,
  }
}

ExportAccountView.prototype.render = function () {
  const state = this.props
  const accountDetail = state.accountDetail
  const nickname = state.identities[state.address].name

  if (!accountDetail) return h('div')
  const accountExport = accountDetail.accountExport

  const notExporting = accountExport === 'none'
  const exportRequested = accountExport === 'requested'
  const accountExported = accountExport === 'completed'

  if (notExporting) return h('div')

  if (exportRequested) {
    const warning = t(this.props.localeMessages, 'exportPrivateKeyWarning')
    return (
      h('div', {
        style: {
          display: 'inline-block',
          textAlign: 'center',
        },
      },
        [
          h('div', {
            key: 'exporting',
            style: {
              margin: '0 20px',
            },
          }, [
            h('p.error', warning),
            h('input#exportAccount.sizing-input', {
              type: 'password',
              placeholder: t(this.props.localeMessages, 'confirmPassword').toLowerCase(),
              onKeyPress: this.onExportKeyPress.bind(this),
              style: {
                position: 'relative',
                top: '1.5px',
                marginBottom: '7px',
              },
            }),
          ]),
          h('div', {
            key: 'buttons',
            style: {
              margin: '0 20px',
            },
          },
            [
              h('button', {
                onClick: () => this.onExportKeyPress({ key: 'Enter', preventDefault: () => {} }),
                style: {
                  marginRight: '10px',
                },
              }, t(this.props.localeMessages, 'submit')),
              h('button', {
                onClick: () => this.props.dispatch(actions.backToAccountDetail(this.props.address)),
              }, t(this.props.localeMessages, 'cancel')),
            ]),
          (this.props.warning) && (
          h('span.error', {
            style: {
              margin: '20px',
            },
          }, this.props.warning.split('-'))
        ),
        ])
    )
  }

  if (accountExported) {
    const plainKey = ethUtil.stripHexPrefix(accountDetail.privateKey)

    return h('div.privateKey', {
      style: {
        margin: '0 20px',
      },
    }, [
      h('label', t(this.props.localeMessages, 'copyPrivateKey') + ':'),
      h('p.error.cursor-pointer', {
        style: {
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          webkitUserSelect: 'text',
          maxWidth: '275px',
        },
        onClick: function (event) {
          copyToClipboard(ethUtil.stripHexPrefix(accountDetail.privateKey))
        },
      }, plainKey),
      h('button', {
        onClick: () => this.props.dispatch(actions.backToAccountDetail(this.props.address)),
      }, t(this.props.localeMessages, 'done')),
      h('button', {
        style: {
          marginLeft: '10px',
        },
        onClick: () => exportAsFile(`MetaMask ${nickname} Private Key`, plainKey),
      }, t(this.props.localeMessages, 'saveAsFile')),
    ])
  }
}

ExportAccountView.prototype.onExportKeyPress = function (event) {
  if (event.key !== 'Enter') return
  event.preventDefault()

  const input = document.getElementById('exportAccount').value
  this.props.dispatch(actions.exportAccount(input, this.props.address))
}
