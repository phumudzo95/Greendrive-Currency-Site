"use server";

import { applicationSchema, generateApplicationNumber } from "@/lib/application-schema";
import { createServerClient } from "@/lib/supabase";

export type SubmitResult =
  | { success: true; referenceNumber: string }
  | { success: false; error: string };

export async function submitApplication(
  formData: unknown
): Promise<SubmitResult> {
  // 1. Validate on the server regardless of client-side validation
  const parsed = applicationSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Some fields are invalid. Please check your application and try again.",
    };
  }

  const data = parsed.data;
  const referenceNumber = generateApplicationNumber();

  // 2. Persist to Supabase
  const supabase = createServerClient();
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
    console.error("[submitApplication] Supabase insert error:", error.message);
    return {
      success: false,
      error: "We could not save your application. Please try again or WhatsApp us on 069 656 8639.",
    };
  }

  return { success: true, referenceNumber };
}
