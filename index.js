const mongoose = require('mongoose');

const couponCode = require('coupon-code');//generate unique coupon codes
const Promise = require('bluebird');//bluebird is for promise

//using api voucher-code-generator
var express=require('express');
var app=express();

app.use('/static',express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

app.get('/coupon',function(req,res){
	res.render('coupon');
});
app.get('/',function(req,res){
  res.render('home');
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

app.listen(3003,function(){
	console.log('listening to port 3003');
});
//var voucher_codes = require('voucher-code-generator');

//connect to database
mongoose.connect('mongodb://user1:user123@ds217125.mlab.com:17125/acms');

//create a schema or a blueprint
//schema of users
var userSchema=new mongoose.Schema({
  //id:Number,
  name:{
  	first:String,
  	last:{type:String,trim:true}
  },
  email:String,
  phone:Number,
  address:String,
  unattended_deliveries:Number,
  gender:String,

});

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
//userSchema.createIndex({id:1},{unique:true});
var users=mongoose.model('users',userSchema);
/**
var item1=users({
  id:1,
 name:{first:'Darshita',last:'Aggarwal'},
 email:'aggarwaldarshita@gmail.com',
 phone:9643428394,
 address:'H.no 456,sector-10',
 unattended_deliveries:5,
 gender:'female'

}).save(function(err){
	if(err)
		throw err;
	console.log('item1 saved');
});


//schema of lockerrrrrrrrrrs
var lockerSchema=new mongoose.Schema({
 locker_id:Number,
 length:Number,
 breadth:Number,
 height:Number,
 address:String
});

//lockerSchema.index({id:1},{unique:true});

var lockers=mongoose.model('lockers',lockerSchema);

/**var locker1=lockers({
 locker_id:1,
}).save(function(err){
	if(err)
		throw err;
	console.log('locker1 saved');
});
**/
app.use(bodyParser.urlencoded({extended : true}));
   app.post("/addlocker", function(request, response) {
       console.log(request.body); 
       var newlocker={
       locker_id:request.body.locker_id,
       length:request.body.length,
       breadth:request.body.breadth,
       height:request.body.height,
       address:request.body.address,
    }
 lockers.findOne({
      locker_id:request.body.locker_id
    }).then(locker=>{
      if(locker)
      {
        //return user
        //console.log('user exists');
        response.send('locker exists');
      }
      else{
        //create user
       new lockers(newlocker)
        .save()
        .then(console.log('saved'));
        response.send('done');
      }
    });
    
 });

var itemSchema=new mongoose.Schema({
 item_id:Number,
 length:Number,
 breadth:Number,
 height:Number,
 price:Number,
 category:String,
});

var items=mongoose.model('items',itemSchema);

app.use(bodyParser.urlencoded({extended : true}));
   app.post("/additem", function(request, response) {
       //console.log(request.body); 
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
        //return user
        //console.log('user exists');
        response.send('item exists');
      }
      else{
        //create user
       new items(newitem)
        .save()
        .then(console.log('saved'));
        response.send('done');
      }
    });
    
 });

app.use(bodyParser.urlencoded({extended : true}));
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
        //return user
        //console.log('user exists');
        //response.send('user exists');
      }
      else{
        //create user
       new users(newusers)
        .save()
        .then(console.log('saved'));
        //response.send('done');
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
  
var orderSchema=new mongoose.Schema({
 order_id:Number,
 email:String,
 status:String
});

//lockerSchema.index({id:1},{unique:true});

var orders=mongoose.model('orders',orderSchema);

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
        // note that data is an array of objects, not a single object!
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
    response.send("updated");
  });

app.post("/generate", function(request, response) {
    //console.log(request.body.threshold);
      var threshold=request.body.threshold;
      var query = { unattended_deliveries: { $gt: threshold }  };
      users.find(query,function(err, result) {
      if (err) throw err;
     console.log(result);
     response.render('generate.ejs',{
      result:result
     });
  });
  });
  /** app.post('/buy', function(request, response) {
    var length=request.body.length;
    console.log(length);
     response.render('buy.ejs', {
            length:request.body.length
        });
     
});**/
//query on users with unattended deliveries greater than 2
/**
users.find().exec(function(err,result){
	var query1=users.aggregate(
   [
     { $sort : { unattended_deliveries : -1 } }
   ]
)
	//query1.where('unattended_deliveries').gt(2);
	//query1.where('unattended_deliveries').gt(2);//,voucher_codes.generate({
    //length: 100,
    //count: 5
//});;
	query1.exec(function(err,result){
       if(!err)
         	console.log(result);
         else
         	console.log('error');
	});
});
**/

//generating unique coupon codes////
var bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

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

var couponSchema=new mongoose.Schema({
 code:String,
 user_email:String
});

var coupons=mongoose.model('coupons',couponSchema);

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
  res.send("done");
});

var nodemailer=require('nodemailer');
var transporter=nodemailer.createTransport({
service:'gmail',
auth:{
  user:'aggarwaldarshita@gmail.com',
  pass:''
}
});

app.post('/created', function (req, res) {
  console.log('Moved to add page');
    coupons.findOne({
      user_email:req.body.email
    }).then(coupon=>{
      if(coupon)
      {
      }
    else{
  generateUniqueCode().then(function(code) {
  new coupons({
    code:code,
    user_email:req.body.email
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
  res.render("created.ejs");
});
