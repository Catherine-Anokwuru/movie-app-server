import express from "express";
import { setReminder } from "../controllers/movie.reminders";

const router = express.Router();

router.post("/set-movie-reminder", setReminder);

export default router;
