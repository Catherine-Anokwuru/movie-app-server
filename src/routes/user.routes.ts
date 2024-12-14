import express from "express"
import { addStreak, getUserStreak } from "../controllers/user.getStreak"
import { getUser } from "../controllers/user.get"

const router = express.Router()

router.get('/:userId', getUser)
router.get('/:userId/current-streak', getUserStreak)
router.get('/:userId/add-streak', addStreak)
// router.get('/:userId/recommendation', recomm)


export default router