"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicationSchema,
  type Application,
  type ApplicationInput,
  PROVINCES,
  DRIVER_TYPES,
  VEHICLE_TYPES,
  USAGE_TYPES,
  APPLICATION_STEPS,
} from "@/lib/application-schema";
import { submitApplication } from "@/lib/actions";
import { StepIndicator } from "./step-indicator";
import { Field, TextInput, Select } from "./form-fields";

const STEP_FIELDS: (keyof ApplicationInput)[][] = [
  ["fullName", "idNumber", "phone", "email", "address", "province", "city"],
  ["driverType", "employer", "monthlyIncome", "monthlyExpenses"],
  ["vehicleType", "budget", "usageType"],
  ["idCopy", "driverLicense", "proofOfAddress", "bankStatements", "payslips"],
  [],
];

const DOCUMENT_ITEMS: { key: keyof ApplicationInput; label: string; required: boolean }[] = [
  { key: "idCopy", label: "ID copy", required: true },
  { key: "driverLicense", label: "Driver's license", required: true },
  { key: "proofOfAddress", label: "Proof of address", required: true },
  { key: "bankStatements", label: "Bank statements", required: true },
  { key: "payslips", label: "Payslips", required: false },
];

export function ApplicationForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    trigger,
    watch,
    formState: { errors },
  } = useForm<ApplicationInput, unknown, Application>({
    resolver: zodResolver(applicationSchema),
    mode: "onTouched",
    defaultValues: {
      monthlyIncome: undefined,
      monthlyExpenses: undefined,
      budget: undefined,
      idCopy: false,
      driverLicense: false,
      proofOfAddress: false,
      bankStatements: false,
      payslips: false,
    },
  });

  const values = watch();

  async function goNext() {
    const fieldsToValidate = STEP_FIELDS[step];
    const valid = fieldsToValidate.length === 0 || (await trigger(fieldsToValidate));
    if (valid) setStep((s) => Math.min(s + 1, APPLICATION_STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmitApplication() {
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitApplication(watch());
    setSubmitting(false);
    if (result.success) {
      setSubmitted(result.referenceNumber);
    } else {
      setSubmitError(result.error);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-gd-line bg-white p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gd-primary/10">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="#0D7A34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-5 text-[22px] font-extrabold text-gd-black">Application submitted</h2>
        <p className="mt-2 text-[14.5px] text-gd-mute">
          Your reference number is
        </p>
        <p className="mt-1 font-mono text-[20px] font-bold text-gd-primary">{submitted}</p>
        <p className="mt-4 text-[13.5px] leading-relaxed text-gd-mute">
          We&apos;ve sent a confirmation to your email. Our team will review your application and contact you within one hour.
        </p>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator currentStep={step} />

      <div className="rounded-2xl border border-gd-line bg-white p-6 sm:p-9">
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-[19px] font-bold text-gd-black">Personal details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" error={errors.fullName?.message}>
                <TextInput {...register("fullName")} placeholder="e.g. Thabo Mokoena" />
              </Field>
              <Field label="ID number" error={errors.idNumber?.message}>
                <TextInput {...register("idNumber")} placeholder="13-digit SA ID number" maxLength={13} />
              </Field>
              <Field label="Phone" error={errors.phone?.message}>
                <TextInput {...register("phone")} placeholder="e.g. 082 123 4567" />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <TextInput {...register("email")} type="email" placeholder="e.g. thabo@example.com" />
              </Field>
              <Field label="Address" error={errors.address?.message}>
                <TextInput {...register("address")} placeholder="Street address" />
              </Field>
              <Field label="Province" error={errors.province?.message}>
                <Select {...register("province")} defaultValue="">
                  <option value="" disabled>Select province</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              </Field>
              <Field label="City" error={errors.city?.message}>
                <TextInput {...register("city")} placeholder="e.g. Johannesburg" />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-[19px] font-bold text-gd-black">Employment</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Driver type" error={errors.driverType?.message}>
                <Select {...register("driverType")} defaultValue="">
                  <option value="" disabled>Select driver type</option>
                  {DRIVER_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Employer (optional)" error={errors.employer?.message}>
                <TextInput {...register("employer")} placeholder="e.g. self-employed" />
              </Field>
              <Field label="Monthly income (R)" error={errors.monthlyIncome?.message}>
                <TextInput {...register("monthlyIncome")} type="number" placeholder="e.g. 18000" />
              </Field>
              <Field label="Monthly expenses (R)" error={errors.monthlyExpenses?.message}>
                <TextInput {...register("monthlyExpenses")} type="number" placeholder="e.g. 9000" />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-[19px] font-bold text-gd-black">Vehicle requirements</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Vehicle type" error={errors.vehicleType?.message}>
                <Select {...register("vehicleType")} defaultValue="">
                  <option value="" disabled>Select vehicle type</option>
                  {VEHICLE_TYPES.map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Monthly budget (R)" error={errors.budget?.message}>
                <TextInput {...register("budget")} type="number" placeholder="e.g. 6500" />
              </Field>
              <Field label="Usage type" error={errors.usageType?.message}>
                <Select {...register("usageType")} defaultValue="">
                  <option value="" disabled>Select usage type</option>
                  {USAGE_TYPES.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-[19px] font-bold text-gd-black">Document upload</h2>
            <p className="text-[13.5px] text-gd-mute">
              Documents are uploaded securely once your account is created. Confirm which documents you have ready.
            </p>
            <div className="space-y-3">
              {DOCUMENT_ITEMS.map((doc) => (
                <label
                  key={doc.key}
                  className="flex items-center justify-between rounded-lg border border-gd-line px-4 py-3.5"
                >
                  <span className="text-[14px] font-medium text-gd-black">
                    {doc.label}
                    {!doc.required && <span className="ml-1.5 text-[12px] text-gd-mute">(optional)</span>}
                  </span>
                  <input
                    type="checkbox"
                    {...register(doc.key)}
                    className="h-5 w-5 rounded border-gd-line text-gd-primary focus:ring-gd-primary/30"
                  />
                </label>
              ))}
            </div>
            {(errors.idCopy || errors.driverLicense || errors.proofOfAddress || errors.bankStatements) && (
              <p className="text-[12.5px] font-medium text-red-600">
                Please confirm all required documents are ready.
              </p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-[19px] font-bold text-gd-black">Review your application</h2>
            <div className="divide-y divide-gd-line rounded-lg border border-gd-line">
              {[
                ["Full name", values.fullName],
                ["Phone", values.phone],
                ["Email", values.email],
                ["City / Province", `${values.city ?? ""}, ${values.province ?? ""}`],
                ["Driver type", DRIVER_TYPES.find((d) => d.value === values.driverType)?.label ?? "—"],
                ["Monthly income", values.monthlyIncome ? `R ${values.monthlyIncome}` : "—"],
                ["Vehicle type", VEHICLE_TYPES.find((v) => v.value === values.vehicleType)?.label ?? "—"],
                ["Monthly budget", values.budget ? `R ${values.budget}` : "—"],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 text-[13.5px]">
                  <span className="text-gd-mute">{label}</span>
                  <span className="font-semibold text-gd-black">{val || "—"}</span>
                </div>
              ))}
            </div>
            <p className="text-[12.5px] leading-relaxed text-gd-mute">
              By submitting, you confirm that the information provided is accurate and consent to GreenDrive Currency assessing your affordability.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
              {submitError}
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="h-11 rounded-lg px-5 text-[14px] font-semibold text-gd-black disabled:opacity-0 disabled:pointer-events-none"
            >
              Back
            </button>
            {step < APPLICATION_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="h-11 rounded-lg bg-gd-primary px-7 text-[14px] font-bold text-white transition-colors hover:bg-gd-dark"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="h-11 rounded-lg bg-gd-primary px-7 text-[14px] font-bold text-white transition-colors hover:bg-gd-dark disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Submit application"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
