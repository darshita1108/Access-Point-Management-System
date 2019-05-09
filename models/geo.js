const mongoose=require('mongoose');
const Schema=mongoose.Schema;

var codeSchema = new mongoose.Schema({
    address:String,
    latt : Number,
    lonn : Number,
    lock : Number,
    state : String,
    country : String,
    mode : String,
    name : String,
    length:Number,
    breadth:Number,
    height:Number,
    weight : Number,
    rate : Number,
    type : String
  });
  // model
  var geo = mongoose.model('geo', codeSchema);

  module.exports={
  geo
};