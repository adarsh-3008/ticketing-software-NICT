import { 
  users, User, InsertUser, venues, Venue, InsertVenue, 
  ticketTypes, TicketType, InsertTicketType,
  availableDates, AvailableDate, InsertAvailableDate,
  bookings, Booking, InsertBooking, VenueWithDetails, BookingWithVenue
} from "@shared/schema";
import { nanoid } from "nanoid";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Venue methods
  getVenues(): Promise<VenueWithDetails[]>;
  getVenue(id: number): Promise<VenueWithDetails | undefined>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  updateVenue(id: number, venue: Partial<Venue>): Promise<Venue | undefined>;
  
  // Ticket types methods
  getTicketTypesByVenue(venueId: number): Promise<TicketType[]>;
  createTicketType(ticketType: InsertTicketType): Promise<TicketType>;
  
  // Available dates methods
  getAvailableDatesByVenue(venueId: number): Promise<AvailableDate[]>;
  createAvailableDate(availableDate: InsertAvailableDate): Promise<AvailableDate>;
  updateAvailableDate(id: number, updates: Partial<AvailableDate>): Promise<AvailableDate | undefined>;
  
  // Booking methods
  getBookings(): Promise<Booking[]>;
  getBookingsByUser(userId: number): Promise<BookingWithVenue[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByBookingId(bookingId: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Sessions
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private venuesMap: Map<number, Venue>;
  private ticketTypesMap: Map<number, TicketType>;
  private availableDatesMap: Map<number, AvailableDate>;
  private bookingsMap: Map<number, Booking>;
  
  private userIdCounter: number;
  private venueIdCounter: number;
  private ticketTypeIdCounter: number;
  private availableDateIdCounter: number;
  private bookingIdCounter: number;
  
  sessionStore: session.SessionStore;
  
  constructor() {
    this.usersMap = new Map();
    this.venuesMap = new Map();
    this.ticketTypesMap = new Map();
    this.availableDatesMap = new Map();
    this.bookingsMap = new Map();
    
    this.userIdCounter = 1;
    this.venueIdCounter = 1;
    this.ticketTypeIdCounter = 1;
    this.availableDateIdCounter = 1;
    this.bookingIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with some default data
    this.initializeData();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.usersMap.set(id, user);
    return user;
  }
  
  // Venue methods
  async getVenues(): Promise<VenueWithDetails[]> {
    return Array.from(this.venuesMap.values()).map(venue => {
      return {
        ...venue,
        ticketTypes: this.getTicketTypesForVenue(venue.id),
        availableDates: this.getAvailableDatesForVenue(venue.id).map(date => date.date)
      };
    });
  }
  
  async getVenue(id: number): Promise<VenueWithDetails | undefined> {
    const venue = this.venuesMap.get(id);
    if (!venue) return undefined;
    
    return {
      ...venue,
      ticketTypes: this.getTicketTypesForVenue(id),
      availableDates: this.getAvailableDatesForVenue(id).map(date => date.date)
    };
  }
  
  async createVenue(venue: InsertVenue): Promise<Venue> {
    const id = this.venueIdCounter++;
    const newVenue: Venue = { ...venue, id };
    this.venuesMap.set(id, newVenue);
    return newVenue;
  }
  
  async updateVenue(id: number, updates: Partial<Venue>): Promise<Venue | undefined> {
    const venue = this.venuesMap.get(id);
    if (!venue) return undefined;
    
    const updatedVenue = { ...venue, ...updates };
    this.venuesMap.set(id, updatedVenue);
    return updatedVenue;
  }
  
  // Ticket types methods
  async getTicketTypesByVenue(venueId: number): Promise<TicketType[]> {
    return this.getTicketTypesForVenue(venueId);
  }
  
  async createTicketType(ticketType: InsertTicketType): Promise<TicketType> {
    const id = this.ticketTypeIdCounter++;
    const newTicketType: TicketType = { ...ticketType, id };
    this.ticketTypesMap.set(id, newTicketType);
    return newTicketType;
  }
  
  // Available dates methods
  async getAvailableDatesByVenue(venueId: number): Promise<AvailableDate[]> {
    return this.getAvailableDatesForVenue(venueId);
  }
  
  async createAvailableDate(availableDate: InsertAvailableDate): Promise<AvailableDate> {
    const id = this.availableDateIdCounter++;
    const newAvailableDate: AvailableDate = { ...availableDate, id };
    this.availableDatesMap.set(id, newAvailableDate);
    return newAvailableDate;
  }
  
  async updateAvailableDate(id: number, updates: Partial<AvailableDate>): Promise<AvailableDate | undefined> {
    const availableDate = this.availableDatesMap.get(id);
    if (!availableDate) return undefined;
    
    const updatedAvailableDate = { ...availableDate, ...updates };
    this.availableDatesMap.set(id, updatedAvailableDate);
    return updatedAvailableDate;
  }
  
  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookingsMap.values());
  }
  
  async getBookingsByUser(userId: number): Promise<BookingWithVenue[]> {
    const userBookings = Array.from(this.bookingsMap.values())
      .filter(booking => booking.userId === userId);
      
    return userBookings.map(booking => {
      const venue = this.venuesMap.get(booking.venueId);
      return {
        ...booking,
        venueName: venue ? venue.name : 'Unknown Venue'
      };
    });
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookingsMap.get(id);
  }
  
  async getBookingByBookingId(bookingId: string): Promise<Booking | undefined> {
    return Array.from(this.bookingsMap.values()).find(
      (booking) => booking.bookingId === bookingId
    );
  }
  
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const booking: Booking = { 
      ...bookingData, 
      id,
      bookingDate: new Date()
    };
    this.bookingsMap.set(id, booking);
    
    // Update available date capacity
    const availableDate = this.getAvailableDateForVenueAndDate(booking.venueId, booking.date);
    if (availableDate) {
      this.updateAvailableDate(availableDate.id, {
        booked: (availableDate.booked || 0) + 1
      });
    }
    
    return booking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookingsMap.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookingsMap.set(id, updatedBooking);
    return updatedBooking;
  }
  
  // Helper methods
  private getTicketTypesForVenue(venueId: number): TicketType[] {
    return Array.from(this.ticketTypesMap.values())
      .filter(ticketType => ticketType.venueId === venueId);
  }
  
  private getAvailableDatesForVenue(venueId: number): AvailableDate[] {
    return Array.from(this.availableDatesMap.values())
      .filter(availableDate => availableDate.venueId === venueId);
  }
  
  private getAvailableDateForVenueAndDate(venueId: number, date: string): AvailableDate | undefined {
    return Array.from(this.availableDatesMap.values())
      .find(availableDate => availableDate.venueId === venueId && availableDate.date === date);
  }
  
  // Initialize with sample data
  private initializeData() {
    // Create sample venues
    const venueData = [
      {
        name: 'Aqua Paradise Water Park',
        description: 'Experience the thrill of 15 water slides, wave pools, and lazy rivers at the largest water park in the region.',
        address: '123 Splash Avenue, Watertown',
        image: '/images/water-park.svg',
        rating: 4.5,
        isActive: true
      },
      {
        name: 'Wildlife Kingdom Zoo',
        description: 'Discover over 500 species across 5 unique ecosystems. Feed the giraffes and watch our world-famous penguin parade.',
        address: '456 Safari Road, Animalburg',
        image: '/images/zoo.svg',
        rating: 4.8,
        isActive: true
      },
      {
        name: 'Adventure Theme Park',
        description: 'Hold on tight for the fastest roller coasters and most extreme thrill rides in the country.',
        address: '789 Coaster Blvd, Thrill City',
        image: '/images/theme-park.svg',
        rating: 4.7,
        isActive: true
      },
      {
        name: 'Oceanic Aquarium',
        description: 'Journey through underwater tunnels and see thousands of marine species, including the rare giant squid.',
        address: '321 Ocean Drive, Coastal Heights',
        image: '/images/aquarium.svg',
        rating: 4.6,
        isActive: true
      },
      {
        name: 'Historical Museum Complex',
        description: 'Travel through time with interactive exhibits spanning prehistoric to modern eras across 5 connected buildings.',
        address: '555 History Lane, Oldtown',
        image: '/images/museum.svg',
        rating: 4.9,
        isActive: true
      },
      {
        name: 'Botanical Gardens',
        description: 'Stroll through 20 themed gardens featuring rare plants from around the world and a spectacular butterfly pavilion.',
        address: '888 Blossom Way, Greenfield',
        image: '/images/garden.svg',
        rating: 4.7,
        isActive: true
      }
    ];
    
    // Add venues
    venueData.forEach(venue => {
      const venueId = this.venueIdCounter++;
      const newVenue: Venue = { id: venueId, ...venue };
      this.venuesMap.set(venueId, newVenue);
      
      // Add ticket types for this venue
      const ticketTypeData = [
        { venueId, name: 'Adult', price: 29.99 },
        { venueId, name: 'Child (4-12)', price: 19.99 },
        { venueId, name: 'Senior (65+)', price: 22.99 }
      ];
      
      ticketTypeData.forEach(ticketType => {
        const ticketTypeId = this.ticketTypeIdCounter++;
        const newTicketType: TicketType = { id: ticketTypeId, ...ticketType };
        this.ticketTypesMap.set(ticketTypeId, newTicketType);
      });
      
      // Add available dates for this venue - use current year dates
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const dates = [
        `${currentYear}-${currentMonth.toString().padStart(2, '0')}-10`, 
        `${currentYear}-${currentMonth.toString().padStart(2, '0')}-15`, 
        `${currentYear}-${currentMonth.toString().padStart(2, '0')}-20`, 
        `${currentYear}-${currentMonth.toString().padStart(2, '0')}-25`
      ];
      dates.forEach(date => {
        const availableDateId = this.availableDateIdCounter++;
        const newAvailableDate: AvailableDate = { 
          id: availableDateId, 
          venueId, 
          date,
          capacity: 100,
          booked: 0
        };
        this.availableDatesMap.set(availableDateId, newAvailableDate);
      });
    });
    
    // Create admin user
    const adminUser: User = {
      id: this.userIdCounter++,
      username: 'admin',
      password: '$2b$10$dGq7qbQqGRHirpNPZ4Xqz.FCHdZRbUGLJgy8qw0YD5.6yCiJzK5Em', // password is 'admin'
      isAdmin: true,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phone: '123-456-7890'
    };
    this.usersMap.set(adminUser.id, adminUser);
  }
}

export const storage = new MemStorage();
