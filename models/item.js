const mongoose=require('mongoose');
const Schema=mongoose.Schema;


var itemSchema=new mongoose.Schema({
 item_id:Number,
 length:Number,
 breadth:Number,
 height:Number,
 price:Number,
 category:String,
});

var items=mongoose.model('items',itemSchema);

module.exports={
	items
};