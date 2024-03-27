import config from "config";
import { NextFunction, Request, Response } from "express";
import jwt, { verify } from "jsonwebtoken";
import { UserRequest } from "../shared/types";
import { configuration } from "../utils";
import { UserModel } from "../features/models";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("x-access-token");
  if (!token)
    return res.status(401).json({ detail: "Unauthorized - Token missing" });
  try {
    const { id }: any = verify(token, configuration.jwt as string);
    const user = await UserModel.findUnique({ where: { id } });
    if (!user) throw new Error("");
    (req as UserRequest).user = user;
    return next();
  } catch (err: any) {
    return res.status(401).json({ detail: "Unauthorized - Invalid token" });
  }
};

export default authenticate;
