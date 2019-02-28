const keystone = require('keystone')
const Types = keystone.Field.Types

const OperationField = new keystone.List('OperationField', {
    map : { name: title },
    autokey: { path: 'slug', from : 'title', unique: true }
})

OperationField.add({
    title: { type: Types.Text, required: true, index: true, unique: true }
})

OperationField.defaultColumns = 'title'

OperationField.relationship({ ref: 'Project', path: 'projects', refPath: 'measure.field' })

OperationField.register()