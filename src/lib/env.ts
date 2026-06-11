function createGoogleMapsEmbedUrl(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`
}

export const env = {
  clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  salonName: import.meta.env.VITE_SALON_NAME ?? 'Studio Lumi',
  salonTagline: import.meta.env.VITE_SALON_TAGLINE ?? 'Boutique Hair Studio',
  salonHeroLabel: import.meta.env.VITE_SALON_HERO_LABEL ?? import.meta.env.VITE_SALON_NAME ?? 'Studio Lumi',
  salonHeroTitle:
    import.meta.env.VITE_SALON_HERO_TITLE ??
    'En lugn och professionell salongsupplevelse, fran forsta klick till fardig behandling.',
  salonHeroDescription:
    import.meta.env.VITE_SALON_HERO_DESCRIPTION ??
    'En modern skonhetssalong med tydliga behandlingar, enkel bokning och ett personligt bemotande. Se tjanster, hitta lediga tider och boka direkt utan konto.',
  salonHighlightOneLabel: import.meta.env.VITE_SALON_HIGHLIGHT_ONE_LABEL ?? 'Personlig service',
  salonHighlightOneValue: import.meta.env.VITE_SALON_HIGHLIGHT_ONE_VALUE ?? 'Omsorg i varje detalj',
  salonHighlightTwoLabel: import.meta.env.VITE_SALON_HIGHLIGHT_TWO_LABEL ?? 'Boka utan konto',
  salonHighlightTwoValue: import.meta.env.VITE_SALON_HIGHLIGHT_TWO_VALUE ?? 'Snabbt och enkelt',
  salonHighlightThreeLabel: import.meta.env.VITE_SALON_HIGHLIGHT_THREE_LABEL ?? 'Tydliga behandlingar',
  salonHighlightThreeValue: import.meta.env.VITE_SALON_HIGHLIGHT_THREE_VALUE ?? 'Pris och tid direkt',
  salonFeatureBadge: import.meta.env.VITE_SALON_FEATURE_BADGE ?? 'Signaturbesok',
  salonFeatureTitle:
    import.meta.env.VITE_SALON_FEATURE_TITLE ??
    'Tidlost uttryck, varm atmosfar och resultat som haller.',
  salonFeatureDescription:
    import.meta.env.VITE_SALON_FEATURE_DESCRIPTION ??
    'Vi arbetar med klippning, styling och behandlingar i en lugn miljo med fokus pa kvalitet och detaljer.',
  salonFeatureCardOneTitle: import.meta.env.VITE_SALON_FEATURE_CARD_ONE_TITLE ?? 'Farg, klipp och styling',
  salonFeatureCardOneDescription:
    import.meta.env.VITE_SALON_FEATURE_CARD_ONE_DESCRIPTION ?? 'Behandlingar anpassade efter stil, form och helhetskansla.',
  salonFeatureCardTwoTitle: import.meta.env.VITE_SALON_FEATURE_CARD_TWO_TITLE ?? 'Bokning pa mobilen',
  salonFeatureCardTwoDescription:
    import.meta.env.VITE_SALON_FEATURE_CARD_TWO_DESCRIPTION ?? 'Boka din tid enkelt, snabbt och nar det passar dig.',
  salonAboutTitle:
    import.meta.env.VITE_SALON_ABOUT_TITLE ?? 'Professionell harvard med personlig kansla.',
  salonAboutDescription:
    import.meta.env.VITE_SALON_ABOUT_DESCRIPTION ??
    'Vi kombinerar precisionsklippning, farg och styling med ett personligt bemotande i en lugn och modern studio.',
  salonBenefitOne:
    import.meta.env.VITE_SALON_BENEFIT_ONE ?? 'Personlig konsultation och resultat anpassat efter dig.',
  salonBenefitTwo:
    import.meta.env.VITE_SALON_BENEFIT_TWO ?? 'Tydliga priser och enkel bokning direkt online.',
  salonBenefitThree:
    import.meta.env.VITE_SALON_BENEFIT_THREE ?? 'Lugn studio med modern kansla och noggrant utvalda behandlingar.',
  salonBenefitFour:
    import.meta.env.VITE_SALON_BENEFIT_FOUR ?? 'Adress, kontakt och oppettider samlade pa ett stalle.',
  salonContactIntroTitle:
    import.meta.env.VITE_SALON_CONTACT_INTRO_TITLE ?? 'Boka din nasta tid eller hitta till studion.',
  salonFooterDescription:
    import.meta.env.VITE_SALON_FOOTER_DESCRIPTION ??
    'erbjuder klippning, styling och behandlingar i en lugn studio med enkel onlinebokning.',
  salonPhone: import.meta.env.VITE_SALON_PHONE ?? '08-123 45 67',
  salonEmail: import.meta.env.VITE_SALON_EMAIL ?? 'hej@studiolumi.se',
  salonAddress: import.meta.env.VITE_SALON_ADDRESS ?? 'Storgatan 12, Stockholm',
  salonInstagramUrl: import.meta.env.VITE_SALON_INSTAGRAM_URL ?? '',
  salonFacebookUrl: import.meta.env.VITE_SALON_FACEBOOK_URL ?? '',
  salonTiktokUrl: import.meta.env.VITE_SALON_TIKTOK_URL ?? '',
  salonMapEmbedUrl: createGoogleMapsEmbedUrl(import.meta.env.VITE_SALON_ADDRESS ?? 'Storgatan 12, Stockholm'),
  servicesPageTitle:
    import.meta.env.VITE_SERVICES_PAGE_TITLE ?? 'Behandlingar med tydligt pris och tidsatgang',
  servicesPageDescription:
    import.meta.env.VITE_SERVICES_PAGE_DESCRIPTION ??
    'Se behandlingar, priser och behandlingstid innan du bokar din tid.',
  contactPageTitle:
    import.meta.env.VITE_CONTACT_PAGE_TITLE ?? 'Hitta till salongen och kontakta oss direkt.',
  contactPageDescription:
    import.meta.env.VITE_CONTACT_PAGE_DESCRIPTION ??
    'En enkel kontaktsida med adress, telefon, e-post och karta for kunder som vill hitta ratt innan besoket.',
} as const

export const isConfigured = {
  clerk: Boolean(env.clerkPublishableKey),
  supabase: Boolean(env.supabaseUrl && env.supabaseAnonKey),
} as const