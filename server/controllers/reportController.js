
import Booking from "../models/Booking.js";
import User from "../models/User.js";

const getDateFilter = (from, to) => {
  const filter = {};

  if (from || to) {
    filter.appointmentDate = {};

    if (from) {
      const start = new Date(`${from}T00:00:00.000Z`);

      if (
        Number.isNaN(start.getTime()) ||
        start.toISOString().slice(0, 10) !== from
      ) {
        return null;
      }

      filter.appointmentDate.$gte = start;
    }

    if (to) {
      const end = new Date(`${to}T00:00:00.000Z`);

      if (
        Number.isNaN(end.getTime()) ||
        end.toISOString().slice(0, 10) !== to
      ) {
        return null;
      }

      end.setUTCDate(end.getUTCDate() + 1);
      filter.appointmentDate.$lt = end;
    }
  }

  if (
    from &&
    to &&
    new Date(from) > new Date(to)
  ) {
    return null;
  }

  return filter;
};

// Booking report
export const getBookingReport = async (req, res) => {
  const filter = getDateFilter(req.query.from, req.query.to);

  if (!filter) {
    return res.status(400).json({
      success: false,
      message: "Invalid report date range.",
    });
  }

  if (req.query.category) {
    if (!["clinic", "salon"].includes(req.query.category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category.",
      });
    }

    filter.category = req.query.category;
  }

  const [statusSummary, categorySummary, bookings] = await Promise.all([
    Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
    Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]),
    Booking.find(filter)
      .populate("customer", "firstName lastName email")
      .populate("service", "name")
      .populate("staff", "name")
      .sort({ appointmentDate: -1 }),
  ]);

  return res.status(200).json({
    success: true,
    summary: {
      totalBookings: bookings.length,
      statusSummary,
      categorySummary,
    },
    bookings,
  });
};

// Revenue report
export const getRevenueReport = async (req, res) => {
  const filter = getDateFilter(req.query.from, req.query.to);

  if (!filter) {
    return res.status(400).json({
      success: false,
      message: "Invalid report date range.",
    });
  }

  filter.paymentStatus = "paid";
  filter.status = "completed";

  const revenue = await Booking.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          year: { $year: "$appointmentDate" },
          month: { $month: "$appointmentDate" },
        },
        totalRevenue: { $sum: "$totalAmount" },
        totalAppointments: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const totalRevenue = revenue.reduce(
    (sum, item) => sum + item.totalRevenue,
    0
  );

  return res.status(200).json({
    success: true,
    totalRevenue,
    monthlyRevenue: revenue,
  });
};

// Popular services report
export const getPopularServicesReport = async (req, res) => {
  const filter = getDateFilter(req.query.from, req.query.to);

  if (!filter) {
    return res.status(400).json({
      success: false,
      message: "Invalid report date range.",
    });
  }

  const popularServices = await Booking.aggregate([
    {
      $match: {
        ...filter,
        status: { $in: ["confirmed", "completed"] },
      },
    },
    {
      $group: {
        _id: "$service",
        totalBookings: { $sum: 1 },
        revenue: {
          $sum: {
            $cond: [
              { $eq: ["$paymentStatus", "paid"] },
              "$totalAmount",
              0,
            ],
          },
        },
      },
    },
    { $sort: { totalBookings: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "services",
        localField: "_id",
        foreignField: "_id",
        as: "service",
      },
    },
    { $unwind: "$service" },
    {
      $project: {
        serviceId: "$_id",
        name: "$service.name",
        category: "$service.category",
        totalBookings: 1,
        revenue: 1,
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    popularServices,
  });
};

// Customer report
export const getCustomerReport = async (req, res) => {
  const [totalCustomers, newCustomers, customers] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({
      role: "customer",
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    }),
    User.find({ role: "customer" })
      .select("firstName lastName email phone createdAt isActive")
      .sort({ createdAt: -1 })
      .limit(100),
  ]);

  return res.status(200).json({
    success: true,
    totalCustomers,
    newCustomersThisMonth: newCustomers,
    customers,
  });
};
