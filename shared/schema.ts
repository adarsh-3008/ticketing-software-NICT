import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  isAdmin: boolean("is_admin").default(false),
});

export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  image: text("image").notNull(),
  rating: doublePrecision("rating").default(0),
  isActive: boolean("is_active").default(true),
});

export const ticketTypes = pgTable("ticket_types", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").notNull().references(() => venues.id),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
});

export const availableDates = pgTable("available_dates", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").notNull().references(() => venues.id),
  date: text("date").notNull(),
  capacity: integer("capacity").default(100),
  booked: integer("booked").default(0),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  bookingId: text("booking_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  venueId: integer("venue_id").notNull().references(() => venues.id),
  date: text("date").notNull(),
  tickets: jsonb("tickets").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  status: text("status").notNull().default("confirmed"),
  customerDetails: jsonb("customer_details").notNull(),
  bookingDate: timestamp("booking_date").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertVenueSchema = createInsertSchema(venues);

export const insertTicketTypeSchema = createInsertSchema(ticketTypes);

export const insertAvailableDateSchema = createInsertSchema(availableDates);

export const insertBookingSchema = createInsertSchema(bookings)
  .omit({ id: true, bookingDate: true });

// Custom types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;

export type TicketType = typeof ticketTypes.$inferSelect;
export type InsertTicketType = z.infer<typeof insertTicketTypeSchema>;

export type AvailableDate = typeof availableDates.$inferSelect;
export type InsertAvailableDate = z.infer<typeof insertAvailableDateSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Extended types for app use
export interface VenueWithDetails extends Venue {
  ticketTypes: TicketType[];
  availableDates: string[];
}

export interface BookingWithVenue extends Booking {
  venueName: string;
}
