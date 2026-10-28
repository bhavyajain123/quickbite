const mongoose = require ("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name:{type:String, required : true , trim:true},
    email:{type:String , required:true, unique:true, trim:true, lowercase:true},
    password:{type:String, requires:true, minlength:6},
    role:{type:String, enum:["customer", "admin","deliveryPartner"],default:"customer"},
    phone:{type:String, trim:true, default:"",},
},{timestamps:true}
);

userSchema.pre("save", async function (){
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model("User", userSchema);