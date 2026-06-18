import { z } from "zod";

export const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
] as const;

export const DRIVER_TYPES = [
  { value: "bolt", label: "Bolt driver" },
  { value: "uber", label: "Uber driver" },
  { value: "taxi", label: "Taxi operator" },
  { value: "delivery", label: "Delivery driver" },
  { value: "business_owner", label: "Business owner" },
] as const;

export const VEHICLE_TYPES = [
  { value: "hatchback", label: "Hatchback" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "bakkie", label: "Bakkie" },
  { value: "van", label: "Van" },
] as const;

export const USAGE_TYPES = [
  { value: "ride_hailing", label: "Ride-hailing" },
  { value: "delivery", label: "Delivery" },
  { value: "personal", label: "Personal" },
  { value: "business_fleet", label: "Business fleet" },
] as const;

const SA_ID_REGEX = /^\d{13}$/;
const SA_PHONE_REGEX = /^(0|\+27)[0-9]{9}$/;

export const personalDetailsSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  idNumber: z
    .string()
    .regex(SA_ID_REGEX, "Enter a valid 13-digit South African ID number"),
  phone: z
    .string()
    .regex(SA_PHONE_REGEX, "Enter a valid South African phone number"),
  email: z.string().email("Enter a valid email address"),
  address: z.string().min(5, "Enter your street address"),
  province: z.enum(PROVINCES, { message: "Select your province" }),
  city: z.string().min(2, "Enter your city"),
});

export const employmentSchema = z.object({
  driverType: z.enum(
    DRIVER_TYPES.map((d) => d.value) as [string, ...string[]],
    { message: "Select your driver type" }
  ),
  employer: z.string().optional(),
  monthlyIncome: z.coerce
    .number({ message: "Enter your monthly income" })
    .positive("Monthly income must be greater than 0"),
  monthlyExpenses: z.coerce
    .number({ message: "Enter your monthly expenses" })
    .min(0, "Monthly expenses cannot be negative"),
});

export const vehicleRequirementsSchema = z.object({
  vehicleType: z.enum(
    VEHICLE_TYPES.map((v) => v.value) as [string, ...string[]],
    { message: "Select a vehicle type" }
  ),
  budget: z.coerce
    .number({ message: "Enter your monthly budget" })
    .positive("Budget must be greater than 0"),
  usageType: z.enum(
    USAGE_TYPES.map((u) => u.value) as [string, ...string[]],
    { message: "Select how you'll use the vehicle" }
  ),
});

export const documentsSchema = z.object({
  idCopy: z.boolean().refine((v) => v, "ID copy is required"),
  driverLicense: z.boolean().refine((v) => v, "Driver's license is required"),
  proofOfAddress: z.boolean().refine((v) => v, "Proof of address is required"),
  bankStatements: z.boolean().refine((v) => v, "Bank statements are required"),
  payslips: z.boolean().optional(),
});

export const applicationSchema = personalDetailsSchema
  .merge(employmentSchema)
  .merge(vehicleRequirementsSchema)
  .merge(documentsSchema);

export type PersonalDetails = z.infer<typeof personalDetailsSchema>;
export type Employment = z.infer<typeof employmentSchema>;
export type VehicleRequirements = z.infer<typeof vehicleRequirementsSchema>;
export type Documents = z.infer<typeof documentsSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type ApplicationInput = z.input<typeof applicationSchema>;

export const APPLICATION_STEPS = [
  "Personal details",
  "Employment",
  "Vehicle",
  "Documents",
  "Review",
] as const;

/**
 * Generates a human-readable application reference number.
 * Format: GDC-{8 alphanumeric characters}
 * In production this should be generated server-side and persisted
 * against the application record to guarantee uniqueness.
 */
export function generateApplicationNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `GDC-${suffix}`;
}
