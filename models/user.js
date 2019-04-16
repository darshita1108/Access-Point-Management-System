const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const userSchema=new mongoose.Schema({
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

var users=mongoose.model('users',userSchema);
module.exports={
	users
};
