import { Router } from "express";
import { getUsers, login, register, updateProfile } from "../controllers/users";
import authenticate from "../../middlewares/authentication";

const router = Router();

router.put("/profile", authenticate, updateProfile);
router.post("/register", register);
router.post("/login", login);
router.post("/", getUsers);

export default router;
