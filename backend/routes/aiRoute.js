import express from "express"
import { searchWithAi, askAi } from "../controllers/aiController.js"

let aiRouter = express.Router()

aiRouter.post("/search",searchWithAi)
aiRouter.post("/ask",askAi)

export default aiRouter