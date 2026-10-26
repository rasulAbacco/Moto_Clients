import { IMG } from "./images";

// Sample reviews — replace with genuine customer feedback before going live.
export const REVIEWS = [
  { name: "Rahul Sharma", city: "Bangalore", vehicle: "Hyundai Creta", tag: "Car Service", rating: 5, text: "Quick and professional service. Found a nearby garage easily and the experience was smooth from booking to pickup." },
  { name: "Priya Menon", city: "Kochi", vehicle: "Honda City", tag: "SOS", rating: 5, text: "The SOS support helped me at night during a breakdown. Very reliable and responsive — the technician reached me in under 20 minutes." },
  { name: "Arjun Patel", city: "Ahmedabad", vehicle: "Tata Nexon", tag: "Spare Parts", rating: 5, text: "Genuine spare parts and transparent pricing. Highly recommended for all car owners who are tired of guesswork at the garage." },
  { name: "Sneha Kulkarni", city: "Pune", vehicle: "Royal Enfield Classic", tag: "Bike Service", rating: 5, text: "Booked a full service for my Classic 350. Got photo updates during the job and paid at the garage only after checking everything." },
  { name: "Nikhil Rao", city: "Hyderabad", vehicle: "Maruti Swift", tag: "AC Repair", rating: 4, text: "AC stopped cooling right before a road trip. Same-day slot, clear estimate upfront and no surprise charges on the final bill." },
  { name: "Vikram Desai", city: "Mumbai", vehicle: "Kia Seltos", tag: "Towing", rating: 5, text: "Flat-bed towing on the expressway at 11 PM. Live tracking the whole way and the team handled my car with real care." },
  { name: "Kavya Iyer", city: "Chennai", vehicle: "Honda Activa", tag: "Battery", rating: 5, text: "Scooter wouldn't start outside my office. Battery replaced on the spot with warranty logged in the app. Brilliant." },
  { name: "Mohit Jain", city: "Delhi", vehicle: "Toyota Innova", tag: "Denting", rating: 5, text: "The paint match after the denting work is perfect. Loved that I could compare garages and reviews before choosing." },
].map((r, i) => ({ ...r, avatar: IMG.avatars[i] }));
