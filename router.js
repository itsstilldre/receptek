var express = require('express');
var router = new express.Router;
var passport = require('passport');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.flash('info', 'A kért tartalom megjelenítéséhez bejelentkezés szükséges');
    res.redirect('/auth/login');
}

router.route('/auth/login')
    .get(function (req, res) {
        res.render('auth/login');
    })
    .post(passport.authenticate('local-login', {
        successRedirect:    '/list',
        failureRedirect:    '/auth/login',
        failureFlash:       true,
        badRequestMessage:  'Hiányzó adatok'
    }));

router.route('/auth/signup')
    .get(function (req, res) {
        res.render('auth/signup');
    })
    .post(passport.authenticate('local-signup', {
        successRedirect:    '/add',
        failureRedirect:    '/auth/signup',
        failureFlash:       true,
        badRequestMessage:  'Hiányzó adatok'
    }));

router.use('/auth/logout', function (req, res) {
    req.logout();
    res.redirect('/auth/login');
});

// Itt kellene megoldani a végpontokat
router.get('/', function (req, res) {
    res.render('info');
});

router.route('/list')
    .get(ensureAuthenticated, function (req, res) {
        var result;
        if (req.query.query) {
            var keresettEtel = req.query.query;
            result = req.app.Models.food.find({
                    name: keresettEtel,
                    user: req.user.id
            });
        } else {
            result = req.app.Models.food.find({
                user: req.user.id
            });
        }
        result
            // Ha nem volt hiba fusson le ez
            .then(function (data) {
                res.render('list', {
                    data: data,
                    query: req.query.query,
                    uzenetek: req.flash()
                });
            })
            // Ha volt hiba fusson le ez
            .catch(function () {
                console.log('Hiba!!');
                throw 'error';
            });
    });
    
router.route('/list/:id')
    .get(ensureAuthenticated, function (req, res) {
        req.app.Models.food.find({
            id: req.params.id
        })
        .then(function (data) {
            res.render('list', {
                data: data,
                uzenetek: req.flash()
            });  
        })
        .catch(function () {
            console.log('Hiba a keresés közben!');
            throw 'error';
        });
    });
    
router.route('/description/:id')
    .get(ensureAuthenticated, function (req, res) {
        req.app.Models.food.findOne({
            id: req.params.id
        })
        .then(function (data) {
            res.render('recept', {
                data: data,
                uzenetek: req.flash()
            });  
        })
        .catch(function () {
            console.log('Hiba a leírás megjelenítése közben!');
            throw 'error';
        });
    });
    
router.route('/edit/:id')
    .get(ensureAuthenticated, function (req, res) {
        console.log(req.params.id);
        req.app.Models.food.findOne({
            id: req.params.id
        })
        .then(function (data) {
            res.render('edit', {
                food: data,
                uzenetek: req.flash()
            });  
        })
        .catch(function () {
            console.log('Hiba a szerkesztés megjelenítése közben!');
            throw 'error';
        });
    })
    .post(ensureAuthenticated, function (req, res) {
        req.checkBody('name', 'Írd be az étel nevét!')
            .notEmpty();
        
        if (req.validationErrors()) {
            req.validationErrors().forEach(function (error) {
                req.flash('error', error.msg);
            });
            // res.redirect('/edit/' + req.params.id);
            res.render('edit', {
                food: {
                    id: req.body.id,
                    name: req.body.name,
                    idotartam: req.body.idotartam,
                    leiras: req.body.leiras,
                    user: req.user.id
                },
                uzenetek: req.flash()
            });
        } else {
            console.log(req.body.id);
            req.app.Models.food.create({
                name: req.body.name,
                idotartam: req.body.idotartam,
                leiras: req.body.leiras,
                user: req.user.id
            })
            .then(function () {
                req.flash('success', 'Recept felvéve');
                console.log(req.body.id);
                console.log('/delete/' + req.body.id);
                res.redirect('/delete/' + req.body.id);
            })
            .catch(function () {
                req.flash('error', 'Recept felvétele sikertelen!');
                res.redirect('/edit/' + req.params.id);
            });
        }
    });
    
router.route('/add')
    .get(ensureAuthenticated, function (req, res) {
        res.render('add', {
            uzenetek: req.flash()
        });
    })
    .post(ensureAuthenticated, function (req, res) {
        req.checkBody('name', 'Írd be az étel nevét!')
            .notEmpty();
        
        if (req.validationErrors()) {
            req.validationErrors().forEach(function (error) {
                req.flash('error', error.msg);
            });
            res.redirect('/add');
        } else {
            req.app.Models.food.create({
                name: req.body.name,
                idotartam: req.body.idotartam,
                leiras: req.body.leiras,
                user: req.user.id
            })
            .then(function () {
                req.flash('success', 'Recept felvéve');
                res.redirect('/list');
            })
            .catch(function () {
                req.flash('error', 'Recept felvétele sikertelen!');
                res.redirect('/add');
            });
        }
    });
    
router.use('/delete/:id', ensureAuthenticated, function (req, res) {
    req.app.Models.food.destroy({ id: req.params.id })
        .then(function () {
            req.flash('success', 'Étel törölve');
            res.redirect('/list'); 
        })
        .catch(function () {
            req.flash('error', 'Étel törlése sikertelen');
            res.redirect('/list');
        });
    });


module.exports = router;