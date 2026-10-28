const User= require("../models/User");
const Restaurant= require("../models/Restaurant");
const Food = require("../models/Food");
const Order = require("../models/Order");

exports.getDashboardOverview = async(req,res)=>{
    try{
        const[totalUsers,totalRestaurants,  totalFoods, totalOrders, orderStats, revenueStats, recentOrders,]= await Promise.all([
            User.countDocuments(),
            Restaurant.countDocuments(),
            Food.countDocuments(),
            Order.countDocuments(),

            Order.aggregate([{
                $group:{_id:"$status", count:{$sum:1},
            },
            },
        ]),
        Order.aggregate([
            {$match:{status:"delivered"}},
            {
                $group:{_id:null,
                    totalRevenue:{$sum:"$totalAmount"},
                    averageOrderValue:{$avg:"$totalAmount"},
                    deliveredOrders:{$sum:1},
                },
            },
        ]),
        Order.find()
        .sort({createdAt:-1})
        .limit(10)
        .populate("customer","name email")
        .lean(),
        ]);

        const ordersByStatus={
               pending: 0,confirmed: 0,  preparing: 0,"out for delivery": 0,delivered:0,cancelled:0,
        };

        for (const stat of orderStats){
            ordersByStatus[stat._id]= stat.count;
        }
        const revenue= revenueStats[0] || {
            totalRevenue:0,
            averageOrderValue:0,
            deliveredOrders:0,
        };
        return res.status(200).json({
            message:"admin  dashboard data fetched successfully ",
            overview:{totalUsers,totalRestaurants,totalFoods,totalOrders,},
            ordersByStatus,
            revenue:{  totalRevenue: Math.round(revenue.totalRevenue * 100) / 100,
        averageOrderValue:
          Math.round(revenue.averageOrderValue * 100) / 100,
        deliveredOrders: revenue.deliveredOrders,},
        recentOrders,
        });
    }catch(error){
        console.error("admin dashboard error",error);

        return res.status(500).json({
            message:"failed to fetch admin dashboard data",
        });
    }
};