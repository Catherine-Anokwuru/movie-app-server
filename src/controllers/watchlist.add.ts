import { NextFunction, Request, Response } from "express";
import Watchlist from "../models/watchlist.model";
import Movie from "../models/movie.model";

export const addMovie = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tmdbId, title, description, genres, year, poster_path } = req.body;
    const { userId } = req.params;

    // Find or create the user's watchlist
    let watchlist = await Watchlist.findOne({ userId });
    if (!watchlist) {
      watchlist = await Watchlist.create({ userId, movies: [] });
    }

    // Check if the movie already exists in the movies collection
    let movie = await Movie.findOne({ tmdbId });
    if (!movie) {
      movie = await Movie.create({
        tmdbId,
        title,
        description,
        genres,
        year,
        poster_path
      });
    }

    // Avoid adding duplicate movie IDs to the watchlist
    if (!watchlist.movies.includes(movie.id)) {
      watchlist.movies.push(movie.id);
      await watchlist.save();
    }

    // Fetch the full movie details for all movies in the watchlist
    const watchListMovies = await Promise.all(
      watchlist.movies.map((id) => Movie.findById(id))
    );
    res.status(200).json({ watchListMovies });
  } catch (error) {
    next(error);
  }
};
