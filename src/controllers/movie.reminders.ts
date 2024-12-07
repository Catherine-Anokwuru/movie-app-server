import { NextFunction, Request, Response } from "express";
import { setMovieReminder } from "./notification";

export async function setReminder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userSocketId, movieTitle, time } = req.body;
    await setMovieReminder(userSocketId, movieTitle, time);
    res
      .status(200)
      .json({
        success: true,
        message: "Movie reminder has been set",
      });
  } catch (error) {
    next(error);
  }
}
