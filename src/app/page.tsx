"use client";

import { useState } from "react";
import { HeroFun } from "@/components/peques/HeroFun";
import { ActivitySearchBar } from "@/components/peques/ActivitySearchBar";
import { FeaturedActivities } from "@/components/peques/FeaturedActivities";
import { HowItWorks } from "@/components/peques/HowItWorks";
import { LearningInsideApp } from "@/components/peques/LearningInsideApp";
import { PublishCTA } from "@/components/peques/PublishCTA";
import { Testimonials } from "@/components/peques/Testimonials";
import { FAQ } from "@/components/peques/FAQ";

export default function Main() {
  const [searchFilters, setSearchFilters] = useState<{
    age: string | null;
    topic: string | null;
    modality: string | null;
  } | undefined>(undefined);

  const handleSearch = (filters: { age: string | null; topic: string | null; modality: string | null }) => {
    console.log("Main page received filters:", filters);
    setSearchFilters(filters);

    // Scroll to activities section
    const activitiesSection = document.getElementById("actividades");
    if (activitiesSection) {
      activitiesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <HeroFun />

      {/* Search Bar */}
      <ActivitySearchBar onSearch={handleSearch} />

      {/* Featured Activities */}
      <FeaturedActivities filters={searchFilters} />

      {/* How It Works */}
      <HowItWorks />

      {/* Learning Inside App */}
      <LearningInsideApp />

      {/* Publish CTA for organizers */}
      <PublishCTA />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />
    </>
  );
}
