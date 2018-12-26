const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');   //Generate ID
const checkAuth = require('../middleware/checkauth');
const Order = require('../models/order');
// const Category = require('../models/category');
const Barang = require('../models/barang');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const multer = require('multer');
var Cart = require('../models/cart');
// Routesnya /orders

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toDateString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        // reject a file
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


//nampilin semua
router.get('/', function (req, res, next) {
    var successMsg = req.flash('success')[0];
    Barang.find(function (err, docs) {
        var barangChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            barang.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/index', {title: 'Shopping Cart', barangs: barangChunks, successMsg: successMsg, noMessages: !successMsg});
    });
});

//nambah cart
router.get('/add-to-cart/:id', function(req, res, next) {
    var barangId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Barang.findById(barangId, function(err, barang) {
       if (err) {
           return res.redirect('/');
       }
        cart.add(barang, barang.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
    });
});


//Ngurangin cart
router.get('/reduce/:id', function(req, res, next) {
    var barangId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(barangId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

//ngapus cart
router.get('/remove/:id', function(req, res, next) {
    var barangId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(barangId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

//bikin cart
router.get('/shopping-cart', function(req, res, next) {
   if (!req.session.cart) {
       return res.render('shop/shopping-cart', {barangs: null});
   } 
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {barangs: cart.generateArray(), totalPrice: cart.totalPrice});
});

//get checkout
router.get('/checkout', checkAuth, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

//bikin order
router.post('/checkout', checkAuth, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
        var order = new Order({
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            date_created : new Date().addHours(7),
            userId : decode.userId,
        });
        order.save(function(err, result) {
            req.flash('success', 'Berhasil membeli');
            req.session.cart = null;
            res.redirect('/');
        });
  

});


// //Get Orders
// router.get('/', checkAuth, (req, res, next) => {
//   const token = req.headers.authorization.split(" ")[1];
//   const decode = jwt.verify(token, "bismillah");
//   const userId = decode.userId
//     Order.find({userId : userId})
//         // .select('category date budget address description _id')
//         .populate('category', 'name')
//         .exec()
//         .then(docs => {
//             res.status(200).json({
//                 count: docs.length,
//                 orders: docs.map(doc => {
//                     return {
//                         _id: doc._id,
//                         category: doc.category,
//                         date: doc.date,
//                         budget: doc.budget,
//                         address: doc.address,
//                         description: doc.description,
//                         request: {
//                             type: "GET",
//                             url: 'http://localhost:3000/orders/' + doc._id
//                         }
//                     }
//                 })
//             });
//         })
//         .catch(err => {
//             res.status(500).json({
//                 error: err
//             });
//         });
// });

// Date.prototype.addHours = function(h){
//     this.setHours(this.getHours()+h);
//     return this;
// }

// //Post Orders
// router.post('/:IdBarang', checkAuth, (req, res, next) => {
//   const token = req.headers.authorization.split(" ")[1];
//   const decode = jwt.verify(token, "bismillah");
//   const id = req.params.IdBarang;

//   Barang.findById(id)
//     .then(barang => {
//         if(barang.qty == 0){
//             return res.status(404).json({
//                 message: "Stok Habis"
//             });
//         } else if(barang.qty < req.body.qty){
//             return res.status(404).json({
//                 message: "Stok Kurang"
//             });
//         }

//         else if (barang.qty < req.body.qty){
//             return res.status(404).json({
//                 message: "Stok kurang"
//             });
//         }
//             const order = new Order ({
//                 _id: mongoose.Types.ObjectId(),
//                 date_created : new Date().addHours(7),
//                 address : req.body.address,
//                 qty : req.body.qty,
//                 userId : decode.userId,
//                 IdBarang : id
//             });

//             const stok = barang.qty - order.qty;
//             console.log(stok);
//             Barang.update({_id:id}, {$set: {qty : stok}});
//             console.log(barang.qty);
//             const stok = barang.qty - order.qty;
//             console.log(stok);

//             Barang.updateOne({_id:id}, {$set: {qty : stok}});
            
//             return order.save()



            
//         })
//         .then(result => {
//             res.status(201).json({
//                 message: "Order stored",
//                 createdOrder: {},
//                 request: {
//                     type : "GET",
//                     url: 'http://localhost:3000/orders/' + result._id
//                 }
//             });
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({
//                 error: err
//             });
//         });
    
// });

// //Get By OrderId
// router.get('/:orderId', checkAuth, (req, res, next) => {

//     Order.findById(req.params.orderId)
//         // .populate('category', 'name')
//         .exec()
//         .then(order => {
//             if(!order) {
//                 return res.status(404).json({
//                     message: "Order not Found"
//                 });
//             }
//             res.status(200).json({
//                 order: order,
//                 request: {
//                     type: 'GET',
//                     url: 'http://localhost:3000/orders'
//                 }
//             });
//         })
//         .catch(err => {
//             res.status(500).json({
//                 error: err
//             });
//         });
// });


//Delete Orders
// router.post('/delete/:orderId', checkAuth, (req, res, next) => {
//     const id = req.params.orderId;
//     Order.update({ _id: id }, { $set: {status : "0"} })
//         .exec()
//         .then(result => {
//             res.status(200).json({
//                 message: "Order Rejected",
//                 request: {
//                     type: "PATCH",
//                     url: "http://localhost:3000/events" + id
//                 }
//             });
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({
//                 error: err
//             });
//         });
// });


//Upload Bukti Pembayaran
router.post('/upload/:IdBarang', upload.single('image'), (req, res, next) => {
    // const token = req.headers.authorization.split(" ")[1];
    // const decode = jwt.verify(token, "bismillah");
    const id = req.params.IdBarang;
  
    Order.update({_id: id}, {$set: {image : req.file.path}})
          .then(result => {
              res.status(201).json({
                  message: "Uploaded",
                  createdOrder: {},
                  request: {
                      type : "GET",
                      url: 'http://localhost:3000/orders/' + result._id
                  }
              });
          })
          .catch(err => {
              console.log(err);
              res.status(500).json({
                  error: err
              });
          });
      
  });


module.exports = router;
