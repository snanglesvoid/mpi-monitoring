const keystone = require('keystone')
const Types = keystone.Field.Types

const Themecluster = new keystone.List('Themecluster', {
    map: { name: 'title' },
    autokey: { path: 'slug', from: 'title', unique: true }
})

Themecluster.add({
    title: { type: Types.Text, required: true, index: true }
})

Themecluster.defaultColumns = 'title'

Themecluster.relationship({ ref: 'Project', path: 'projects', refPath: 'output.themecluster'})

Themecluster.register()