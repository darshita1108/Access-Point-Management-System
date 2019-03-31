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

app.get('/adduser',function(req,res){
  res.render('user');
});

app.get('/addlocker',function(req,res){
  res.render('locker');
});

app.get('/additem',function(req,res){
  res.render('item');
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
  //unattended_deliveries:Number,
  gender:String,

});

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
//userSchema.createIndex({id:1},{unique:true});
var users=mongoose.model('users',userSchema);

 app.use(bodyParser.urlencoded({extended : true}));
   app.post("/adduser", function(request, response) {
       console.log(request.body); 
       var newusers={
       name:{first:request.body.firstname,last:request.body.lastname},
       email:request.body.email,
       phone:request.body.phone,
       address:request.body.address,
       //unattended_deliveries:3,
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
    response.render('order');
 });
   /**
app.post('/adduser',function(req,res){
  //console.log('hey');
  var newusers={
       name:{first:req.body.firstname,last:req.body.lastname},
       email:req.body.email,
       phone:req.body.email,
       address:req.body.address,
       //unattended_deliveries:3,
       gender:req.body.gender
    }
 users.findOne({
      email:req.body.email
    }).then(user=>{
      if(user)
      {
        //return user
        console.log('user exists');
        res.send('user exists');
      }
      else{
        //create user
       new User(newUser)
        .save()
        .then(user=>done(null,user));
      }
    });
  
});
**/
//userSchema.index({name: 1}, { unique: true });
//userSchema.Index( {_id:1}, { unique: true } )
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

var item2=users({
  id:2,
 name:{first:'Ria',last:'Bhat'},
 email:'riashriyabhat1998@gmail.com',
 phone:8890346789,
 address:'H.no 123,sector-12',
 unattended_deliveries:1,
 gender:'female'
 
}).save(function(err){
	if(err)
		throw err;
	console.log('item2 saved');
});

var item3=users({
  id:3,
 name:{first:'Pooja',last:'Sethi'},
 email:'pooja1998@gmail.com',
 phone:8599589999,
 address:'H.no 789,sector-12',
 unattended_deliveries:3,
 gender:'female'
 
}).save(function(err){
	if(err)
		throw err;
	console.log('item3 saved');
});

**/
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
       console.log(request.body); 
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

app.get('/order',  function(req, res) {
    // mongoose operations are asynchronous, so you need to wait 
    items.find({}, function(err, data) {
        // note that data is an array of objects, not a single object!
        res.render('order.ejs', {
            user : req.user,
            items: data
        });
    });
});
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

app.post('/coupon', function (req, res) {
  console.log('Moved to add page');
   //move to add page
  generateUniqueCode().then(function(code) {
    console.log(code);
    res.send(code);
});
  //res.send(code);
});



generateUniqueCode().then(function(code) {
    console.log(code);
});
