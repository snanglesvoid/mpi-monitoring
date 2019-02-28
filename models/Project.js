const keystone = require('keystone')
const Types = keystone.Field.Types

const Project = new keystone.List('Project', {
    autokey: { path: 'slug', from: 'title', unique: true },
    map: { name: 'title' },
})

Project.add({
    title: { type: Types.Text, required: true, index: true },
    projectId: { type: Types.Key, required: true, initial: true },
    createdAt: { type: Types.Datetime, default: Date.now, noedit: true },
    updatedAt: { type: Types.Datetime, default: Date.now, noedit: true },

    writePermission: { type: Types.Relationship, ref: 'User', many: true },
    readPermission: { type: Types.Relationship, ref: 'User', many: true },

    notes: { type: Types.Html, wysiwyg: true, height: 200 }

}, 'Measure', {

    measure: {
        description: { type: Types.Text },
        field: { type: Types.Relationship, ref: 'OperationField' },
        goal: { type: Types.Textarea, height: 100 },
        startDate: { type: Types.Date },
        endDate: { type: Types.Date },
    },

}, 'Administration', {
    administration : {
        institution: { type: Types.Text },
        name: { type: Types.Text },
        email: { type: Types.Email },
        phone: { type: Types.Text },
    }
}, 'Contributions', {

    budget: { type: Types.Textarea, height: 100 },
    main : {
        funding: { type: Types.Textarea, height: 100 },
        personel: { type: Types.Textarea, height: 100 },
        resources: { type: Types.Textarea, height: 100 },
    },
    support1: {
        name: { type: Types.Text },
        funding: { type: Types.Textarea, height: 100 },
        personel: { type: Types.Textarea, height: 100 },
        resources: { type: Types.Textarea, height: 100 },
    },
    support2: { 
        name: { type: Types.Text },
        funding: { type: Types.Textarea, height: 100 },
        personel: { type: Types.Textarea, height: 100 },
        resources: { type: Types.Textarea, height: 100 },
    }

}, 'Output', {
    output: {
        description: { type: Types.Textarea, height: 100 },
        contribution: { type: Types.Textarea, height: 100 },
        themecluster: { type: Types.Relationship, ref: 'Themecluster', many: true },
        indicators: { type: Types.Textarea, height: 100 },
    }
})

Project.defaultColumns = 'title, projectId, updatedAt'

Project.relationship({ ref: 'Milestone', path: 'milestones', refPath: 'project' })

Project.schema.pre('save', async function(next) {
    console.log('Project pre save hook')
    try {
        this.updatedAt = new Date()
        //update Milestones
        let milestones = await keystone.list('Milestone').model.find({ project: this.id }).exec()
        milestones.forEach(async x => await x.save())
    }
    catch(err) {
        return next(err)
    }
    finally {
        next(null)
    }
})

Project.register()