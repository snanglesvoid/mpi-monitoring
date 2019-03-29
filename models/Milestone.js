const keystone = require('keystone')
const Types = keystone.Field.Types

const Milestone = new keystone.List('Milestone', {
    defaultSort: 'date',
    nocreate: true,
    map: { name: 'key' },
})

const storageAdapter = new keystone.Storage({
    adapter: keystone.Storage.Adapters.FS,
    fs: {
        path: './data/files/',
        publicPath: './data/files'
    }
})

Milestone.add({
    createdAt: { type: Types.Datetime, default: Date.now, noedit: true },
    updatedAt: { type: Types.Datetime, default: Date.now, noedit: true },
    evaluationPeriod: { type: Types.Relationship, ref: 'EvaluationPeriod', required: true, noedit: true },
    project: { type: Types.Relationship, ref: 'Project', noedit: true, index: true },
    projectId: { type: Types.Text, noedit: true, index: true },
    date: { type: Types.Date, required: true, default: Date.now, noedit: true },
    key: { type: Types.Text, noedit: true },
    description: { type: Types.Textarea, height: 100 },
    deviationMeasure: { type: Types.Textarea, height: 100 },
    challenges: { type: Types.Textarea, height: 100 },
    contributions: { type: Types.Textarea, height: 100 },
    needSupport: { type: Types.Boolean },
    notes: { type: Types.Textarea, height: 100 },
    state: { type: Types.Select, options: ['Noch nicht angefangen', 'In Bearbeitung', 'Abgeschlossen', 'Bearbeitung eingestellt'], default: 'Noch nicht angefangen' },
    state2: { type: Types.Select, options: [
        { value: 1, label: 'Starke Abweichung von Plan' }, 
        { value: 2, label: 'Abweichung vom Plan' },
        { value: 3, label: 'Weitgehend im Plan' },
        { value: 4, label: 'Voll im Plan' } ] },
    evaluation: { type: Types.Select, options: [ 
        { value: 1, label: 'Meilensteine wurden nicht erreicht' }, 
        { value: 2, label: 'Meilensteine wurden teilweise erreicht' }, 
        { value: 3, label: 'Meilensteine wurden weitgehend erreicht' },
        { value: 4, label: 'Meilensteine wurden vollständig erreicht' }] },
    documents: { type: Types.File, storage: storageAdapter }
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