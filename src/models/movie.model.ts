import mongoose from "mongoose";
interface IMovie {
  id: string;
  tmdbId: number;
  title: string;
  description: string;
  genres: string[];
  year: string;
  watchlist: {};
  history: {};
}

const MovieSchema = new mongoose.Schema<IMovie>(
  {
    tmdbId: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    genres: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          // Check if v is either a string or an array of strings
          return (
            typeof v === "string" ||
            (Array.isArray(v) &&
              v.every((item) => typeof item === "string"))
          );
        },
      },
    },
    year: { type: String },
  },
  { timestamps: true }
);

const Movie = mongoose.model<IMovie>("Movie", MovieSchema);
export default Movie;
