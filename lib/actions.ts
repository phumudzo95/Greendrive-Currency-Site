// Client-side Supabase insert — works with static export (GitHub Pages)
import { createClient } from "@supabase/supabase-js";
import { applicationSchema, generateApplicationNumber } from "@/lib/application-schema";

export type SubmitResult =
  | { success: true; referenceNumber: string }
  | { success: false; error: string };

export async function submitApplication(formData: unknown): Promise<SubmitResult> {
  const parsed = applicationSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: "Some fields are invalid. Please check and try again." };
  }

  const data = parsed.data;
  const referenceNumber = generateApplicationNumber();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from("applications").insert({
    reference_number:     referenceNumber,
    full_name:            data.fullName,
    id_number:            data.idNumber,
    phone:                data.phone,
    email:                data.email,
    address:              data.address,
    province:             data.province,
    city:                 data.city,
    driver_type:          data.driverType,
    employer:             data.employer ?? null,
    monthly_income:       data.monthlyIncome,
    monthly_expenses:     data.monthlyExpenses,
    vehicle_type:         data.vehicleType,
    budget:               data.budget,
    usage_type:           data.usageType,
    doc_id_copy:          data.idCopy,
    doc_driver_license:   data.driverLicense,
    doc_proof_of_address: data.proofOfAddress,
    doc_bank_statements:  data.bankStatements,
    doc_payslips:         data.payslips ?? false,
  });

  if (error) {
    return { success: false, error: "Could not save your application. Please try again or WhatsApp us on 069 656 8639." };
  }

  return { success: true, referenceNumber };
}
