
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

export const BookingContext = createContext(null);

const extractList = (response) => {
  const data = response?.data?.data || response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.bookings)) return data.bookings;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

const extractItem = (response) =>
  response?.data?.data || response?.data || {};

export function BookingProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) {
      setBookings([]);
      return [];
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get("/bookings/my-bookings");
      const list = extractList(response);

      setBookings(list);
      return list;
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to load your bookings.";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createBooking = async (bookingData) => {
    setError("");

    try {
      const response = await api.post("/bookings", bookingData);
      const newBooking = extractItem(response);

      setBookings((previous) => [
        newBooking,
        ...previous.filter((item) => item._id !== newBooking._id)
      ]);

      return newBooking;
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to create your booking.";

      setError(message);
      throw err;
    }
  };

  const cancelBooking = async (bookingId) => {
    setError("");

    try {
      const response = await api.patch(
        `/bookings/${bookingId}/cancel`
      );

      const updatedBooking = extractItem(response);

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === bookingId
            ? { ...booking, ...updatedBooking, status: updatedBooking.status || "cancelled" }
            : booking
        )
      );

      return updatedBooking;
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to cancel this booking.";

      setError(message);
      throw err;
    }
  };

  const getBookingById = async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return extractItem(response);
  };

  const clearBookings = useCallback(() => {
    setBookings([]);
    setError("");
  }, []);

  const value = useMemo(
    () => ({
      bookings,
      loading,
      error,
      fetchBookings,
      createBooking,
      cancelBooking,
      getBookingById,
      clearBookings
    }),
    [bookings, loading, error, fetchBookings, clearBookings]
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export default BookingProvider;
