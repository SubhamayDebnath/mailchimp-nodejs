import {Schema,model} from "mongoose";

const cartSchema = new Schema({
  email:{
    type:"string",
    required:[true,"Email is required"],
    lowercase: true,
    trim: true,
    unique: true,
    match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please fill valid email address",
    ],
  },
  books:{
    type:[String]
  }
})

const Cart = model("Cart", cartSchema);

export default Cart;