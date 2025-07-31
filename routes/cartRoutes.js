import { Router } from "express";
import { getCart,addToCart, getAbandonedCartUsers } from "../controllers/cartController.js";
const router = Router();

router.get("/", getCart);
router.post("/add", addToCart);
router.get("/abandoned",getAbandonedCartUsers)



export default router;