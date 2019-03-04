const keystone = require('keystone')

exports = module.exports = (req, res) => {
    const view = new keystone.View(req, res)
    let locals = res.locals

    view.on('post',  next => {
        let user = req.user
        keystone.session.signin({ email: req.user.email, password: req.body.oldPassword }, req, res, 
            async function success() {
                console.log('success')
                if (req.body.newPassword !== req.body.newPasswordConfirm) {
                    req.flash('error', 'Passwörter stimmen nicht überein')
                    return next()
                }
                try {
                    user.password = req.body.newPassword
                    await user.save()
                    req.flash('success', 'Ihr Passwort wurde erfolgreich geändert.')
                }
                catch(error) {
                    console.error(error)
                    return next(error)
                }
                finally {
                    next()
                }
            },
            async function fail(e) {
                req.flash('error', 'Ungültiges Passwort!')
                return next()
            }
        )
    })

    view.render('changePassword')
}