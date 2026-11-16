
import mongoose from "mongoose";

import WorkingHours from "../models/WorkingHours.js";
import Holiday from "../models/Holiday.js";
import Staff from "../models/Staff.js";

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

const validDate = (value) => {
  if (!value) return false;

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

// Get all working hours
export const getWorkingHours = async (req, res) => {
  const filter = {};

  if (req.query.staff === "business") {
    filter.staff = null;
  } else if (req.query.staff) {
    if (!validId(req.query.staff)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID.",
      });
    }

    filter.staff = req.query.staff;
  }

  const schedules = await WorkingHours.find(filter)
    .populate("staff", "name role")
    .sort({ dayOfWeek: 1 });

  return res.status(200).json({
    success: true,
    schedules,
  });
};

// Create or update a weekday schedule
export const saveWorkingHours = async (req, res) => {
  const { staff, dayOfWeek, isOpen, timeSlots, breakStart, breakEnd, notes } =
    req.body;

  if (!Number.isInteger(Number(dayOfWeek)) || dayOfWeek < 0 || dayOfWeek > 6) {
    return res.status(400).json({
      success: false,
      message: "dayOfWeek must be between 0 and 6.",
    });
  }

  if (typeof isOpen !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "isOpen must be true or false.",
    });
  }

  if (staff && !validId(staff)) {
    return res.status(400).json({
      success: false,
      message: "Invalid staff ID.",
    });
  }

  if (staff && !(await Staff.exists({ _id: staff, isActive: true }))) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found.",
    });
  }

  if (isOpen && (!Array.isArray(timeSlots) || timeSlots.length === 0)) {
    return res.status(400).json({
      success: false,
      message: "At least one time slot is required for an open day.",
    });
  }

  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (timeSlots !== undefined) {
    if (!Array.isArray(timeSlots)) {
      return res.status(400).json({
        success: false,
        message: "timeSlots must be an array.",
      });
    }

    for (const slot of timeSlots) {
      if (
        !timePattern.test(slot.startTime || "") ||
        !timePattern.test(slot.endTime || "") ||
        slot.startTime >= slot.endTime
      ) {
        return res.status(400).json({
          success: false,
          message: "Every time slot must have valid, increasing start and end times.",
        });
      }
    }

    const sorted = [...timeSlots].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].startTime < sorted[i - 1].endTime) {
        return res.status(400).json({
          success: false,
          message: "Working time slots cannot overlap.",
        });
      }
    }
  }

  const staffId = staff || null;

  const schedule = await WorkingHours.findOneAndUpdate(
    {
      staff: staffId,
      dayOfWeek: Number(dayOfWeek),
    },
    {
      $set: {
        isOpen,
        timeSlots: isOpen ? timeSlots : [],
        breakStart: breakStart || "",
        breakEnd: breakEnd || "",
        notes: notes || "",
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return res.status(200).json({
    success: true,
    message: "Working hours saved successfully.",
    schedule,
  });
};

// Delete a weekday schedule
export const deleteWorkingHours = async (req, res) => {
  const schedule = await WorkingHours.findByIdAndDelete(req.params.id);

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: "Working hours record not found.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Working hours deleted successfully.",
  });
};

// Get holidays
export const getHolidays = async (req, res) => {
  const filter = { isActive: true };

  if (req.query.staff === "business") {
    filter.staff = null;
  } else if (req.query.staff) {
    filter.staff = req.query.staff;
  }

  const holidays = await Holiday.find(filter)
    .populate("staff", "name role")
    .sort({ date: 1 });

  return res.status(200).json({
    success: true,
    holidays,
  });
};

// Create holiday
export const createHoliday = async (req, res) => {
  const {
    name,
    date,
    endDate,
    staff,
    type,
    description,
    isRecurring,
  } = req.body;

  if (!name?.trim() || !validDate(date)) {
    return res.status(400).json({
      success: false,
      message: "Holiday name and valid date are required.",
    });
  }

  if (endDate && !validDate(endDate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid holiday end date.",
    });
  }

  if (endDate && new Date(endDate) < new Date(date)) {
    return res.status(400).json({
      success: false,
      message: "Holiday end date cannot be before its start date.",
    });
  }

  if (staff && !validId(staff)) {
    return res.status(400).json({
      success: false,
      message: "Invalid staff ID.",
    });
  }

  if (staff && !(await Staff.exists({ _id: staff, isActive: true }))) {
    return res.status(404).json({
      success: false,
      message: "Staff member not found.",
    });
  }

  const holiday = await Holiday.create({
    name: name.trim(),
    date,
    endDate: endDate || null,
    staff: staff || null,
    type,
    description,
    isRecurring,
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Holiday created successfully.",
    holiday,
  });
};

// Update holiday
export const updateHoliday = async (req, res) => {
  const updates = { ...req.body };

  delete updates._id;
  delete updates.createdBy;
  delete updates.createdAt;
  delete updates.updatedAt;
  delete updates.__v;

  if (updates.date && !validDate(updates.date)) {
    return res.status(400).json({
      success: false,
      message: "Invalid holiday date.",
    });
  }

  if (updates.endDate && !validDate(updates.endDate)) {
    return res.status(400).json({
      success: false,
      message: "Invalid holiday end date.",
    });
  }

  const holiday = await Holiday.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!holiday) {
    return res.status(404).json({
      success: false,
      message: "Holiday not found.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Holiday updated successfully.",
    holiday,
  });
};

// Soft delete holiday
export const deleteHoliday = async (req, res) => {
  const holiday = await Holiday.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: false } },
    { new: true }
  );

  if (!holiday) {
    return res.status(404).json({
      success: false,
      message: "Holiday not found.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Holiday deactivated successfully.",
  });
};
