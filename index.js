const mongoose = require('mongoose');
const couponCode = require('coupon-code');//generate unique coupon codes
const Promise = require('bluebird');//bluebird is for promise
var express=require('express');

const v = require('node-input-validator');
var app=express();

app.use('/static',express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

app.get('/coupon',function(req,res){
	res.render('coupon');
});



app.get('/add',function(req,res){
  res.render('addAccessPoint1');
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
const {geo}=require('./models/geo.js');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/show',function(req,res){
  console.log(req.body.delivery);
  var r=req.body.delivery;
if(r=='locker')
{
res.render('findAccessPoint1',{
email:req.body.email,
price:req.body.price
});
}
else{
  res.render('created',{
    r:'You choose cash on delivery!!'
  })
}
});

var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'opencage',//google
  httpAdapter: 'https', // Default
  apiKey: keys.key, // for Mapquest, OpenCage, Google Premier
  formatter: null        // 'gpx', 'string', ...
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
app.post('/accessList', function (req, res) { // code that will execute in background when address submitted
  // for saving access points to db
  // forward geocoding needs to be done
  // error handling for empty inputs
  let validator = new v( req.body, {
        A1:'required',
        A2:'required',
        A3:'required',
        A4:'required',
        Amode:'required',
        Atitle:'required',
        length:'required',
        breadth:'required',
        height:'required',
        Awt:'required',
        Arate:'required',
        Atype:'required',
        Nname: 'required'
    });
 
    validator.check().then(function (matched) {
        if (!matched) {
            res.status(422).send(validator.errors);
        }
        else
        {
          //address
          var str1 = req.body.A1; //street
          var str2 = req.body.A2; //city
          var str3 = req.body.A3; //state
          var str4 = req.body.A4; //country
          var str = str1 + " " + str2 +" " +str3+" "+str4;
          // getting country name in lower case to add to the collection of that country only in db
          //var coll = changeCase.upperCase(str4);
          //locker no.
          var no = req.body.Nname;
          var x= parseInt(no,10);
          //mode
          var str5 = req.body.Amode;
          //name
          var str6 = req.body.Atitle;
          //dimensions
          var str7 = req.body.Adim;
          //weight limit
          var str8 = req.body.Awt;
          var x1= parseInt(str8,10);
          //rate
          var str9= req.body.Arate;
          var x2= parseInt(str9,10);
          //type
          var str10 = req.body.Atype;
          //code for checking uniqueness and saving access point
          console.log(str);
          geocoder.geocode(str, function(err, res) { //req.body.Aname  '29 champs elysée paris'
          console.log(res);
          console.log("********************");
          var lat = res[0].latitude; // to get lattitude of address
           var lon = res[0].longitude; // to get longitude of address
          console.log('lat : '+ lat+' long: '+lon+' address '+str + ' no. '+x);
          console.log("%%%%%%%%%%%%%%%%");
          // we will search for an existing entry of that access point in that country's collection
          geo.find({address:str
            },function(err,final){
              if(err)
                console.log(err);
              console.log(final);
              if(final.length>0){
                // access point already exists hence no change made in db
                console.log('This access point exists, we will not add it again');
              }
              else{
                var item = new geo ({
                address:str,
                latt:lat,
                lonn:lon,
                lock:x,
                state : str3,
                country : str4,
                mode : str5,
                name : str6,
                length:req.body.length,
                breadth:req.body.breadth,
                height:req.body.height,
                weight : x1,
                rate : x2,
                type : str10
                });
                item.save(function(err,save){
                  if(err)
                    console.log(err);
                    //No such access point exists , hence access point saved
                  console.log(save);
                  console.log('access point saved');
                });
              }
              
             //res.end(); // redirects to main page
            });
          //res.redirect('/'); 
        });
      }
      res.render("created",{
        r:'created'
      });
      });
});

app.post('/lockerList', function (req, res) {
  //forward geocoding needs to be done
  // need to find the geocode of address and add the no. of lockers to previous numbers in it
   // error handling for empty inputs
   let validator = new v( req.body, {
        A1:'required',
        A2:'required',
        A3:'required',
        A4:'required',
        Nname1: 'required'
    });
 
    validator.check().then(function (matched) {
        if (!matched) {
            res.status(422).send(validator.errors);
        }
        else
        {
          //address
          var str1 = req.body.A1; //street
          var str2 = req.body.A2; //city
          var str3 = req.body.A3; //state
          var str4 = req.body.A4; //country
          var str = str1 + " " + str2 +" " +str3+" "+str4;
          geo.find({
          address : str
        },function(err,final){
          if(err)
            console.log(err);
            console.log(final);
            if(final.length>0){
              final[0].lock = final[0].lock+parseInt(req.body.Nname1,10);
              final[0].save();
              console.log("iteam updated");
            }
            else{
              console.log("access point not exist");
            }
            res.redirect('/'); // redirects to main page
          });
        }

    });
});
app.get('/lockerList',function(req,res){
  // that result show case or code to be shown to user
  //res.redirect('/');
  res.end();
});


var rad = function(x) {
  return x * Math.PI / 180;
};
 var getDistance = function(p1lat, p1lng, p2lat, p2lng) {
   // returns the distance in kilometer
   var R = 6378137; // Earth’s mean radius in meter
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

var arr = []; 
app.post('/search', function (req, response) { // code that will execute in background when address submitted
  // for searching nearby Access Points
  // backward geocoding needs to be done
  //convert address provided by user to geocode 

  arr = [];

  //for exception of empty input
  let validator = new v( req.body, {
        range: 'required',
        A1 : 'required',
        A2 : 'required',
        A3 : 'required',
        A4 : 'required',
        Mode : 'required',
        Type : 'required',
        Partition : 'required'
    });
 
    validator.check().then(function (matched) {
        if (!matched) {
            response.status(422).send(validator.errors);
        }
        else
        {
          //address
          var str1 = req.body.A1;//street
          var str2 = req.body.A2;//city
          var str3 = req.body.A3;//state
          var str4 = req.body.A4;//country
          var str = str1 + " " + str2 +" " +str3+" "+str4; //address
          // mode
          var smode = req.body.Mode;
          console.log('mode', smode);
          //type
          var stype = req.body.Type;
          //partition
          var spart = req.body.Partition;
          //finding lat and lon
          geocoder.geocode(str, function(err, res) { //req.body.fName
          console.log(res);
           var lat = res[0].latitude; // to get lattitude of address
           var lon = res[0].longitude; // to get longitude of address
           var no = req.body.range;// to get the range 
           var x= parseInt(no,10);
           // console.log('lat= '+lat+' lon= '+lon+' address= '+str+' range '+x);
            
           // search nearest geocodes from database and return addresses as result
           //find every object in db and compare the distance``
          
           geo.find({}).then(function(result){// finding function for database
              var ct = 0;
              
              console.log(result.length); // no. of objects in database
              for(var i = 0; i<result.length ;i++)
              {
                  var ans = getDistance(lat,lon,result[i].latt,result[i].lonn); // finding distance between the query address and the db addresses
                  console.log(ans); // showing every distance in kilometers
                  if(ans <= x)
                  {
                    // those addresses which are in the range as described by user
                    console.log("Range "+ans+" "+x);
                    if(result[i].mode == smode && result[i].type == stype)
                    {
                      console.log("mode and type "+result[i].mode+" "+smode);
                      // those results which match user's prefrence
                      if(spart=='None')
                      {
                        // those results which match the partition
                        console.log('Partition is none');
                        //hence all the results need to be shown
                        ct++;
                        arr.push(result[i]); // pushed all the results in the array for next webpage
                        console.log(result[i]);
                      }
                      else if(spart=='Country')
                      {
                        console.log('Partition is Country');
                        // results within country needs to be shown
                        if(str4 == result[i].country)
                        {
                          ct++;
                          arr.push(result[i]); // pushed all the results in the array for next webpage
                          console.log(result[i]);
                        }
                      }
                      else
                      {
                        console.log('Partition is State');
                        //results within same state needs to be pushed
                        if(str3 == result[i].state)
                        {
                          ct++;
                          arr.push(result[i]); // pushed all the results in the array for next webpage
                          console.log(result[i]);
                        }
                      }
                    }
                    // ct++;
                    // arr.push(result[i]); // pushed all the results in the array for next webpage
                    // console.log(result[i]);
                  }
              }
              console.log("arr is filled: ", arr);
              console.log(req.body.price);
              response.render("nearestAccess",{
                arr:arr,
                email:req.body.email,
                price:req.body.price
              });
          });
         //res.send('/nearest',{response:arr});
         //res.send(arr);
         });
        }
    });

  });



/**app.get('/search',function(req,res){  // home page showed to user as get request
  // that result show case or code to be shown to user
  //res.send('arr');
  //res.redirect('/');
  console.log(req.body.email);
  console.log("arr in /search route", arr);
  res.render('nearestAccess', {
    arr:arr,
    email:req.body.email
  });
});**/

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
console.log(req.body.price);
var email=req.body.email;
var id=req.body.id;
var price=req.body.price;

 coupons.findOne({
      user_email:req.body.email
    }).then(coupon=>{
      if(coupon)
      {
        var discount=coupon.discount;
        var code=coupon.code;
        var expiry=coupon.expiry_date;
        var used=coupon.used;
        res.render("entercode",{
        code:code,
        discount:discount,
        price:price,
        email:email,
        expiry:expiry,
        used:used
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
var price=req.body.price;
var expiry=req.body.expiry;
var discount=req.body.discount;
var used=req.body.used;
var email=req.body,email;
var date=new Date();
expiry=new Date(expiry);
var flag=0;
if(expiry>date&&used==false)
{
  console.log("gr");
  flag=1;
  var d=(discount*price)/100;
  price=price-d;

}
else{
   res.render("created.ejs",{
    r:'coupon expired'
  });
  }
if(flag==1&&ucode==code&&used==false)
{
  var myquery = { used: false };
  var newvalues = { $set: {used: true } };
   coupons.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
  });
   res.render("created.ejs",{
     r:'price is '+price
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
    console.log("check"+code);
    coupons.findOne({
      code:code
    }).then(coupon=>{
      if (coupon) {
        console.log(code + ' is not unique');
        resolve(false);
      } 
      else {
        console.log(code + ' is unique');
        resolve(true);
      }
    }, 1000);
    });

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
    console.log("code is");
    console.log(code);
  new coupons({
    code:code,
    user_email:req.body.email,
    discount:req.body.discount,
    expiry_date:req.body.expiry,
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
