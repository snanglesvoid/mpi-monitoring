const keystone = require('keystone')
const Types = keystone.Field.Types

const Page = new keystone.List('Page', {
    map: { name: 'title' },
    autokey: { path: 'slug', from: 'title', unique: true }
})

Page.add({
    title: { type: Types.Text, required: true, initial: true },
    content: { type: Types.Html, wysisyg: true, height: 300 }
})

Page.register()