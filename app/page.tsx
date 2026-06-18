import { SiteHeader } from "@/components/marketing/site-header";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { DriversAndBusiness } from "@/components/marketing/drivers-and-business";
import { Faqs } from "@/components/marketing/faqs";
import { FinalCta } from "@/components/marketing/final-cta";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <DriversAndBusiness />
        <Faqs />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
