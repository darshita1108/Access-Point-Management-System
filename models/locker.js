const mongoose=require('mongoose');
const Schema=mongoose.Schema;


var lockerSchema=new mongoose.Schema({
 locker_id:Number,
 length:Number,
 breadth:Number,
 height:Number,
 address:String,
 latitude:Number,
 longitude:Number
});

var lockers=mongoose.model('lockers',lockerSchema);

module.exports={
	lockers
};