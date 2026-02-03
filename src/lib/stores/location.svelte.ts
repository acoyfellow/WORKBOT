// Location store using Svelte 5 runes

export interface Location {
  id: string;
  name: string;
}

export const LOCATIONS: Location[] = [
  { id: 'gDtFIBrCnempxaF6emIs', name: 'Phonesites' },
  { id: 'OG4bIh7relMcYLo9Izfi', name: 'Apex Business' },
  { id: 'U7eJ93D9PN7tH01uiIMl', name: 'Closer Capital' },
  { id: 'OgoxaWFBx9k18Sker7XM', name: 'MedSpa Millions' },
  { id: 'dkzsEb9htVMJzjuxLb51', name: 'SignedSeal' },
];

// Svelte 5 rune-based reactive state - must be used in .svelte files
let selectedId = $state(LOCATIONS[0].id);

export const locationStore = {
  get selectedId() { return selectedId; },
  get selected() { 
    return LOCATIONS.find(l => l.id === selectedId) || LOCATIONS[0]; 
  },
  get locations() { return LOCATIONS; },
  select(id: string) {
    if (LOCATIONS.some(l => l.id === id)) {
      selectedId = id;
    }
  }
};
