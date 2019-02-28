const keystone = require('keystone')

exports = module.exports = async (req, res) => {
    const view = new keystone.View(req, res)
    let locals = res.locals

    view.on('post', async next => {
        let onSuccess = function() {
            res.redirect('/account')
        }
        let onFail = function(e) {
            req.flash('error', 'Ein Fehler ist beim Login aufgetreten, bitte versuchen Sie es noch einmal')
            return next();
        }
        keystone.session.signin({ email: req.body.email, password: req.body.password }, req, res, onSuccess, onFail);

    })

    view.render('login')
}