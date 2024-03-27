import { NextFunction, Request, Response } from "express";
import { FeedModel, LoanModel, LoanRequestModel } from "../models";
import { FeedSchema, LoanRequestSchema, LoanSchema } from "../schema";
import { APIException } from "../../shared/exceprions";
import { findIndex, isEmpty } from "lodash";

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
export const getLoanRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loans = await LoanRequestModel.findMany();
    return res.json({ results: loans });
  } catch (error) {
    next(error);
  }
};
export const getMyLoanRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loans = await LoanRequestModel.findMany({
      where: { userId: (req as any).user.id },
    });
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

export const requestLoan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = await LoanRequestSchema.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    const { amount, feeds, loan, type } = validation.data;
    const errors: any = {};
    if (await LoanModel.findUnique({ where: { id: loan } }))
      errors["loan"] = { _errors: ["Invalid loan"] };
    const feedChecks = await Promise.all(
      feeds.map((feed) => FeedModel.findUnique({ where: { id: feed.feed } }))
    );
    const feedIndex = feedChecks.findIndex((feed) => feed === null);
    if (feedIndex !== -1)
      errors["feeds"] = { _errors: [`Feed ${feedIndex} not found`] };

    if (!isEmpty) throw { status: 400, errors };

    const ammount = feedChecks.reduce((prev, curr, idex) => {
      return (
        prev +
        (parseFloat((curr?.unitPrice as any) ?? 0) ?? 0 * feeds[idex].quantity)
      );
    }, 0);
    const loanRequest = LoanRequestModel.create({
      data: {
        amount: ammount,
        type,
        loanId: loan,
        userId: (req as any).user.id,
        feedsLoan: {
          createMany: {
            data: feeds.map((feed) => ({
              feedId: feed.feed,
              quantity: feed.quantity,
            })),
          },
        },
      },
    });
    return res.json(loan);
  } catch (error) {
    next(error);
  }
};
