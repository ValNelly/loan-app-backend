import { Router } from "express";
import {
  addFeed,
  addLoan,
  getFeeds,
  getLoans,
  getMyLoanRequest,
  requestLoan,
  getLoanRequest,
  updateFeed,
  updateLoan,
  updateLoanRequestStatus,
} from "../controllers/loan";
import authenticate from "../../middlewares/authentication";

const router = Router();

router.get("/loans", getLoans);
router.post("/loans", addLoan);
router.put("/loans/:id", updateLoan);
router.get("/feeds", getFeeds);
router.post("/feeds", addFeed);
router.put("/feeds/:id", updateFeed);
router.get("/my-loans", authenticate, getMyLoanRequest);
router.get("/loan-requests", getLoanRequest);
router.put("/loan-requests/:id/:action", updateLoanRequestStatus);
router.post("/request-loan", authenticate, requestLoan);

export default router;
