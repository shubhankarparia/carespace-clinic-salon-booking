
export const services = [
  {
    _id: "salon-1",
    id: "salon-1",
    name: "Haircut & Styling",
    category: "salon",
    description: "Professional haircut and hair styling.",
    price: 300,
    duration: 30,
    isActive: true,
  },
  {
    _id: "salon-2",
    id: "salon-2",
    name: "Hair Spa",
    category: "salon",
    description: "Relaxing hair spa and nourishment treatment.",
    price: 800,
    duration: 60,
    isActive: true,
  },
  {
    _id: "salon-3",
    id: "salon-3",
    name: "Facial Treatment",
    category: "salon",
    description: "Professional facial treatment.",
    price: 600,
    duration: 45,
    isActive: true,
  },
  {
    _id: "salon-4",
    id: "salon-4",
    name: "Bridal Makeup",
    category: "salon",
    description: "Professional bridal makeup service.",
    price: 5000,
    duration: 120,
    isActive: true,
  },
  {
    _id: "clinic-1",
    id: "clinic-1",
    name: "General Consultation",
    category: "clinic",
    description: "General doctor consultation.",
    price: 500,
    duration: 30,
    isActive: true,
  },
  {
    _id: "clinic-2",
    id: "clinic-2",
    name: "Dental Consultation",
    category: "clinic",
    description: "Dental checkup and consultation.",
    price: 400,
    duration: 30,
    isActive: true,
  },
];

// Staff / Doctors / Salon professionals
export const staff = [
  {
    _id: "staff-1",
    id: "staff-1",
    name: "Dr. Rahul Sharma",
    role: "General Physician",
    specialization: "General Medicine",
    category: "clinic",
    experience: "8 Years",
    isActive: true,
  },
  {
    _id: "staff-2",
    id: "staff-2",
    name: "Dr. Priya Das",
    role: "Dentist",
    specialization: "Dental Care",
    category: "clinic",
    experience: "6 Years",
    isActive: true,
  },
  {
    _id: "staff-3",
    id: "staff-3",
    name: "Arjun Kumar",
    role: "Senior Hair Stylist",
    specialization: "Hair Styling",
    category: "salon",
    experience: "7 Years",
    isActive: true,
  },
  {
    _id: "staff-4",
    id: "staff-4",
    name: "Sneha Roy",
    role: "Beauty Specialist",
    specialization: "Skin & Beauty",
    category: "salon",
    experience: "5 Years",
    isActive: true,
  },
];

// Business demo data
export const business = {
  name: "Clinic & Salon",
  currency: "INR",
  timezone: "Asia/Kolkata",
};

export default services;
