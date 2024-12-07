import mongoose from "mongoose";

interface IPreferences {
  userId: string;
  genres: string[];
  watchedMovies: string[];
  favouriteActors: string[];
}

const PreferencesSchema = new mongoose.Schema<IPreferences>(
  {
    userId: { type: String, required: true },
    genres: { type: [String] },
    watchedMovies: { type: [String] },
    favouriteActors: { type: [String] },
  },
  { timestamps: true }
);
const Preferences = mongoose.model<IPreferences>(
  "Preferences",
  PreferencesSchema
);
export default Preferences;
