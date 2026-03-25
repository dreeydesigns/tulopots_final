export const money = (n: number) => `KSh ${new Intl.NumberFormat('en-KE').format(n)}`;
export const getCategoryLabel = (category: string) => category === 'indoor' ? 'Indoor Plants' : category === 'outdoor' ? 'Outdoor Plants' : category === 'pots' ? 'Pots Only' : 'Studio Collection';
