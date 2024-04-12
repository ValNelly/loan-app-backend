import { Router } from "express";
import {
  addFeed,
  addLoan,
  getFeeds,
  getLoans,
  getMyLoanRequest,
  requestLoan,
  getLoanRequest,
} from "../controllers/loan";
import authenticate from "../../middlewares/authentication";

const router = Router();

router.get("/loans", getLoans);
router.post("/loans", addLoan);
router.get("/feeds", getFeeds);
router.post("/feeds", addFeed);
router.get("/my-loans", authenticate, getMyLoanRequest);
router.get("/loan-requests", getLoanRequest);
router.post("/request-loan", authenticate, requestLoan);

export default router;
