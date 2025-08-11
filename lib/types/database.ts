import { z } from 'zod'

// City schema
export const CitySchema = z.object({
  id: z.string(),
  name: z.string(),
  coordinates: z.tuple([z.number(), z.number()]),
  region: z.string(),
  population: z.number().optional(),
  timezone: z.string().optional(),
})

// Venue schema
export const VenueSchema = z.object({
  id: z.string(),
  name: z.string(),
  cityId: z.string(),
  capacity: z.number().optional(),
  type: z.enum(['stadium', 'arena', 'club', 'hall', 'outdoor']),
  address: z.string().optional(),
})

// Concert schema
export const ConcertSchema = z.object({
  id: z.string(),
  date: z.string(), // ISO date string
  cityId: z.string(),
  venueId: z.string(),
  type: z.string().optional(),
  status: z.enum(['upcoming', 'past', 'cancelled']),
  ticketUrl: z.string().url().optional(),
  soldOut: z.boolean().default(false),
  price: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('RUB'),
  }).optional(),
})

// Extended concert with joined data
export const ConcertWithDetailsSchema = ConcertSchema.extend({
  city: CitySchema,
  venue: VenueSchema,
})

export type City = z.infer<typeof CitySchema>
export type Venue = z.infer<typeof VenueSchema>
export type Concert = z.infer<typeof ConcertSchema>
export type ConcertWithDetails = z.infer<typeof ConcertWithDetailsSchema>

// Collection schemas for Blob storage
export const CitiesCollectionSchema = z.array(CitySchema)
export const VenuesCollectionSchema = z.array(VenueSchema)
export const ConcertsCollectionSchema = z.array(ConcertSchema)