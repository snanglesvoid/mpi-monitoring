const keystone = require('keystone')


async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports.get = (req, res) => {
    const view = new keystone.View(req, res)

    view.render('projects-upload')
}

module.exports.post = async (req, res) => {
    console.log(req.body)

    let Project = keystone.list('Project').model
    let Themecluster = keystone.list('Themecluster').model
    let User = keystone.list('User').model

    function testTableHeader() {
        let header = req.body['0']
        if (!header || !Array.isArray(header)) return false
        if (header[0] !== 'Projektnummer') return false
        if (header[1] !== 'Themencluster') return false
        if (header[2] !== 'Projektname') return false
        if (header[3] !== 'Federführend') return false
        if (header[5] !== 'Ansprechperson 1') return false
        if (header[6] !== 'Name') return false
        if (header[7] !== 'Vorname') return false
        if (header[8] !== 'Passwort') return false
        return true
    }

    if (!testTableHeader()) {
        return res.json({
            status: 'error',
            message: 'Ungültiger Tabellen Header!'
        })
    }
    
    let errors = {}
    let counters = {
        project : {
            created: 0, updated: 0
        },
        themecluster : {
            created: 0
        },
        users : {
            created: 0
        }
    }
    await asyncForEach(Object.keys(req.body), async key => {
        if (key == '0') return
        console.log('each', key)
        try {
            let row = req.body[key]
            console.log(row)
            let projectId = row[0]
            let themecluster = row[1]
            let title = row[2]
            let institution = row[3]
            let writeEnabled = row[4] === 'ja' || row[4] === 'Ja'
            let email = row[5]
            let lastname = row[6]
            let firstname = row[7]
            let passwort = row[8] || '1234'

            let user = undefined
            if (email && firstname && lastname && passwort) {
                user = await User.findOne({ email: email })
                if (!user) {
                    user = new User({ email: email, password: passwort, 'name.first': firstname, 'name.last': lastname })
                    counters.users.created++
                    await user.save()
                }
            }

            let tc = await Themecluster.findOne({ title: themecluster })
            console.log(tc)
            if (!tc) {
                tc = new Themecluster({ title: themecluster })
                await tc.save()
                counters.themecluster.created++
            }

            let project = await Project.findOne({ projectId : projectId })
            if (!project) {
                project = new Project({ projectId : projectId })
                counters.project.created++
            } else {
                counters.project.updated++
            }
            project.title = title
            project.administration.institution = institution
            project.themecluster = tc._id
            if (user && writeEnabled) {
                project.writePermission.push(user._id)
            }
            await project.save()        

        }
        catch(error) {
            console.error(error)
            errors[key] = error.toString()
            return
        }
    })

    res.json({
        status: 'success',
        message: 'success',
        counters: counters,
        errors: errors
    })
}