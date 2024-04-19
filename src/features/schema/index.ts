import { z } from "zod";

export const RegisterSchema = z
  .object({
    username: z.string(),
    email: z.string().email(),
    phoneNumber: z.string(),
    password: z.string().min(4),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords dont match",
    path: ["confirmPassword"],
  });

export const ProfileSchema = z.object({
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
  gender: z.enum(["MALE", "FEMALE"]),
});

export const UserSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  isStaff: z.boolean().optional(),
});

export const LoginSchema = z.object({
  username: z.string(),
  password: z.string().min(4),
});

export const LoanSchema = z.object({
  amount: z.coerce.number(),
  interestRate: z.coerce.number().min(0).max(100),
});

export const FeedSchema = z.object({
  name: z.string(),
  unitPrice: z.coerce.number(),
});

export const LoanRequestSchema = z.object({
  loan: z.string().uuid(),
  type: z.enum(["Money", "Feed"]),
  amount: z.coerce.number().optional(),
  feeds: z
    .array(z.object({ feed: z.string().uuid(), quantity: z.coerce.number() }))
    .optional()
    .default([]),
});
