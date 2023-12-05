const mongoose = require('mongoose');
const { Schema } = mongoose;
const UserSchema = new Schema({
    name:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true,
        unique: true
        
    },
    password:{
        type: String,
        require: true
    },
    date:{
        type: Date,
        default: Date.now
    } 
  });
  
  const user =  mongoose.model('User', UserSchema)
//   yeh hum isly likh rhe h jisse pta chalta h ki hmari data base me jo bhi chez save ho rhi h agar usko  unique: true dy gy h to woh data base me index bale foler me jake save ho jygi.
  user.createIndexes();
  module.exports = user;      
  
