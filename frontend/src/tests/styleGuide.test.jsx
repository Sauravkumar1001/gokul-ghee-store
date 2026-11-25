import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';

describe('Phase 1 Design System & /styleguide Route', () => {
  it('renders /styleguide with brand palette tokens, typography specimens, and reusable primitives', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/styleguide']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /Anil Ji Ka Gokul Ghee — Visual Language & Tokens/i })
    ).toBeInTheDocument();

    // Palette hex tokens
    expect(screen.getByText('#0F3D2E')).toBeInTheDocument();
    expect(screen.getByText('#C9A24B')).toBeInTheDocument();
    expect(screen.getByText('#FBF7EE')).toBeInTheDocument();
    expect(screen.getByText('#D96B27')).toBeInTheDocument();

    // Button & SectionHeading variations
    expect(screen.getByRole('button', { name: /Primary Gold CTA/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /SectionHeading Variations/i })).toBeInTheDocument();

    // Test interactive language typography switch right on /styleguide
    await user.click(screen.getByRole('button', { name: /हिन्दी \(Devanagari\)/i }));
    expect(document.documentElement.lang).toBe('hi');
    expect(document.documentElement.dataset.gokulLang).toBe('hi');
  });
});
