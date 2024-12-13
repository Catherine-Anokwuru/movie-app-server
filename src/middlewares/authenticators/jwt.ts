import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization
      ?.split(" ")[1]
      .slice(1, -1);
    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWTPRIVETE_SECRET
      );
      if (!decoded) {
        throw new Error("Invalid or Expired");
      }
      req["user"] = decoded;
      next();
    } else {
      throw new Error("No token provided");
    }
  } catch (error) {}
};

export const grantToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req["user"];
    if (!user) {
      throw new Error("User doesn't exist");
    }
    var token = jwt.sign(
      { data: user },
      process.env.JWT_PRIVATESECRETKEY,
      { expiresIn: "1h" }
    );
    if (!token) {
      throw new Error("Could not create authentication token");
    }
    res.header("Authorization", `Bearer ${token}`);
    next();
  } catch (error) {
    next(error);
  }
};
