const keystone = require('keystone')

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

exports = module.exports = async (req, res) => {
    const view = new keystone.View(req, res)
    let locals = res.locals

    let token = await keystone.list('RegistrationToken').model.findOne({ token: req.params.token }).exec()
    locals.token = token
    locals.validationErrors = {}

    if (!token) {
        req.flash('error', 'Ungültiger Registrierungs-Token, bitte wenden Sie sich an einen Administrator.')
        return view.render('errors/400')
    }
    if (token.used) {
        req.flash('error', 'Dieser Registrierungs-Token wurde bereits verwendet, bitte wenden Sie sich an einen Administrator')
        return view.render('errors/400')
    }

    view.on('post', async next => {
        const User = keystone.list('User').model
        let error = false

        if (!validateEmail(req.body.email)) {
            locals.validationErrors.email = 'Ungültige Email Adresse'
            error = true
        }
        if (!req.body.firstname) {
            locals.validationErrors.firstname = true
            error = true
        }
        if (!req.body.lastname) {
            locals.validationErrors.lastname = true
            error = true
        }
        if (req.body.password != req.body['password-confirm']) {
            locals.validationErrors.password = 'Passwörter stimmen nicht überein'
            error = true
        }
        if (!req.body.password) {
            locals.validationErrors.password = true
            error = true
        }

        if (error) return next()

        let userData = {
            email: req.body.email,
            password: req.body.password,
            name: {
                first: req.body.firstname,
                last: req.body.lastname
            }
        }

        let user = new User(userData)
        
        user.save(async err => {
            if (err) return next(err)
            if (err) return next();

            token.used = true
            await token.save()
			
			let onSuccess = function() {
				if (req.body.target && !/register|signin/.test(req.body.target)) {
					console.log('[register] - Set target as [' + req.body.target + '].');
					res.redirect(req.body.target);
				} else {
					res.redirect(`/account`);
				}
			}
			
			let onFail = function(e) {
				req.flash('error', 'Ein Fehler ist beim Login aufgetreten, bitte versuchen Sie es noch einmal');
				return next();
			}
			
			keystone.session.signin({ email: req.body.email, password: req.body.password }, req, res, onSuccess, onFail);
        })
    })

    view.render('register')
}