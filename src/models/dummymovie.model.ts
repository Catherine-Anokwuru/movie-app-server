import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDMovie extends Document {
  movie_id: string;
  movie_name: string;
  year: number;
  certificate: string;
  run_time: string;
  genre: string[];
  rating: number;
  description: string;
  director: string;
  director_id: string;
  star: string;
  star_id: string;
  votes: number;
  gross: string;
}

const MovieSchema: Schema<IDMovie> = new Schema<IDMovie>(
  {
    movie_id: { type: String, required: true },
    movie_name: { type: String, required: true },
    year: { type: Number, required: true },
    certificate: { type: String },
    run_time: { type: String },
    genre: { type: [String], required: true },
    rating: { type: Number, required: true, min: 0, max: 10 },
    description: { type: String, required: true },
    director: { type: String },
    director_id: { type: String },
    star: { type: String },
    star_id: { type: String },
    votes: { type: Number },
    gross: { type: String },
  },
  { timestamps: true }
);

export const getMovieModel = (genre: string) => {
  return mongoose.model<IDMovie>(`${genre}Movies`, MovieSchema);
};
