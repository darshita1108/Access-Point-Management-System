const mongoose = require('mongoose');
const couponCode = require('coupon-code');//generate unique coupon codes
const Promise = require('bluebird');//bluebird is for promise
var express=require('express');

var app=express();

app.use('/static',express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

app.get('/coupon',function(req,res){
	res.render('coupon');
});

app.get('/user',function(req,res){
  res.render('user');
});
app.get('/home',function(req,res){
  res.render('home');
});
app.get('/',function(req,res){
 res.render('first');
});
app.get('/admin',function(req,res){
  res.render('admin');
});
app.get('/adduser',function(req,res){
  res.render('user');
});

app.get('/addlocker',function(req,res){
  res.render('locker');
});

app.get('/orderstatus',function(req,res){
  res.render('orderstatus');
});
app.get('/findusers',function(req,res){
  res.render('findusers');
});
app.get('/additem',function(req,res){
  res.render('item');
});
app.get('/generate',function(req,res){
  res.render('generate');
});
app.get('/order',function(req,res){
  res.render('order');
});


const port = process.env.PORT || 3003;
app.listen(port,()=>{
  console.log('server started on port ${port}');
});

//connect to database
const keys=require('./config/keys');
mongoose.connect(keys.mongoURI);

const {users}=require('./models/user.js');
const {orders}=require('./models/order.js');
const {items}=require('./models/item.js');
const {lockers}=require('./models/locker.js');
const {coupons}=require('./models/coupon.js');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));


var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',
  httpAdapter: 'https', // Default
  apiKey: keys.key, // for Mapquest, OpenCage, Google Premier
  formatter: null    
};

var geocoder=NodeGeocoder(options);

   app.post("/addlocker", function(request, response) {

       console.log(request.body); 
  lockers.findOne({
      locker_id:request.body.locker_id,
    }).then(locker=>{
      if(locker)
      {
      response.render('created.ejs',{
          r:'Already exists!'
        });
      }
      else{
        geocoder.geocode(request.body.address)
      .then(function(res) {
       console.log(res);
       console.log(res[0].latitude);
       var latitude=res[0].latitude;
       var longitude=res[0].longitude;
       new lockers({
       locker_id:request.body.locker_id,
       length:request.body.length,
       breadth:request.body.breadth,
       height:request.body.height,
       address:request.body.address,
       latitude:latitude,
       longitude:longitude
        })
        .save()
        .then(console.log('saved'));
        console.log("running");
       })
       .catch(function(err) {
    console.log(err);
      });
       response.render('created.ejs',{
          r:'Done!!'
        });
      }
    });
     
 });
//distance between 2 locations
var rad = function(x) {
  return x * Math.PI / 180;
};
 var getDistance = function(p1lat, p1lng, p2lat, p2lng) {
   var R = 6378137; 
  var dLat = rad(p2lat - p1lat);
  var dLong = rad(p2lng - p1lng);
  // console.log(dLat);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1lat)) * Math.cos(rad(p2lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  d = d/1000;
  return d;
};
app.post("/find",function(req,response){
console.log(req.body.address);
var lat1=req.body.latitude;
var long1=req.body.longitude;

geocoder.geocode(req.body.address)
      .then(function(res) {
       console.log(res);
       console.log(res[0].latitude);
       var lat2=res[0].latitude;
       var long2=res[0].longitude;
       var r=getDistance(lat1,long1,lat2,long2);
       response.send('The distance is '+r);
       })
       .catch(function(err) {
    console.log(err);
      });
});

   app.post("/additem", function(request, response) {
       var newitem={
       item_id:request.body.item_id,
       length:request.body.length,
       breadth:request.body.breadth,
       height:request.body.height,
       price:request.body.price,
       category:request.body.category,
    }
 items.findOne({
      item_id:request.body.item_id
    }).then(item=>{
      if(item)
      {
         response.render('created.ejs',{
          r:'Already exists!!'
        });
      }
      else{
        //create user
       new items(newitem)
        .save()
        .then(console.log('saved'));
         response.render('created.ejs',{
          r:'Done!!'
        });
      }
    });
 });


app.post("/nearby", function(request, response) {
  console.log(request);
       var m=request.body.islocker;
       var address=request.body.address;
       var delivery=request.body.delivery;
       var email=request.body.email;
       console.log(email);
       lockers.findOne(function(err, data) {
        var latitude=data.latitude;
        console.log(latitude);
       });
       if(delivery=='locker')
       {
       if(m==0)
       {
         lockers.find({}, function(err, data) {
        response.render('nearby.ejs', {
            address : address,
            items: data,
            email:request.body.email,
            id:request.body.id,
            price:request.body.price
        });
    });
       }
       else{
            response.render('created.ejs',{
              r:'Not fit for locker!'
       });
      }
    }
      else{
        response.render('created.ejs',{
              r:'Welcome!'
       });
      }
 });


app.post("/entercode",function(req,res){
console.log(req);
var email=req.body.email;
var id=req.body.id;
var price=req.body.price;

 coupons.findOne({
      user_email:req.body.email
    }).then(coupon=>{
      if(coupon)
      {
        var type=coupon.type;
        var code=coupon.code;
       console.log(type);
       console.log(code);
        res.render("entercode",{
        code:code,
        type:type,
        price:price
         });

      }
      else{
       res.render("created.ejs",{
        r:'No coupon is there!!'
       });
      }
    });


});

app.post("/discount",function(req,res){
console.log(req);
var ucode=req.body.usercode;
var code=req.body.code;
var type=req.body.type;
var price=req.body.price;
if(ucode==code)
{
  coupons.findOneAndRemove({code: code}, function(err){
    if(err)
      console.log("err");
    console.log("removed");
  });

  if(type==1)
    {
      var p=price/10;
      price=price-p;

    }
    if(type==2)
    {
      var p=price/5;
      price=price-p;

    }
    if(type==3)
    {
      var p=price/3.33;
      price=price-p;
  
    }
    res.render("discount.ejs",{
    price:price
    });
}
else{
res.render("created.ejs",{
  r:'Wrong coupon code!'
});
}

});

   app.post("/order", function(request, response) {
       console.log(request.body); 
       var newusers={
       name:{first:request.body.firstname,last:request.body.lastname},
       email:request.body.email,
       phone:request.body.phone,
       address:request.body.address,
       unattended_deliveries:0,
       gender:request.body.gender
    }
 users.findOne({
      email:request.body.email
    }).then(user=>{
      if(user)
      {
      
      }
      else{
       new users(newusers)
        .save()
        .then(console.log('saved'));
      }
    });
        items.find({}, function(err, data) {
        // note that data is an array of objects, not a single object!
        response.render('order.ejs', {
            email : request.body.email,
            fname:request.body.firstname,
            lname:request.body.lastname,
            items: data
        });
    });
      });
  
app.post("/buy", function(request, response) {
       console.log(request.body); 
       var r='ordered';
       var neworders={
       order_id:request.body.id,
       email:request.body.email,
       status:r
    }
      orders.findOne({
      email:request.body.email,
      order_id:request.body.id
    }).then(order=>{
      if(order)
      {
      }
      else{
       new orders(neworders)
        .save()
        .then(console.log('saved'));
        }
    });
        items.find({}, function(err, data) {
        response.render('buy.ejs', {
            email : request.body.email,
            id:request.body.id,
            length:request.body.length,
            breadth:request.body.breadth,
            height:request.body.height,
            category:request.body.category,
            price:request.body.price
        });
    });
  });

app.post("/orderstatus", function(request, response) {
       console.log(request.body); 
      orders.findOne({
      order_id:request.body.id
    }).then(order=>{
      if(order)
      {
        console.log(order);
        console.log(order);
        var myquery = { order_id: request.body.id };
        var newvalues = { $set: {status: request.body.status } };
        orders.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
  });
      }
    });
    users.findOne({
      email:request.body.email
    }).then(user=>{
      if(user)
      {
        console.log(user);
        var myquery = { email: request.body.email };
        var newvalues = { $inc: {unattended_deliveries:1 } };
        if(request.body.status=='unattended'){
        users.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
  });}
      }
    });
    response.render('created.ejs',{
      r:'updated'
    });
  });

app.post("/generate", function(request, response) {
      var threshold=request.body.threshold;
      var query = { unattended_deliveries: { $gt: threshold } };
      users.find(query,function(err, result) {
      if (err) throw err;
     console.log(result);
     response.render('generate.ejs',{
      result:result
     });
  });
  });

//generating unique coupon codes////
var count = 0;
// this is code that checks uniqueness and returns a promise
function check(code) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      count++;
      // first resolve with false, on second try resolve with true
      if (count === 1) {
        console.log(code + ' is not unique');
        resolve(false);
      } else {
        console.log(code + ' is unique');
        resolve(true);
      }
    }, 1000);
  });
}

var generateUniqueCode = Promise.method(function() {
  var code = couponCode.generate({parts:3,partLen:5});
  return check(code)
    .then(function(result) {
      if (result) {
        return code;//if it is unique then return the code
      } else {
        return generateUniqueCode();//else generate a new code 
      }
    });
});



app.post('/coupon', function (req, res) {
  console.log('Moved to add page');
   var c=req.body.coupon;
  for(var i=0;i<c;i++)
  {
  generateUniqueCode().then(function(code) {
  new coupons({
    code:code,
    user_email:"not added"
  }).save()
  .then(console.log('saved'));
     });
  }
  res.render('created.ejs',{
    r:'done'
  });
});

var nodemailer=require('nodemailer');
var transporter=nodemailer.createTransport({
service:'gmail',
auth:{
  user:'aggarwaldarshita@gmail.com',
  pass:keys.password
}
});

app.post('/created', function (req, res) {
  console.log('Moved to add page');
    coupons.findOne({
      user_email:req.body.email
    }).then(coupon=>{
      if(coupon)
      {
        console.log("already has a code");
      }
    else{
  generateUniqueCode().then(function(code) {
  new coupons({
    code:code,
    user_email:req.body.email,
    type:req.body.type
  }).save()
  .then(console.log('saved'));
  console.log("hey");
   var mailOptions={
    from:'aggarwaldarshita@gmail.com',
    to:req.body.email,
    subject:'sending email',
    html: '<p>Your code is</p>'+code
   };
   transporter.sendMail(mailOptions,function(err,info){
       if(err){
        console.log(err);
       }
       else{
        console.log('email sent'+info.response);

       }
   });
     });
        }
      });
  res.render("created.ejs",{
    r:'Done!!'
  });
});
