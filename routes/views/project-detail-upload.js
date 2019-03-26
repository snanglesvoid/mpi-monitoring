const keystone = require('keystone')

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports.get = (req, res) => {
    const view = new keystone.View(req, res)
    view.render('project-detail-upload')
}

function parseDate(datestr) {
    let parts = datestr.split('/')
    if (parts.length !== 3) return undefined
    let d = new Date()
    let y = +parts[2]
    if (y < 2000) y += 2000
    d.setFullYear(y)
    d.setDate(+parts[0])
    d.setMonth(+parts[1])
    if (isNaN(Date.getTime())) return undefined
    return d
}

module.exports.post = async (req, res) => {
    // console.log(req.body)
    const Project = keystone.list('Project').model
    const OperationField = keystone.list('OperationField').model
    
    let operationFields = await OperationField.find()

    let projectId = req.body.projectId

    if (!projectId) {
        return res.json({
            status: 'error',
            message: 'Es wurde keine Projekt ID angegeben.'
        })
    }

    let project = await Project.findOne({ projectId : projectId })

    if (!project) {
        return res.json({
            status: 'error',
            message: 'Kein Projekt zu der Id ' + projectId + ' konnte gefunden werden.'
        })
    }

    let data = req.body.data
    let errors = {}
    let changes = {}
    let updates = {
        measureField: { created: 0 }
    }

    let measureDescription = data.find(row => row[1] === 'Bezeichnung der Maßnahme')[2]
    if (measureDescription) {
        project.measure.description = measureDescription
        changes['Bezeichnung der Maßnahme'] = true
        console.log('Bezeichnung der Maßnahme: ', project.measure.description)
    }

    let measureField = data.find(row => row[1] === 'Handlungsfeld')[2]
    if (measureField) {
        let opf = operationFields.find(x => x.title === measureField)
        if (!opf) {
            opf = new OperationField({ title: measureField })
            await opf.save()
            operationFields = await OperationField.find()
        }
        project.measure.field = opf._id
        changes['Handlungsfeld'] = true
        console.log('Handlungsfeld: ', project.measure.field, opf)
    }

    let measureGoal = data.find(row => row[1] === 'Ziel der Maßnahme')[2]
    if (measureGoal) {
        project.measure.goal = measureGoal
        changes['Ziel der Maßnahme'] = true
        console.log('Ziel der Maßnahme: ', project.measure.goal)
    }

    let measureStartDate = data.find(row => row[1] === 'Anfangszeitpunkt')[2]
    if (measureStartDate) {
        let date = parseDate(measureStartDate)
        if (date !== undefined) {
            project.measure.startDate = date
            changes['Anfangszeitpunkt'] = true
            console.log('Anfangszeitpunkt: ', project.measure.startDate)
        }
        else {
            errors['Anfangszeitpunkt'] = 'Ungültiges Datum.'
        }
    }
    let measureEndDate = data.find(row => row[1] === 'Abschlusszeitpunkt')
    if (measureEndDate) {

    }
 
    res.json({
        status: 'success',
        message: JSON.stringify(project),
        changes: changes,
        updates: updates,
        errors: errors
    })
}