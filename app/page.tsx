import { TopStripe } from "@/components/top-stripe";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { SearchBar } from "@/components/search-bar";
import { WhyChooseUs } from "@/components/why-choose-us";
import { FinanceTabs } from "@/components/finance-tabs";
import { ContactSection } from "@/components/contact-section";
import { CarGrid } from "@/components/car-grid";
import { TestimonialsSection } from "@/components/testimonials-section";
import { PreFooterHero } from "@/components/pre-footer-hero";
import { Footer } from "@/components/footer";
import { getInventoryOnce } from "@/lib/firebase/inventory-read";
import { getSiteSettingsOnce, DEFAULT_SITE_SETTINGS } from "@/lib/firebase/site-settings";
import type { InventoryItem } from "@/lib/dashboard-data";

export default async function Home() {
  let initialCars: InventoryItem[] | undefined;
  try {
    initialCars = await getInventoryOnce();
  } catch {
    // Firestore may be unreachable or rules not yet published at build/render
    // time — leave initialCars undefined (rather than []) so useInventory()
    // knows this isn't "zero items", starts in a loading state, and shows a
    // skeleton instead of a blank grid while its client-side subscription
    // fetches the real data.
  }

  let initialSiteSettings = DEFAULT_SITE_SETTINGS;
  try {
    initialSiteSettings = await getSiteSettingsOnce();
  } catch {
    // Same fallback reasoning as above — the client-side subscription in
    // useSiteSettings() picks up the real value at runtime.
  }

  return (
    <>
      <TopStripe />
      <Navbar />
      <main className="flex-1 pt-9 sm:pt-0">
        <Hero initialSettings={initialSiteSettings} />

        <div className="bg-background py-6 sm:py-8">
          <SearchBar />
        </div>

        <CarGrid initialCars={initialCars} initialSettings={initialSiteSettings} />
        <WhyChooseUs />
        <TestimonialsSection />
        <FinanceTabs />
        <ContactSection initialSettings={initialSiteSettings} />
        <PreFooterHero />
      </main>
      <Footer />
    </>
  );
}
