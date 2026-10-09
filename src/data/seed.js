export const providers = [
  { id: 'p1', owner: 'provider', name: 'Ruwan Silva', role: 'Plumber', category: 'Plumbing', rating: 4.8, reviews: 128, price: 1600, experience: '7 years', location: 'Colombo 04', distance: '1.2 km', initials: 'RS', color: 'peach', verified: true, available: true, description: 'Reliable plumbing repairs, installations and emergency callouts. I take care to leave every home clean and tidy.', services: ['Tap & pipe repair', 'Bathroom installation', 'Leak inspection'] },
  { id: 'p2', owner: 'provider', name: 'Nimali Perera', role: 'Electrician', category: 'Electrical', rating: 4.9, reviews: 96, price: 2200, experience: '9 years', location: 'Colombo 05', distance: '2.4 km', initials: 'NP', color: 'lavender', verified: true, available: true, description: 'Certified electrician for safe home wiring, lighting and appliance installations.', services: ['Electrical repair', 'Lighting installation', 'Safety inspection'] },
  { id: 'p3', owner: 'provider', name: 'Kasun Fernando', role: 'AC Technician', category: 'Cooling', rating: 4.7, reviews: 74, price: 2800, experience: '6 years', location: 'Rajagiriya', distance: '3.1 km', initials: 'KF', color: 'mint', verified: true, available: true, description: 'Air conditioning service and repair with clear pricing and dependable appointment times.', services: ['AC service', 'AC repair', 'New unit installation'] },
  { id: 'p4', name: 'Ishara Jayasinghe', role: 'House Cleaner', category: 'Cleaning', rating: 4.9, reviews: 152, price: 1800, experience: '5 years', location: 'Colombo 03', distance: '2.0 km', initials: 'IJ', color: 'blue', verified: true, available: true, description: 'Friendly and detail-focused home cleaning, from a quick refresh to a full deep clean.', services: ['Home cleaning', 'Deep cleaning', 'Move-in cleaning'] },
  { id: 'p5', name: 'Sahan Wickrama', role: 'Carpenter', category: 'Carpentry', rating: 4.6, reviews: 53, price: 2000, experience: '8 years', location: 'Nugegoda', distance: '4.5 km', initials: 'SW', color: 'sand', verified: true, available: true, description: 'Custom carpentry and thoughtful repairs for furniture, doors and shelves.', services: ['Furniture repair', 'Door fitting', 'Custom shelving'] },
  { id: 'p6', name: 'Anushka de Silva', role: 'Painter', category: 'Painting', rating: 4.8, reviews: 68, price: 2400, experience: '10 years', location: 'Bambalapitiya', distance: '3.6 km', initials: 'AD', color: 'rose', verified: true, available: true, description: 'Careful interior painting with neat finishes and help choosing the right colour.', services: ['Interior painting', 'Wall preparation', 'Touch-ups'] },
]

export const seedBookings = [
  { id: 'HS-2048', providerId: 'p1', providerName: 'Ruwan Silva', service: 'Tap & pipe repair', date: '2026-10-08', time: '10:00 AM', address: 'No. 32, Kotte Road, Colombo 04', price: 2000, status: 'Confirmed', createdAt: '2026-10-04' },
  { id: 'HS-2042', providerId: 'p4', providerName: 'Ishara Jayasinghe', service: 'Home cleaning', date: '2026-10-03', time: '02:00 PM', address: 'No. 32, Kotte Road, Colombo 04', price: 2200, status: 'Completed', createdAt: '2026-09-28' },
  { id: 'HS-2031', providerId: 'p2', providerName: 'Nimali Perera', service: 'Lighting installation', date: '2026-09-20', time: '09:00 AM', address: 'No. 32, Kotte Road, Colombo 04', price: 2600, status: 'Completed', createdAt: '2026-09-15' },
]

export const categories = [
  { name: 'Plumbing', icon: '🔧', tone: 'peach' }, { name: 'Electrical', icon: '⚡', tone: 'lavender' },
  { name: 'Cleaning', icon: '🧹', tone: 'mint' }, { name: 'Cooling', icon: '❄️', tone: 'blue' },
  { name: 'Carpentry', icon: '🪚', tone: 'sand' }, { name: 'Painting', icon: '🖌️', tone: 'rose' },
]

