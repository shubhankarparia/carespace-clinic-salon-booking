
import { useContext } from "react";
import { BookingContext } from "../context/BookingContext";

export default function useBookings() {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error(
      "useBookings must be used inside a BookingProvider."
    );
  }

  return context;
}
