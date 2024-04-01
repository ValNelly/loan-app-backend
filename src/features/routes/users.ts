import { Router } from "express";
import {
  getUsers,
  login,
  register,
  updateProfile,
  viewProfile,
} from "../controllers/users";
import authenticate from "../../middlewares/authentication";

const router = Router();

router.put("/profile", authenticate, updateProfile);
router.get("/profile", authenticate, viewProfile);
router.post("/register", register);
router.post("/login", login);
router.post("/", getUsers);

export default router;
