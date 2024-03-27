import { NextFunction, Request, Response } from "express";
import { FeedModel, LoanModel } from "../models";
import { FeedSchema, LoanSchema } from "../schema";
import { APIException } from "../../shared/exceprions";

export const getFeeds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const feeds = await FeedModel.findMany();
    return res.json({ results: feeds });
  } catch (error) {
    next(error);
  }
};

export const getLoans = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loans = await LoanModel.findMany();
    return res.json({ results: loans });
  } catch (error) {
    next(error);
  }
};

export const addFeed = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = await FeedSchema.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    if (await FeedModel.findUnique({ where: { name: validation.data.name } }))
      throw {
        status: 400,
        errors: { name: { _errors: ["Feed with simalar name already exist"] } },
      };
    const feeds = await FeedModel.create({ data: validation.data });
    return res.json(feeds);
  } catch (error) {
    next(error);
  }
};

export const addLoan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = await LoanSchema.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    if (
      await LoanModel.findUnique({ where: { amount: validation.data.amount } })
    )
      throw {
        status: 400,
        errors: {
          amount: { _errors: ["Loan with simalar amount already exist"] },
        },
      };
    const loan = await LoanModel.create({ data: validation.data });
    return res.json(loan);
  } catch (error) {
    next(error);
  }
};
