import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { storeService } from '../../services/storeService';
import { useLanguage } from '../../context/LanguageContext';
import { Button, Container, FadeUp, SectionHeading, SectionSurface } from '../ui';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { language, t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleaned = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setErrorMessage(
        language === 'en' ? 'Please enter a valid email address.' : t('home.newsletter.error')
      );
      setStatusMessage('');
      return;
    }

    setErrorMessage('');
    setSubmitting(true);
    const result = await storeService.subscribeNewsletter(cleaned);
    setSubmitting(false);

    if (result.ok) {
      setStatusMessage(result.message);
      setEmail('');
    } else if (result.error.isNetworkError) {
      setStatusMessage(t('home.newsletter.success'));
      setEmail('');
    } else {
      setErrorMessage(result.error.message);
    }
  };

  return (
    <SectionSurface tone="green" withGrain withJaali>
      <Container size="narrow">
        <FadeUp className="text-center space-y-6">
          <SectionHeading
            variant="centered"
            dark
            eyebrow={language === 'en' ? 'Seasonal & Festive Updates' : t('home.newsletter.eyebrow')}
            title={
              language === 'en'
                ? 'Receive Festival Pre-Order & Fresh Batch Alerts'
                : t('home.newsletter.title')
            }
            subtitle={
              language === 'en'
                ? 'Stay informed when seasonal Diwali, Holi, and Chhath assortments or fresh ghee batches open for local delivery.'
                : t('home.newsletter.subtitle')
            }
          />

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('home.newsletter.placeholder')}
              aria-label="Email address for store updates"
              className="flex-1 px-5 py-3 rounded-full bg-[#FFFDF8] border border-[#C9A24B]/45 text-sm text-[#1B1B1B] placeholder:text-[#7A7468] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] min-h-[46px]"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              dark
              loading={submitting}
              disabled={submitting}
              className="shrink-0"
            >
              {t('home.newsletter.button')}
            </Button>
          </form>

          {errorMessage && (
            <p
              role="alert"
              className="inline-block px-4 py-2 rounded-full bg-[#FDF1EC] text-[#B84A24] text-xs font-semibold"
            >
              {errorMessage}
            </p>
          )}

          {statusMessage && (
            <div
              role="status"
              className="inline-flex items-start gap-2 text-left max-w-lg mx-auto px-4 py-3 rounded-[16px] bg-[#FFFDF8] border border-[#C9A24B]/45 text-xs font-medium text-[#0F3D2E] gg-shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-[#0F3D2E] shrink-0 mt-0.5" aria-hidden="true" />
              <span>{statusMessage}</span>
            </div>
          )}
        </FadeUp>
      </Container>
    </SectionSurface>
  );
}
