import { NextFunction, Request, Response } from "express";
import Watchlist from "../models/watchlist.model";
import Movie from "../models/movie.model";

export const getWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const watchlist = await Watchlist.findOne({
      userId: userId,
    });
    const watchlistMovies = await Movie.find({
      watchlist: watchlist._id,
    });
    res.status(200).json({ watchlistMovies });
  } catch (error) {
    next(error);
  }
};
