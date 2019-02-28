const keystone = require('keystone')
const Types = keystone.Field.Types
const uuid = require('uuid/v4')

const RegistrationToken = new keystone.List('RegistrationToken', {

})

RegistrationToken.add({
    token: { type: Types.Text, default: uuid, noedit: true, index: true },
    used: { type: Types.Boolean, default: false, noedit: true },
    createdAt: { type: Types.Datetime, default: Date.now, noedit: true }
})

RegistrationToken.defaultColumns = 'token, used, createdAt'

RegistrationToken.register()