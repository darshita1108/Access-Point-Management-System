const mongoose=require('mongoose');
const Schema=mongoose.Schema;

var couponSchema=new mongoose.Schema({
 code:String,
 type:Number,
 user_email:String
});

var coupons=mongoose.model('coupons',couponSchema);

module.exports={
	coupons
};