import "dotenv/config"
import express from "express"
import cors from "cors"
import authRoute from "./routes/auth.route"
import productRoute from "./routes/products.route"
import ordersRoute from "./routes/orders.route"
import userRoute from "./routes/user.route"
import dashboardRoute from './routes/dashboard.route'
import invitationRoute from './routes/invitation.route'
import engineeringRoute from './routes/engineering.route'
import { errorHandler } from "./middleware/error-handler"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger"
import { limiter } from "./middleware/rate-limiter.middleware"

const app = express()

const port = Number(process.env.SERVER_PORT ?? process.env.PORT ?? 3000)

const allowedOrigins = new Set([
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.CLIENT_URL ?? "",
].filter(Boolean))

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true)
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
    credentials: true,
}))

app.use(express.json())

app.use('/api/auth', authRoute)
app.use('/api/products', productRoute)
app.use('/api/orders', ordersRoute)
app.use('/api/users', userRoute)
app.use('/api/dashboard', dashboardRoute)
app.use('/api/invitation', invitationRoute)
app.use('/api/engineering', engineeringRoute)
app.use(limiter)

app.use(errorHandler)

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            operationsSorter: "alpha",
        },
    })
)

app.listen(port, () => {
    console.log(`Port is listening on ${port}`)
})

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
    })
})