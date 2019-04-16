const mongoose=require('mongoose');
const Schema=mongoose.Schema;

var orderSchema=new mongoose.Schema({
 order_id:Number,
 email:String,
 status:String
});

//lockerSchema.index({id:1},{unique:true});

var orders=mongoose.model('orders',orderSchema);

module.exports={
	orders
};