
import mongoose from "mongoose";

import User from "../models/User.js";
import Service from "../models/Service.js";
import Staff from "../models/Staff.js";
import Booking from "../models/Booking.js";
import BusinessSettings from "../models/BusinessSettings.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.limit, 10) || 10)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const getCustomerName = (customer) => {
  if (!customer) return "Customer";

  return (
    [customer.firstName, customer.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    customer.name ||
    "Customer"
  );
};

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

export const getDashboardStats = asyncHandler(
  async (req, res) => {
    const [
      totalCustomers,
      totalStaff,
      totalServices,
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      revenueResult,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Staff.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({
        status: { $in: ["cancelled", "rejected"] },
      }),

      Booking.aggregate([
        { $match: { status: "completed" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),

      Booking.find()
        .populate("customer", "firstName lastName email phone")
        .populate("service", "name price")
        .populate("staff", "name role")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const totalRevenue =
      revenueResult[0]?.totalRevenue || 0;

    return res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully.",
      data: {
        totalCustomers,
        totalStaff,
        totalServices,
        totalBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
        recentBookings,
      },
      stats: {
        totalCustomers,
        totalStaff,
        totalServices,
        totalBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
      },
    });
  }
);

// ==========================================
// GET BUSINESS SETTINGS
// ==========================================

export const getBusinessSettings = asyncHandler(
  async (req, res) => {
    let settings = await BusinessSettings.findOne().lean();

    if (!settings) {
      settings = await BusinessSettings.create({
        businessName: "CareSpace Clinic & Salon",
        email: "",
        phone: "",
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
        },
        currency: "INR",
        currencySymbol: "₹",
        timezone: "Asia/Kolkata",
      });

      settings = settings.toObject();
    }

    return res.status(200).json({
      success: true,
      message: "Business settings fetched successfully.",
      data: settings,
    });
  }
);

// ==========================================
// UPDATE BUSINESS SETTINGS
// ==========================================

export const updateBusinessSettings = asyncHandler(
  async (req, res) => {
    const {
      businessName,
      tagline,
      logo,
      email,
      phone,
      address,
      currency,
      currencySymbol,
      timezone,
      bookingSettings,
      socialLinks,
      notificationSettings,
    } = req.body;

    const updateData = {
      updatedBy: req.user?._id || null,
    };

    // Business information
    if (businessName !== undefined) {
      if (!String(businessName).trim()) {
        throw new ApiError(400, "Business name is required.");
      }

      updateData.businessName = String(businessName).trim();
    }

    if (tagline !== undefined) {
      updateData.tagline = String(tagline).trim();
    }

    if (logo !== undefined) {
      updateData.logo = String(logo).trim();
    }

    if (email !== undefined) {
      updateData.email = String(email).trim().toLowerCase();
    }

    if (phone !== undefined) {
      updateData.phone = String(phone).trim();
    }

    
    // ==========================================
    // BUSINESS ADDRESS
    // ==========================================

    if (address !== undefined) {
      if (
        !address ||
        typeof address !== "object" ||
        Array.isArray(address)
      ) {
        throw new ApiError(
          400,
          "Address must be a valid object."
        );
      }

      updateData.address = {
        street: String(address.street || "").trim(),
        city: String(address.city || "").trim(),
        state: String(address.state || "").trim(),
        postalCode: String(address.postalCode || "").trim(),
        country: String(address.country || "India").trim(),
      };
    }


    // Currency
    if (currency !== undefined) {
      const normalizedCurrency = String(currency)
        .trim()
        .toUpperCase();

      if (!["INR", "USD"].includes(normalizedCurrency)) {
        throw new ApiError(400, "Invalid currency.");
      }

      updateData.currency = normalizedCurrency;

      // Automatically set symbol when not supplied
      if (currencySymbol === undefined) {
        updateData.currencySymbol =
          normalizedCurrency === "INR" ? "₹" : "$";
      }
    }

    if (currencySymbol !== undefined) {
      updateData.currencySymbol = String(currencySymbol).trim();
    }

    if (timezone !== undefined) {
      const validTimezones = [
        "Asia/Kolkata",
        "UTC",
      ];

      if (!validTimezones.includes(timezone)) {
        throw new ApiError(400, "Invalid timezone.");
      }

      updateData.timezone = timezone;
    }

    // Booking settings
    if (
      bookingSettings !== undefined &&
      typeof bookingSettings === "object" &&
      !Array.isArray(bookingSettings)
    ) {
      const allowedFields = [
        "allowOnlineBooking",
        "requireBookingConfirmation",
        "allowCancellation",
        "cancellationNoticeHours",
        "advanceBookingDays",
        "minimumBookingNoticeHours",
        "slotIntervalMinutes",
      ];

      for (const field of allowedFields) {
        if (bookingSettings[field] !== undefined) {
          updateData[`bookingSettings.${field}`] =
            bookingSettings[field];
        }
      }
    }

    // Social links
    if (
      socialLinks !== undefined &&
      typeof socialLinks === "object" &&
      !Array.isArray(socialLinks)
    ) {
      const allowedFields = [
        "website",
        "facebook",
        "instagram",
        "youtube",
      ];

      for (const field of allowedFields) {
        if (socialLinks[field] !== undefined) {
          updateData[`socialLinks.${field}`] =
            String(socialLinks[field]).trim();
        }
      }
    }

    // Notification settings
    if (
      notificationSettings !== undefined &&
      typeof notificationSettings === "object" &&
      !Array.isArray(notificationSettings)
    ) {
      const allowedFields = [
        "emailNotifications",
        "bookingConfirmation",
        "bookingCancellation",
        "appointmentReminder",
      ];

      for (const field of allowedFields) {
        if (notificationSettings[field] !== undefined) {
          updateData[`notificationSettings.${field}`] =
            notificationSettings[field];
        }
      }
    }

    const settings = await BusinessSettings.findOneAndUpdate(
      {},
      { $set: updateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Business settings updated successfully.",
      data: settings,
    });
  }
);

// ==========================================
// UPDATE USER ROLE
// ==========================================

export const updateUserRole = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid user ID.");
    }

    const allowedRoles = [
      "customer",
      "admin",
      "staff",
    ];

    if (!allowedRoles.includes(role)) {
      throw new ApiError(400, "Invalid user role.");
    }

    if (req.user?._id?.toString() === id && role !== "admin") {
      throw new ApiError(
        400,
        "You cannot remove your own admin role."
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      data: user,
    });
  }
);

// ==========================================
// GET ALL BOOKINGS
// ==========================================

export const getAllBookings = asyncHandler(
  async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const { search, status, category } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      const regex = new RegExp(
        escapeRegex(String(search).trim()),
        "i"
      );

      filter.$or = [
        { bookingNumber: regex },
        { customerName: regex },
        { customerEmail: regex },
        { customerPhone: regex },
      ];
    }

    const [bookings, totalBookings] = await Promise.all([
      Booking.find(filter)
        .populate("customer", "firstName lastName email phone")
        .populate("service", "name price duration")
        .populate("staff", "name role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Booking.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalBookings / limit);

    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully.",
      bookings,
      data: bookings,
      pagination: {
        currentPage: page,
        totalPages,
        totalBookings,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  }
);

// ==========================================
// GET ALL CUSTOMERS
// ==========================================

export const getAllCustomers = asyncHandler(
  async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const { search } = req.query;

    const filter = {
      role: "customer",
    };

    if (search) {
      const regex = new RegExp(
        escapeRegex(String(search).trim()),
        "i"
      );

      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const [users, totalCustomers] = await Promise.all([
      User.find(filter)
        .select("firstName lastName email phone createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    const customers = users.map((user) => ({
      ...user,
      name: getCustomerName(user),
    }));

    const totalPages = Math.ceil(totalCustomers / limit);

    return res.status(200).json({
      success: true,
      message: "Customers fetched successfully.",
      data: customers,
      customers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCustomers,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  }
);

// ==========================================
// GET REPORTS & ANALYTICS
// ==========================================

export const getReports = asyncHandler(
  async (req, res) => {
    const {
      startDate,
      endDate,
      category = "all",
    } = req.query;

    // Validate category
    if (!["all", "clinic", "salon"].includes(category)) {
      throw new ApiError(400, "Invalid report category.");
    }

    // Validate date range
    if (
      startDate &&
      endDate &&
      startDate > endDate
    ) {
      throw new ApiError(
        400,
        "Start date cannot be after end date."
      );
    }

    const filter = {};

    // India timezone date boundaries
    const dateFilter = {};

    if (startDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        throw new ApiError(400, "Invalid start date format.");
      }

      const start = new Date(
        `${startDate}T00:00:00.000+05:30`
      );

      if (Number.isNaN(start.getTime())) {
        throw new ApiError(400, "Invalid start date.");
      }

      dateFilter.$gte = start;
    }

    if (endDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        throw new ApiError(400, "Invalid end date format.");
      }

      const end = new Date(
        `${endDate}T00:00:00.000+05:30`
      );

      if (Number.isNaN(end.getTime())) {
        throw new ApiError(400, "Invalid end date.");
      }

      end.setUTCDate(end.getUTCDate() + 1);
      dateFilter.$lt = end;
    }

    if (Object.keys(dateFilter).length > 0) {
      filter.appointmentDate = dateFilter;
    }

    if (category !== "all") {
      filter.category = category;
    }

    // Fetch matching bookings
    const bookings = await Booking.find(filter)
      .populate(
        "customer",
        "firstName lastName name email phone"
      )
      .populate("service", "name price duration category")
      .populate("staff", "name role")
      .sort({ appointmentDate: -1, startTime: -1 })
      .lean();

    // Booking statistics
    const totalBookings = bookings.length;

    const completedBookings = bookings.filter(
      (booking) => booking.status === "completed"
    ).length;

    const cancelledBookings = bookings.filter(
      (booking) =>
        ["cancelled", "rejected"].includes(booking.status)
    ).length;

    const pendingBookings = bookings.filter(
      (booking) => booking.status === "pending"
    ).length;

    const confirmedBookings = bookings.filter(
      (booking) => booking.status === "confirmed"
    ).length;

    // Revenue from completed bookings
    const totalRevenue = bookings
      .filter((booking) => booking.status === "completed")
      .reduce(
        (total, booking) =>
          total + Number(booking.totalAmount || 0),
        0
      );

    // Category-wise statistics
    const categoryStats = ["clinic", "salon"].map(
      (item) => {
        const categoryBookings = bookings.filter(
          (booking) => booking.category === item
        );

        const completed = categoryBookings.filter(
          (booking) => booking.status === "completed"
        );

        const revenue = completed.reduce(
          (total, booking) =>
            total + Number(booking.totalAmount || 0),
          0
        );

        return {
          category: item,
          totalBookings: categoryBookings.length,
          completedBookings: completed.length,
          revenue,
        };
      }
    );

    // Prepare frontend booking records
    const reportBookings = bookings.map((booking) => ({
      _id: booking._id,
      bookingNumber: booking.bookingNumber || "",
      customerName:
        booking.customerName ||
        getCustomerName(booking.customer),
      customerEmail:
        booking.customerEmail ||
        booking.customer?.email ||
        "",
      customerPhone:
        booking.customerPhone ||
        booking.customer?.phone ||
        "",
      service: booking.service || null,
      staff: booking.staff || null,
      category: booking.category,
      appointmentDate: booking.appointmentDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      price: booking.price,
      discount: booking.discount,
      totalAmount: booking.totalAmount,
    }));

    return res.status(200).json({
      success: true,
      message: "Reports generated successfully.",
      data: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        pendingBookings,
        confirmedBookings,
        totalRevenue,
        categoryStats,
        bookings: reportBookings,
      },
    });
  }
);
