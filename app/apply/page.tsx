import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ApplicationForm } from "@/components/apply/application-form";

export default function ApplyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-gd-cream py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-[26px] font-extrabold tracking-tight text-gd-black sm:text-[30px]">
              Apply for vehicle ownership
            </h1>
            <p className="mt-2 text-[14.5px] text-gd-mute">
              Takes about five minutes. No credit checks.
            </p>
          </div>
          <ApplicationForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
