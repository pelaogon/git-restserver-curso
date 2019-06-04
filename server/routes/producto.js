const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

// =====================
// Obtener todos los productos
// =====================
app.get('/productos', (req, res) => {
    //Trae todos los productos
    //populate: usuario categoria
    //paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                return res.response(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                productos
            })
        })

});

// =====================
// Buscar productos
// =====================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.response(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                productos
            })
        });

})

// =====================
// Obtener un producto por ID
// =====================
app.get('/productos/:id', (req, res) => {
    //populate: usuario categoria

    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'El ID no existe'
                    }
                })
            }
            res.json({
                ok: true,
                producto: productoDB
            })
        })
});

// =====================
// Crear un nuevo producto
// =====================
app.post('/productos', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    })

    producto.save((err, productoDB) => {
        if (err) {
            return res.response(500).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            return res.response(400).json({
                ok: false,
                err
            })
        }
        res.status(201).json({
            ok: true,
            producto: productoDB
        })
    })

});

// =====================
// actualizar un producto
// =====================
app.put('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: productoDB
        })
    })

});

// =====================
// Borrar un producto
// =====================
app.delete('/productos/:id', verificaToken, (req, res) => {
    //disponible true a falso

    let id = req.params.id;

    let cambioEstado = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, cambioEstado, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            })
        }
        res.json({
            ok: true,
            producto: productoBorrado,
            mensaje: 'Producto borrado'
        })
    })

});


module.exports = app;