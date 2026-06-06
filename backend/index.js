import express from "express"
import dotenv from "dotenv"
import connectDb from "./configs/db.js"
import authRouter from "./routes/authRoute.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/userRoute.js"
import courseRouter from "./routes/courseRoute.js"
import paymentRouter from "./routes/paymentRoute.js"
import aiRouter from "./routes/aiRoute.js"
import reviewRouter from "./routes/reviewRoute.js"
dotenv.config()

let port = process.env.PORT
let app = express()
app.use(express.json())
app.use(cookieParser())
const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(",") 
    : ["http://localhost:5173", "https://edurova.vercel.app", "https://edurova.vercel.app/"];
app.use(cors({
    origin: (origin, callback) => {
        console.log("CORS Request from Origin:", origin);
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin + "/")) {
            return callback(null, true);
        }
        if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}))
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/course", courseRouter)
app.use("/api/payment", paymentRouter)
app.use("/api/ai", aiRouter)
app.use("/api/review", reviewRouter)


app.get("/" , (req,res)=>{
    res.send("Hello From Server")
})

app.listen(port , ()=>{
    console.log("Server Started")
    connectDb()
})

