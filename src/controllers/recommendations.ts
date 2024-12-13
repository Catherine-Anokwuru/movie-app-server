import User from "../models/user.model";
import Preferences from "../models/preferences.model";
import { getMovieModel } from "../models/dummymovie.model";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const updateMoviePrefereces = async (
  userId: string,
  movieId: string
) => {
  try {
    const userPreferences = await Preferences.findOne({ userId });
    if (userPreferences) {
      userPreferences.watchedMovies.push(movieId);
      await userPreferences.save();
    } else {
      await Preferences.create({
        userId,
        watchedMovies: [movieId],
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const updateGenresPreferences = async (
  userId: string,
  genre: string
) => {
  try {
    const userPreferences = await Preferences.findOne({ userId });
    if (userPreferences) {
      userPreferences.genres.push(genre);
      await userPreferences.save();
    } else {
      await Preferences.create({
        userId,
        genres: [genre],
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const getUserPreferences = async (userId: string) => {
  try {
    const userPreferences = await Preferences.findOne({ userId });
    return userPreferences;
  } catch (error) {
    console.error(error);
  }
};

export const getSimilarUsers = async (
  userId: string,
  limit: number = 5
) => {
  try {
    // Fetch the user's preferences
    const userPreferences = await Preferences.findOne({
      userId,
    }).populate("genres");

    if (!userPreferences) {
      throw new Error(
        `Preferences not found for user with ID: ${userId}`
      );
    }

    const { favouriteActors, genres, watchedMovies } =
      userPreferences;

    // Map genre IDs
    const genreIds = genres.map((genre: any) => genre._id);

    const similarUsers = await User.aggregate([
      // Exclude the current user
      { $match: { _id: { $ne: userId } } },

      // Lookup user preferences
      {
        $lookup: {
          from: "preferences",
          localField: "_id",
          foreignField: "userId",
          as: "userPreferences",
        },
      },

      // Filter users based on preferences
      {
        $match: {
          $or: [
            {
              "userPreferences.favoriteActors": {
                $elemMatch: { $in: favouriteActors || [] },
              },
            },
            {
              "userPreferences.genres": {
                $elemMatch: { $in: genreIds },
              },
            },
            {
              "userPreferences.watchedMovies": {
                $elemMatch: { $in: watchedMovies || [] },
              },
            },
          ],
        },
      },

      // Limit the number of results
      { $limit: limit },
    ]);

    return similarUsers;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export async function getRecommendations(userId: string) {
  try {
    const userPreferences = await getUserPreferences(userId);
    if (!userPreferences) {
      throw new Error("User Preferences not found");
    }
    const genres = userPreferences.genres;
    const uniqueGenres = genres.filter(
      (genre, index) => genres.indexOf(genre) === index
    );
    const watchedMovies = userPreferences.watchedMovies;

    const recommendations = [];
    if (genres.length > 0) {
      const genreRecommendations =
        await this.getRecommendationByGenres(uniqueGenres);
      recommendations.push(...genreRecommendations);
    }
    if (watchedMovies.length > 0) {
      const watchedRecommendations =
        await this.getRecommendationByWatchedMovies(watchedMovies);
      recommendations.push(...watchedRecommendations);
    }
    const collaborativeRecommendations =
      await this.getRecommendationByCollaborativeFiltering(userId);
    recommendations.push(...collaborativeRecommendations);
    return recommendations;
  } catch (error) {
    throw error;
  }
}

export async function getRecommendationByCollaborativeFiltering(
  userId: string
) {
  try {
    const originalUserPreferences = await getUserPreferences(userId);
    const similarUsers = await getSimilarUsers(userId);

    const recommendedMovies = [];
    for (const user of similarUsers) {
      const userPreferences = await getUserPreferences(user.id);
      if (!userPreferences) {
        throw new Error("User preferences not found");
      }
      for (const movieId of userPreferences.watchedMovies.slice(5)) {
        if (
          !originalUserPreferences.watchedMovies.includes(movieId)
        ) {
          const { data, error } = await this.getMovie(movieId);
          if (error) {
            throw new Error(error.message);
          }
          const movieObj = {
            imdbId: movieId,
            title: data.title,
            year: data.releaseYear,
            rating: data.rating,
            image: data.image,
            description: data.description,
            genre: data.genres,
          };
          recommendedMovies.push(movieObj);
        }
      }
    }
    return recommendedMovies;
  } catch (error) {
    throw error;
  }
}

export async function getRecommendationByGenres(genres: string[]) {
  try {
    const moviesByGenres = [];
    genres.forEach(async (genre) => {
      const movieModel = getMovieModel(genre);
      const movies = await movieModel.find();
      for (let i = 0; i <= 20; i++) {
        const movie = movies[i];
        moviesByGenres.push({
          imdbId: movie.movie_id,
          title: movie.movie_name,
          year: movie.year,
          rating: movie.rating.toString(),
          description: movie.description,
          genre: movie.genre,
          image: "",
        });
      }
    });
    // shuffle the moviesByGenres array
    for (let i = moviesByGenres.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      const temp = moviesByGenres[i];
      moviesByGenres[i] = moviesByGenres[j];
      moviesByGenres[j] = temp;
    }
    return moviesByGenres;
  } catch (error) {
    throw error;
  }
}

export async function getRecommendationByWatchedMovies(
  movies: string[]
) {
  try {
    const similarMovies = [];

    for (const movieId of movies.slice(10)) {
      const response = await axios.get(
        `https://movies-tv-shows-database.p.rapidapi.com/?movieid=${movieId}&page=1`,
        {
          headers: {
            "x-rapidapi-key": process.env.RAPID_API_KEY,
            "x-rapidapi-host":
              "movies-tv-shows-database.p.rapidapi.com",
            Type: "get-similar-movies",
          },
        }
      );
      if (response.status === 200) {
        const movies = response.data.movie_results.slice(5);
        movies.forEach(async (movie: any) => {
          const { data, error } = await this.getMovie(movie.imdb_id);
          if (error) {
            throw new Error(error.message);
          }
          const movieObj = {
            imdbId: movie.imdb_id,
            title: data.title,
            year: data.releaseYear,
            rating: data.rating,
            image: data.image,
            description: data.description,
            genre: data.genres,
          };
          similarMovies.push(movieObj);
        });
      }
    }
    return similarMovies;
  } catch (error) {
    throw error;
  }
}
