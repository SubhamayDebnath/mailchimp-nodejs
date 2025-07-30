import Cart from "../models/cartModel.js";

// cart
export const getCart = async(req, res) => {
    try {
        const data = await Cart.find();
        if(!data){
            res.status(400).json({message: "Cart is empty", response: data });
        }else{
            res.status(200).json({ message: "Cart Fetched Successfully", response: data });
        }
    } catch (error) {
        console.error("Get Cart error:", error.message);
        res.status(500).json({ error: error.message })
    }
}

// add to cart
export const addToCart = async (req, res) => {
    try {
        const {username, books} = req.body;
        if(!username || !books){
            return res.status(400).json({error: "Please provide username and books"});
        }
        const cart = await Cart.create({email: username, books: books});
        if(!cart){
            return res.status(400).json({error: "Something went wrong"});
        }
        res.status(200).json({ message: "Added to Cart Successfully", response: cart });
    } catch (error) {
        console.error("Add to Cart error:", error.message);
        res.status(500).json({ error: error.message })
    }
}

