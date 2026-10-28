require("dotenv").config();

const express = require("express");
const path= require("path");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const foodRoutes = require("./routes/foodRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const couponRoutes = require("./routes/couponRoutes");
const userRoutes = require("./routes/userRoutes");
const addressRoutes = require("./routes/addressRoutes");
const cartRoutes = require("./routes/cartRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const requestId = require("./middleware/requestId");
const rateLimiter = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const aiRoutes = require("./routes/aiRoutes");

const { registerEventHandlers, unregisterEventHandlers } = require("./events/eventHandlers");

const app = express();

app.use(cors());
app.use(requestId);
//app.use("/api", rateLimiter);
app.use(express.json());
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);





app.get("/api/health", (req,res)=>{
    res.json({
        success:true, message:"quickbite api is running"
    });
});
const fs = require("fs");
const distPath = path.join(__dirname, "..", "frontend", "dist");


if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use((req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        res.sendFile(path.join(distPath, "index.html"));
    });
}
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
async function startServer(){
    try{
        await connectDB();
        registerEventHandlers();
       const server= app.listen(PORT,()=>{
        console.log(`quickbite server is running on port ${PORT}`);
       });
        
        function shutdown(){
            console.log("shutting down quickbite server");
            unregisterEventHandlers();
            server.close(()=>{
                console.log("quickbite server stopped");
                process.exit(0);
            });
        }
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

    }catch(error){
        console.log("server startup failed",error.message);
        process.exit(1);
    }
}

startServer();
