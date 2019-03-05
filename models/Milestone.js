const keystone = require('keystone')
const Types = keystone.Field.Types

const Milestone = new keystone.List('Milestone', {
    defaultSort: 'index',
    nocreate: true,
    map: { name: 'key' },
})

Milestone.add({
    createdAt: { type: Types.Datetime, default: Date.now, noedit: true },
    updatedAt: { type: Types.Datetime, default: Date.now, noedit: true },
    evaluationPeriod: { type: Types.Relationship, ref: 'EvaluationPeriod', required: true, noedit: true },
    project: { type: Types.Relationship, ref: 'Project', noedit: true, index: true },
    projectId: { type: Types.Key, noedit: true, index: true },
    date: { type: Types.Date, required: true, default: Date.now, noedit: true },
    key: { type: Types.Text, noedit: true },
    description: { type: Types.Textarea, height: 100 },
    notes: { type: Types.Textarea, height: 100 },
    state: { type: Types.Select, options: ['Noch nicht angefangen', 'In Bearbeitung', 'Abgeschlossen'], default: 'Noch nicht angefangen' },
    evaluation: { type: Types.Select, options: [1,2,3,4,5] },
})

Milestone.defaultColumns = 'key, projectId, date, state, evaluation'

Milestone.schema.pre('save', async function(next) {
    console.log('Milestone pre save hook')
    try {
        let ep = await keystone.list('EvaluationPeriod').model.findById(this.evaluationPeriod).exec()
        // console.log('   EP = ', ep.key)
        let pr = await keystone.list('Project').model.findById(this.project).exec()
        // console.log('   PR = ', pr.title, pr.projectId)
        this.key = ep.key
        this.date = ep.date
        this.projectId = pr.projectId
        this.updatedAt = new Date()
    }
    catch (err) {
        return next(err)
    }
    finally {
        next(null)
    }
})

Milestone.register()