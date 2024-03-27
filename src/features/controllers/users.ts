import { NextFunction, Request, Response } from "express";
import { UserModel } from "../models";
import { LoginSchema, ProfileSchema, RegisterSchema } from "../schema";
import { APIException } from "../../shared/exceprions";
import {
  checkPassword,
  generateUserToken,
  hashPassword,
} from "../../utils/helpers";
import { isEmpty } from "lodash";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json({ results: await UserModel.findMany() });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = await RegisterSchema.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    const { password, email, username, phoneNumber } = validation.data;
    const errors: any = {};
    if (await UserModel.findFirst({ where: { username } }))
      errors["username"] = { _errors: ["User with username exist"] };
    if (await UserModel.findFirst({ where: { email } }))
      errors["email"] = { _errors: ["User with email exist"] };
    if (await UserModel.findFirst({ where: { phoneNumber } }))
      errors["phoneNumber"] = { _errors: ["User with phone number exist"] };
    if (!isEmpty(errors)) throw { status: 400, errors };

    const user = await UserModel.create({
      data: {
        email,
        phoneNumber,
        username,
        password: await hashPassword(password),
      },
    });
    return res.json({ user, token: generateUserToken({ id: user.id }) });
  } catch (error) {
    next(error);
  }
};
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = await ProfileSchema.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    const { gender, name, email, username, phoneNumber } = validation.data;
    const _user = (req as any).user;
    const errors: any = {};
    if (
      await UserModel.findFirst({ where: { username, id: { not: _user.id } } })
    )
      errors["username"] = { _errors: ["User with username exist"] };
    if (await UserModel.findFirst({ where: { email, id: { not: _user.id } } }))
      errors["email"] = { _errors: ["User with email exist"] };
    if (
      await UserModel.findFirst({
        where: { phoneNumber, id: { not: _user.id } },
      })
    )
      errors["phoneNumber"] = { _errors: ["User with phone number exist"] };
    if (!isEmpty(errors)) throw { status: 400, errors };

    const user = await UserModel.update({
      where: { id: _user.id },
      data: {
        email,
        phoneNumber,
        username,
        gender,
        name,
      },
    });
    return res.json(user);
  } catch (error) {
    next(error);
  }
};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = await LoginSchema.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    const { password, username } = validation.data;
    const users = await UserModel.findMany({
      where: {
        OR: [{ username }, { email: username }, { phoneNumber: username }],
      },
    });
    const passwordChecks = await Promise.all(
      users.map((user) => checkPassword(user.password, password))
    );
    if (passwordChecks.every((val) => val === false))
      throw {
        status: 400,
        errors: {
          username: { _errors: ["Invalid username or password"] },
          password: { _errors: ["Invalid username or password"] },
        },
      };
    const user = users[passwordChecks.findIndex((val) => val)];
    return res.json({ user, token: generateUserToken({ id: user.id }) });
  } catch (error) {
    next(error);
  }
};
