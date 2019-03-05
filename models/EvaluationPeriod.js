const keystone = require('keystone')
const Types = keystone.Field.Types
const async = require('async')

const EvaluationPeriod = new keystone.List('EvaluationPeriod', {
    map: { name: 'key' }
})

EvaluationPeriod.add({
    key: { type: Types.Text, required: true, initial: true },
    date: { type: Types.Date, required: true, default: () => {
        let d = new Date()
        d.setDate(d.getDate() + 7)
        return d
    }},
    createdAt: { type: Types.Datetime, default: Date.now, noedit: true },
    updatedAt: { type: Types.Datetime, default: Date.now, noedit: true },
})

EvaluationPeriod.defaultColumns = 'key, date, updatedAt'

EvaluationPeriod.relationship({ ref: 'Milestone', path: 'milestones', refPath: 'evaluationPeriod' })

EvaluationPeriod.schema.pre('save', async function(next) {
    console.log('EvaluationPeriod pre save hook')
    try {
        this.updatedAt = new Date()

        let projects = await keystone.list('Project').model.find().exec()
        let milestones = (await keystone.list('Milestone').model.find({ evaluationPeriod: this.id }).exec())
        let Milestone = keystone.list('Milestone').model

        projects.forEach(async p => {
            let m = milestones.find(x => x.project.equals(p.id))
            if (!m) {
                m = new Milestone()
            }
            m.set({
                project: p.id,
                evaluationPeriod: this.id,
                date: this.date
            })
            await m.save()
        })
    }
    catch(err) {
        return next(err)
    }
    finally {
        next(null)
    }
})

EvaluationPeriod.register()
