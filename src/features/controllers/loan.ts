import { NextFunction, Request, Response } from "express";
import { FeedModel, LoanModel, LoanRequestModel } from "../models";
import { FeedSchema, LoanRequestSchema, LoanSchema } from "../schema";
import { APIException } from "../../shared/exceprions";
import { findIndex, isEmpty } from "lodash";
import { z } from "zod";

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
    const loans = await LoanRequestModel.findMany({
      include: {
        user: true,
        loan: true,
        feedsLoan: {
          include: { feed: true },
        },
      },
    });
    return res.json({ results: loans });
  } catch (error) {
    next(error);
  }
};
export const updateLoanRequestStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      !z.string().uuid().safeParse(req.params.id).success ||
      !(await LoanRequestModel.findUnique({ where: { id: req.params.id } }))
    )
      throw { status: 404, errors: { detail: "Loan request not found!" } };
    const actionValidation = z
      .enum(["aprove", "reject"])
      .safeParse(req.params.action);
    if (!actionValidation.success)
      throw { status: 403, errors: { detail: "Action not supported" } };
    const loans = await LoanRequestModel.update({
      where: { id: req.params.id },
      data: {
        status: actionValidation.data === "aprove" ? "Aproved" : "Rejected",
      },
    });
    return res.json(loans);
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
      include: {
        user: true,
        loan: true,
        feedsLoan: {
          include: { feed: true },
        },
      },
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

export const updateFeed = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      !z.string().uuid().safeParse(req.params.id).success ||
      !(await FeedModel.findUnique({ where: { id: req.params.id } }))
    )
      throw { status: 404, errors: { detail: "Feed not found" } };
    const validation = await FeedSchema.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    if (
      await FeedModel.findFirst({
        where: { name: validation.data.name, id: { not: req.params.id } },
      })
    )
      throw {
        status: 400,
        errors: { name: { _errors: ["Feed with simalar name already exist"] } },
      };
    const feeds = await FeedModel.update({
      where: { id: req.params.id },
      data: validation.data,
    });
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

export const updateLoan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      !z.string().uuid().safeParse(req.params.id).success ||
      !(await LoanModel.findUnique({ where: { id: req.params.id } }))
    )
      throw { status: 404, errors: { detail: "Feed not found" } };
    const validation = await LoanSchema.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    if (
      await LoanModel.findFirst({
        where: { amount: validation.data.amount, id: { not: req.params.id } },
      })
    )
      throw {
        status: 400,
        errors: {
          amount: { _errors: ["Loan with simalar amount already exist"] },
        },
      };
    const loan = await LoanModel.update({
      where: { id: req.params.id },
      data: validation.data,
    });
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
    const _loan = await LoanModel.findUnique({ where: { id: loan } });
    if (!_loan) errors["loan"] = { _errors: ["Invalid loan"] };
    const feedChecks = await Promise.all(
      feeds.map((feed) => FeedModel.findUnique({ where: { id: feed.feed } }))
    );
    const feedIndex = feedChecks.findIndex((feed) => feed === null);
    if (feedIndex !== -1)
      errors["feeds"] = { _errors: [`Feed ${feedIndex} not found`] };

    if (!isEmpty(errors)) throw { status: 400, errors };

    const ammount = feedChecks.reduce((prev, curr, idex) => {
      return (
        prev +
        (parseFloat((curr?.unitPrice as any) ?? 0) ?? 0 * feeds[idex].quantity)
      );
    }, 0);
    const loanRequest = await LoanRequestModel.create({
      data: {
        amount: type === "Money" ? _loan?.amount ?? ammount : ammount,
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
    return res.json(loanRequest);
  } catch (error) {
    next(error);
  }
};
