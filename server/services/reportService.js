
import Booking from "../models/Booking.js";
import User from "../models/User.js";

const createDateFilter = ({ from, to } = {}) => {
  const filter = {};

  if (from || to) {
    filter.appointmentDate = {};

    if (from) {
      const start = new Date(`${from}T00:00:00.000Z`);

      if (
        Number.isNaN(start.getTime()) ||
        start.toISOString().slice(0, 10) !== from
      ) {
        throw new Error("Invalid start date. Use YYYY-MM-DD.");
      }

      filter.appointmentDate.$gte = start;
    }

    if (to) {
      const end = new Date(`${to}T00:00:00.000Z`);

      if (
        Number.isNaN(end.getTime()) ||
        end.toISOString().slice(0, 10) !== to
      ) {
        throw new Error("Invalid end date. Use YYYY-MM-DD.");
      }

      end.setUTCDate(end.getUTCDate() + 1);
      filter.appointmentDate.$lt = end;
    }

    if (
      from &&
      to &&
      new Date(`${from}T00:00:00.000Z`) >
        new Date(`${to}T00:00:00.000Z`)
    ) {
      throw new Error("Start date cannot be after end date.");
    }
  }

  return filter;
};

export const getBookingStatistics = async (options = {}) => {
  const filter = createDateFilter(options);

  if (options.category) {
    if (!["clinic", "salon"].includes(options.category)) {
      throw new Error("Invalid booking category.");
    }

    filter.category = options.category;
  }

  const [totalBookings, statusSummary, categorySummary, bookings] =
    await Promise.all([
      Booking.countDocuments(filter),

      Booking.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
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
        .populate("customer", "firstName lastName email phone")
        .populate("service", "name category")
        .populate("staff", "name")
        .sort({ appointmentDate: -1, startTime: -1 })
        .limit(Math.min(Number(options.limit) || 100, 500)),
    ]);

  return {
    totalBookings,
    statusSummary,
    categorySummary,
    bookings,
  };
};

export const getRevenueStatistics = async (options = {}) => {
  const filter = createDateFilter(options);

  filter.status = "completed";
  filter.paymentStatus = "paid";

  const monthlyRevenue = await Booking.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          year: {
            $year: {
              date: "$appointmentDate",
              timezone: "Asia/Kolkata",
            },
          },
          month: {
            $month: {
              date: "$appointmentDate",
              timezone: "Asia/Kolkata",
            },
          },
        },
        totalRevenue: { $sum: "$totalAmount" },
        totalAppointments: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const totalRevenue = monthlyRevenue.reduce(
    (total, item) => total + item.totalRevenue,
    0
  );

  return {
    totalRevenue,
    totalAppointments: monthlyRevenue.reduce(
      (total, item) => total + item.totalAppointments,
      0
    ),
    monthlyRevenue,
  };
};

export const getPopularServices = async (options = {}) => {
  const filter = createDateFilter(options);

  filter.status = {
    $in: ["confirmed", "completed"],
  };

  const popularServices = await Booking.aggregate([
    { $match: filter },
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

  return popularServices;
};

export const getCustomerStatistics = async () => {
  const now = new Date();

  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );

  const [totalCustomers, newCustomersThisMonth, customers] =
    await Promise.all([
      User.countDocuments({ role: "customer" }),

      User.countDocuments({
        role: "customer",
        createdAt: { $gte: monthStart },
      }),

      User.find({ role: "customer" })
        .select("firstName lastName email phone createdAt isActive")
        .sort({ createdAt: -1 })
        .limit(100),
    ]);

  return {
    totalCustomers,
    newCustomersThisMonth,
    customers,
  };
};

export const getDashboardStatistics = async () => {
  const now = new Date();

  const indiaDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const todayStart = new Date(`${indiaDate}T00:00:00.000+05:30`);
  const tomorrow = new Date(todayStart);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const monthStart = new Date(
    `${indiaDate.slice(0, 7)}-01T00:00:00.000+05:30`
  );

  const [
    totalCustomers,
    totalStaff,
    totalServices,
    totalBookings,
    todayBookings,
    pendingBookings,
    completedBookings,
    revenue,
    recentBookings,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    (await import("../models/Staff.js")).default.countDocuments({
      isActive: true,
    }),
    (await import("../models/Service.js")).default.countDocuments({
      isActive: true,
    }),
    Booking.countDocuments(),
    Booking.countDocuments({
      appointmentDate: { $gte: todayStart, $lt: tomorrow },
    }),
    Booking.countDocuments({ status: "pending" }),
    Booking.countDocuments({ status: "completed" }),
    Booking.aggregate([
      {
        $match: {
          status: "completed",
          paymentStatus: "paid",
          appointmentDate: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]),
    Booking.find()
      .populate("customer", "firstName lastName")
      .populate("service", "name")
      .populate("staff", "name")
      .sort({ createdAt: -1 })
      .limit(8),
  ]);

  return {
    totalCustomers,
    totalStaff,
    totalServices,
    totalBookings,
    todayBookings,
    pendingBookings,
    completedBookings,
    monthlyRevenue: revenue[0]?.total || 0,
    recentBookings,
  };
};
