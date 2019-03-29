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
    console.log(datestr)
    try {
        let parts = datestr.split('/')
        if (parts.length !== 3) return undefined
        let d = new Date()
        let y = +parts[2]
        if (y < 2000) y += 2000
        d.setFullYear(y)
        d.setDate(+parts[1])
        d.setMonth(+parts[0] - 1)
        if (isNaN(d.getTime())) return undefined
        return d
    } catch(err) {
        return undefined
    }
}

module.exports.post = async (req, res) => {
    // console.log(req.body)
    const Project = keystone.list('Project').model
    const OperationField = keystone.list('OperationField').model
    const Themecluster = keystone.list('Themecluster').model
    
    let operationFields = await OperationField.find()
    let themeclusters = await Themecluster.find()

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
        measureField: { created: 0 },
        themecluster: { created: 0 },
    }
    let datarow

    datarow = data.find(row => row[1] === 'Bezeichnung der Maßnahme')
    if (!datarow || datarow.length < 3) {
        errors['Bezeichnung der Maßnahme'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let measureDescription = data.find(row => row[1] === 'Bezeichnung der Maßnahme')[2]
        if (measureDescription) {
            project.measure.description = measureDescription
            changes['Bezeichnung der Maßnahme'] = true
            console.log('Bezeichnung der Maßnahme: ', project.measure.description)
        }
    }

    datarow = data.find(row => row[1] === 'Handlungsfeld')
    if (!datarow || datarow.length < 3) {
        errors['Handlungsfeld'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let measureField = data.find(row => row[1] === 'Handlungsfeld')[2]
        if (measureField) {
            let opf = operationFields.find(x => x.title === measureField)
            if (!opf) {
                opf = new OperationField({ title: measureField })
                await opf.save()
                operationFields = await OperationField.find()
                updates.measureField.created += 1
            }
            project.measure.field = opf._id
            changes['Handlungsfeld'] = true
            console.log('Handlungsfeld: ', project.measure.field, opf)
        }
    }

    datarow = data.find(row => row[1] === 'Ziel der Maßnahme')
    if (!datarow || datarow.length < 3) {
        errors['Ziel der Maßnahme'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let measureGoal = data.find(row => row[1] === 'Ziel der Maßnahme')[2]
        if (measureGoal) {
            project.measure.goal = measureGoal
            changes['Ziel der Maßnahme'] = true
            console.log('Ziel der Maßnahme: ', project.measure.goal)
        }
    }

    datarow = data.find(row => row[1] === 'Anfangszeitpunkt')
    if (!datarow || datarow.length < 3) {
        errors['Anfangszeitpunkt'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
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
    }

    datarow = data.find(row => row[1] === 'Abschlusszeitpunkt')
    if (!datarow || datarow.length < 3) {
        errors['Abschlusszeitpunkt'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let measureEndDate = data.find(row => row[1] === 'Abschlusszeitpunkt')[2]
        if (measureEndDate) {
            let date = parseDate(measureEndDate)
            if (date !== undefined) {
                project.measure.endDate = date
                changes['Abschlusszeitpunkt'] = true
                console.log('Abschlusszeitpunkt: ', project.measure.endDate)
            }
            else {
                errors['Abschlusszeitpunkt'] = 'Ungültiges Datum.'
            }
        }
    }

    datarow = data.find(row => row[1] === 'Federführende Institution')
    if (!datarow || datarow.length < 3) {
        errors['Federführende Institution'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let administrationInstitution = data.find(row => row[1] === 'Federführende Institution')[2]
        if (administrationInstitution) {
            project.administration.institution = administrationInstitution
            changes['Federführende Institution'] = true
            console.log('Federführende Institution: ', project.administration.institution)
        }
    }

    datarow = data.find(row => row[1] === 'Name und Rolle der federführenden Person')
    if (!datarow || datarow.length < 3) {
        errors['Name und Rolle der federführenden Person'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let administrationName = data.find(row => row[1] === 'Name und Rolle der federführenden Person')[2]
        if (administrationName) {
            project.administration.name = administrationName
            changes['Name und Rolle der federführenden Person'] = true
            console.log('Name und Rolle der federführenden Person: ', project.administration.name)
        }
    }

    datarow = data.find(row => row[1] === 'Email')
    if (!datarow || datarow.length < 3) {
        errors['Email'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let administrationEmail = data.find(row => row[1] === 'Email')[2]
        if (administrationEmail) {
            project.administration.email = administrationEmail
            changes['Email'] = true
            console.log('Email: ', project.administration.email)
        }
    }

    datarow = data.find(row => row[1] === 'Telefon')
    if (!datarow || datarow.length < 3) {
        errors['Telefon'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let administrationPhone = data.find(row => row[1] === 'Telefon')[2]
        if (administrationPhone) {
            project.administration.phone = administrationPhone
            changes['Phone'] = true
            console.log('Phone: ', project.administration.phone)
        }
    }

    datarow = data.find(row => row[1] === 'Unterstützender Akteur 1')
    if (!datarow || datarow.length < 3) {
        errors['Unterstützender Akteur 1'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let support1Name = data.find(row => row[1] === 'Unterstützender Akteur 1')[2]
        if (support1Name) {
            project.support1.name = support1Name
            changes['Unterstützender Akteur 1'] = true
            console.log('Unterstützender Akteur 1: ', project.support1.name)
        }
    }

    datarow = data.find(row => row[1] === 'Unterstützender Akteur 2')
    if (!datarow || datarow.length < 3) {
        errors['Unterstützender Akteur 2'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let support2Name = data.find(row => row[1] === 'Unterstützender Akteur 2')[2]
        if (support2Name) {
            project.support2.name = support2Name
            changes['Unterstützender Akteur 2'] = true
            console.log('Unterstützender Akteur 1: ', project.support2.name)
        }
    }

    datarow = data.find(row => row[1] === 'Budget der Maßnahme')
    if (!datarow || datarow.length < 3) {
        errors['Budget der Maßnahme'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let budget = data.find(row => row[1] === 'Budget der Maßnahme')[2]
        if (budget) {
            project.budget = budget
            changes['Budget'] = true
            console.log('Budget: ', project.budget)
        }
    }

    datarow = data.find(row => row[1] === 'Output der Maßnahme')
    if (!datarow || datarow.length < 3) {
        errors['Output der Maßnahme'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let outputDescription = data.find(row => row[1] === 'Output der Maßnahme')[2]
        if (outputDescription) {
            project.output.description = outputDescription
            changes['Output der Maßnahme'] = true
            console.log('Output der Maßnahme: ', project.output.description)
        }
    }

    datarow = data.find(row => row[1] === 'Beitrag der Maßnahme zur Entwicklung der Industriestadt Berlin')
    if (!datarow || datarow.length < 3) {
        errors['Beitrag der Maßnahme zur Entwicklung der Industriestadt Berlin'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let outputContribution = data.find(row => row[1] === 'Beitrag der Maßnahme zur Entwicklung der Industriestadt Berlin')[2]
        if (outputContribution) {
            project.output.contribution = outputContribution
            changes['Beitrag der Maßnahme zur Entwicklung der Industriestadt Berlin'] = true
            console.log('Beitrag der Maßnahme zur Entwicklung der Industriestadt Berlin: ', project.output.contribution)
        }
    }

    datarow = data.find(row => row[1] === 'Projektindividuelle Indikatoren')
    if (!datarow || datarow.length < 3) {
        errors['Projektindividuelle Indikatoren'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let outputIndicators = data.find(row => row[1] === 'Projektindividuelle Indikatoren')[2]
        if (outputIndicators) {
            project.output.indicators = outputIndicators
            changes['Projektindividuelle Indikatoren'] = true
            console.log('Projektindividuelle Indikatoren', project.output.indicators)
        }
    }

    let mainFundingIndex = data.findIndex(row => row[1] === 'Beiträge der federführenden Institution')
    
    datarow = data[mainFundingIndex + 1]
    if (!datarow || datarow.length < 3) {
        errors['Beiträge der federführenden Institution: Finanzielle Mittel'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let mainFunding = data[mainFundingIndex + 1][2]
        if (mainFunding) {
            project.main.funding = mainFunding
            changes['Beiträge der federführenden Institution: Finanzielle Mittel'] = true
            console.log('Beiträge der federführenden Institution: Finanzielle Mittel: ', project.main.funding)
        }
    }

    datarow = data[mainFundingIndex + 2]
    if (!datarow || datarow.length < 3) {
        errors['Beiträge der federführenden Institution: Personal'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let mainPersonel = data[mainFundingIndex + 2][2]
        if (mainPersonel) {
            project.main.personel = mainPersonel
            changes['Beiträge der federführenden Institution: Personal'] = true
        }
    }

    datarow = data[mainFundingIndex + 2]
    if (!datarow || datarow.length < 3) {
        errors['Beiträge der federführenden Institution: Resourcen'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let mainResources = data[mainFundingIndex + 3][2]
        if (mainResources) {
            project.main.resources = mainResources
            changes['Beiträge der federführenden Institution: Resourcen'] = true
        }
    }

    let support1FundingIndex = data.findIndex(row => row[1] === 'Beiträge des unterstützenden Akteurs 1')

    datarow = data[support1FundingIndex + 1]
    if (!datarow || datarow.length < 3) {
        errors['Beiträge des unterstützenden Akteurs 1: Finanzielle Mittel'] = 'Zeile konnte nicht gefunden werden'
    } 
    else {
        let support1Funding = data[support1FundingIndex + 1][2]
        if (support1Funding) {
            project.support1.funding = support1Funding
            changes['Beiträge des unterstützenden Akteurs 1: Finanzielle Mittel'] = true
        }
    }
    datarow = data[support1FundingIndex + 2]
    if (!datarow || datarow.length < 3) {
        errors['Beiträge des unterstützenden Akteurs 1: Personal'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let support1Personel = data[support1FundingIndex + 2][2]
        if (support1Personel) {
            project.support1.personel = support1Personel
            changes['Beiträge des unterstützenden Akteurs 1: Personal'] = true
        }
    }
    datarow = data[support1FundingIndex + 3]
    if (!datarow || datarow.length < 3) {
        errors['Beiträge des unterstützenden Akteurs 1: Resourcen'] = 'Zeile konnte nicht gefunden werden'
    } 
    else {
        let support1Resources = data[support1FundingIndex + 3][2]
        if (support1Resources) {
            project.support1.resources = support1Resources
            changes['Beiträge des unterstützenden Akteurs 1: Resourcen'] = true
        }
    }

    let support2FundingIndex = data.findIndex(row => row[1] === 'Beiträge des unterstützenden Akteurs 2')
    datarow = data[support2FundingIndex + 1]
    if (!datarow || datarow.length < 3) {
        errors['Beiträge des unterstützenden Akteurs 2: Finanzielle Mittel'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let support2Funding = data[support1FundingIndex + 1][2]
        if (support2Funding) {
            project.support2.funding = support2Funding
            changes['Beiträge des unterstützenden Akteurs 2: Finanzielle Mittel'] = true
        }
    }
    datarow = data[support2FundingIndex + 2]
    if (!datarow || datarow.length < 3) {
        errors['Beiträge des unterstützenden Akteurs 2: Personal'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let support2Personel = data[support2FundingIndex + 2][2]
        if (support2Personel) {
            project.support2.personel = support2Personel
            changes['Beiträge des unterstützenden Akteurs 2: Personal'] = true
        }
    }
    datarow = data[support2FundingIndex + 3]
    if (!datarow || datarow.length < 3) {
        errors['Beiträge des unterstützenden Akteurs 2: Resourcen'] = 'Zeile konnte nicht gefunden werden'
    }
    else {
        let support2Resources = data[support2FundingIndex + 3][2]
        if (support2Resources) {
            project.support2.resources = support2Resources
            changes['Beiträge des unterstützenden Akteurs 2: Resourcen'] = true
        }
    }

    let tcs = []
    let tcindex = data.findIndex(row => row[1] === 'Beitrag der Maßnahme zu Themencluster')
    if ( data[tcindex] && data[tcindex].length > 2 &&
         data[tcindex+1] && data[tcindex+1].length > 2 &&
         data[tcindex+2] && data[tcindex+2].length > 2
    ) {
        let tc1n = data[tcindex][2]
        if (tc1n && tc1n !== '[Bitte auswählen]') {
            let tc1 = themeclusters.find(x => x.title === tc1n)
            if (!tc1) {
                tc1 = new Themecluster({ title: tc1n })
                await tc1.save()
                themeclusters = await Themecluster.find()
                updates.themecluster.created += 1
            }
            tcs.push(tc1._id)
        }
        let tc2n = data[tcindex+1][2]
        if (tc2n && tc2n !== '[Bitte auswählen]' && data[tcindex+1][1] === '') {
            let tc2 = themeclusters.find(x => x.title === tc2n)
            if (!tc2) {
                tc2 = new Themecluster({ title: tc2n })
                await tc2.save()
                themeclusters = await Themecluster.find()
                updates.themecluster.created += 1
            }
            tcs.push(tc2._id)
        }
        let tc3n = data[tcindex+2][2]
        if (tc3n && tc3n !== '[Bitte auswählen]' && data[tcindex+1][1] === '' && data[tcindex+2][1] === '') {
            let tc3 = themeclusters.find(x => x.title === tc3n)
            if (!tc3) {
                tc3 = new Themecluster({ title: tc3n })
                await tc3.save()
                themeclusters = await Themecluster.find()
                updates.themecluster.created += 1
            }
            tcs.push(tc3._id)
        }
    
        console.log('tcs', tcs, tc1n, tc2n, tc3n)
    
        project.output.themecluster = tcs

    }
    else {
        errors['Temencluster'] = 'Zeile konnte nicht gefunden werden'
    }

    try {
        await project.save()
        res.json({
            status: 'success',
            message: 'Änderungen wurden übernommen',
            projectId: project.projectId,
            id: project._id,
            changes: changes,
            updates: updates,
            errors: errors
        })
    } 
    catch(error) {
        res.json({
            status: 'error',
            message: JSON.stringify(error)
        })
    }
 
}