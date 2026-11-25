import HeroSection from '../components/home/HeroSection';
import CategoryShowcase from '../components/home/CategoryShowcase';
import BestsellingSection from '../components/home/BestsellingSection';
import FeaturedGheeSection from '../components/home/FeaturedGheeSection';
import MithaiSnacksSection from '../components/home/MithaiSnacksSection';
import WhyChooseSection from '../components/home/WhyChooseSection';
import BrandStorySection from '../components/home/BrandStorySection';
import VerifiedReviewsSection from '../components/home/VerifiedReviewsSection';
import SpecialOffersSection from '../components/home/SpecialOffersSection';
import StoreLocationPreview from '../components/home/StoreLocationPreview';
import NewsletterSection from '../components/home/NewsletterSection';
import InstagramSection from '../components/home/InstagramSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryShowcase />
      <BestsellingSection />
      <FeaturedGheeSection />
      <MithaiSnacksSection />
      <WhyChooseSection />
      <BrandStorySection />
      <VerifiedReviewsSection />
      <SpecialOffersSection />
      <StoreLocationPreview />
      <NewsletterSection />
      <InstagramSection />
    </>
  );
}
