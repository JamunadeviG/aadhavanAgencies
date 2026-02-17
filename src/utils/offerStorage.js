const OFFERS_KEY = 'aa_offers';

const defaultOffers = [
  {
    id: 'offer-veg-pack',
    title: 'Weekend Veg Pack',
    description: 'Flat 12% on 10+ kg mixed vegetables',
    discount: 12,
    validTill: '2026-02-05'
  },
  {
    id: 'offer-oil-combo',
    title: 'Oil Essentials',
    description: 'Buy 2 sunflower tins, get 1 litre free',
    discount: 15,
    validTill: '2026-02-10'
  }
];

const readOffers = () => {
  try {
    const raw = localStorage.getItem(OFFERS_KEY);
    if (!raw) {
      localStorage.setItem(OFFERS_KEY, JSON.stringify(defaultOffers));
      return defaultOffers;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read offers from storage', error);
    return defaultOffers;
  }
};

const writeOffers = (offers) => {
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
};

export const getOffers = () => readOffers();

export const addOffer = (offer) => {
  const offers = readOffers();
  offers.unshift({ ...offer, id: crypto.randomUUID?.() || Date.now().toString() });
  writeOffers(offers);
  return offers;
};

export const updateOffer = (id, updates) => {
  const offers = readOffers();
  const index = offers.findIndex((offer) => offer.id === id);
  if (index === -1) return offers;

  const updatedOffer = { ...offers[index], ...updates };
  offers.splice(index, 1);
  offers.unshift(updatedOffer);
  writeOffers(offers);
  return offers;
};

export const deleteOffer = (id) => {
  const offers = readOffers().filter((offer) => offer.id !== id);
  writeOffers(offers);
  return offers;
};
