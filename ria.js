// backend code
const express = require('express');
//create express app
const app = express();
const Promise = require('bluebird');//bluebird is for promise

const v = require('node-input-validator'); // for validations of empty inputs(exceptions)

var distance = require('google-distance');// for distance between two geo codes
distance.apiKey = '54383ddcc3734cab8ce0e83f911be831';

var changeCase = require('change-case'); // used to change case of any string

app.use('/static',express.static( __dirname + '/public')); //Serves resources from public folder

// for reading input
var readline = require('readline-sync');

// for finding distances
var distance = require('google-distance');

//to connect to mongodb
const mongoose = require('mongoose');
mongoose.connect('mongodb://lockers1:lockers1@ds125486.mlab.com:25486/accesspoints',{useNewUrlParser:true});
var db= mongoose.connection;
db.on('error',function(err){
  if(err)
  console.log(err+' connection err');

});
db.once('open',function(){
  console.log('database connected');
});
// for saving to db
// now we will save add, lat and lon to databse
  //schema
  const {geo}=require('./models/geo.js');
  // model for India
  //var geo1 = mongoose.model('india', codeSchema);

//to connect to geocode api and find lat and lang
var NodeGeocoder = require('node-geocoder');
// for geocoding
var options = {
  provider: 'opencage',//google

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: '54383ddcc3734cab8ce0e83f911be831', // for Mapquest, OpenCage, Google Premier
  formatter: null        // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);
/*
var geocoder = NodeGeocoder({
  provider: 'opencage',
  apiKey: '54383ddcc3734cab8ce0e83f911be831'
});

* Reverse Geocoding
geocoder.geocode('37.4396, -122.1864', function(err, res) {
  console.log(res);
});
0r
geocoder.reverse({lat:45.767, lon:4.833}, function(err, res) {
  console.log(res);
});
*Forward Geocoding
geocoder.geocode('29 champs elysée paris', function(err, res) {
  console.log(res);
  or
  geocoder.geocode({address: '29 champs elysée', country: 'France', zipcode: '75008'}, function(err, res) {
  console.log(res);
});

});

*for distance between two addresses
distance.get(
  {
    origin: 'San Francisco, CA',
    destination: 'San Diego, CA'
  },
  function(err, data) {
    if (err) return console.log(err);
    console.log(data);
});
*/

// for getting data from post requests
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies

// to set the response to a html web page
app.set('view engine', 'ejs')

// for the get request-- what will user get on home screen
app.get('/', function (req, res) {
  //res.send('Hello World!');->to show this text in response
  res.render('menu1'); // this shows the menu1.ejs file placed in views folder as response
});
// if link directly accessed
app.get('/add',function(req,res){
	res.render('addAccessPoint1');
});
app.get('/show',function(req,res){
	res.render('findAccessPoint1');
});

// when user choosed any option on the home page.. i.e. post request
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/', function (req, res) {
  //res.render('index');
  
});
// when request made for add page from home page using button
app.post('/add', function (req, res) {
  console.log('Moved to add page');
   //move to add page
  res.render('addAccessPoint1');
});
//when request made for show page from home page using button
app.post('/show', function (req, res) {
  console.log('Moved to show page');
  res.render('findAccessPoint1');
});

// Now to get address from the /add page and save it as geocode in our database i.e. handling post requests from this page
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
        Adim:'required',
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
                dimension : str7,
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
      res.redirect('/');
      });
});
    

app.get('/accessList',function(req,res){  // home page showed to user as get request
  // that result show case or code to be shown to user
  res.redirect('/');
  //res.end();
});
app.post('/nice', function (req, res) {
  // this is what will be done when form of /addAP will be submitted
  let Aname = request.body.Aname;
  res.send(Aname);
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

// this is the function to find distance between two pairs of latitude and longitude
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

var arr = []; // array to store relevent or needed data to show it to user in next web page in frontend
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
              console.log("redirecting to /search...");
              response.redirect("/search");
          });
         //res.send('/nearest',{response:arr});
         //res.send(arr);
         });
        }
    });

  });


app.get('/search',function(req,res){  // home page showed to user as get request
  // that result show case or code to be shown to user
  //res.send('arr');
  //res.redirect('/');
  console.log("arr in /search route", arr);
  res.render('nearestAccess', {arr:arr});
});

// for showing data searched to the user 
app.get('/nearest',function(req,res){
  res.render('nearestAccess');
});
app.post('/nearest',function(req,res){
  res.render('nearestAccess')
});



// to connect and save data to mongo db
//Username and password of the user is lockers1 
//form user schemas and save them to collections in database


// port assigned to listen to the user's request
app.listen(process.env.port || 3000, function () {
 console.log('Example app listening on port 3000!');
});
// const port=process.env.port || 3000;
// app.listen(port,()=>{
//   console.log("Server started on heroku");
// });