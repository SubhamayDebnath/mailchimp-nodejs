import { Router } from "express";
import { getPing, addSubscriber, getSubscribers, updateBooks, filterSubscribers } from "../controllers/bookController.js";

const router = Router();

router.get("/", getPing);
router.get("/get-subscribers", getSubscribers);
router.post("/add-subscriber", addSubscriber);
router.patch("/update-books", updateBooks);
router.post("/filter-subscribers", filterSubscribers)

export default router;