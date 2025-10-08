export interface HistoricalData {
  date: string;
  meterSubCategory: string;
  totalQuantity: number;
  totalCost: number;
}

export interface EligibilityResult {
  status: 'Eligible Stable >€12K' | 'Eligible Decreasing >€20K' | 'Not Eligible Erratic >€12K' | 'Not Eligible Low <€12K';
  total: number;
  variance: number;
  trend: string;
}

export interface ForecastData {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
}

export const mockHistoricalData: HistoricalData[] = [
  { date: '2024-12-01', meterSubCategory: 'DSv5 Series', totalQuantity: 1200, totalCost: 13500 },
  { date: '2025-01-01', meterSubCategory: 'DSv5 Series', totalQuantity: 1250, totalCost: 14000 },
  { date: '2025-02-01', meterSubCategory: 'DSv5 Series', totalQuantity: 1280, totalCost: 14200 },
  { date: '2025-03-01', meterSubCategory: 'DSv5 Series', totalQuantity: 1300, totalCost: 14500 },
  { date: '2025-04-01', meterSubCategory: 'DSv5 Series', totalQuantity: 1320, totalCost: 14800 },
  { date: '2025-05-01', meterSubCategory: 'DSv5 Series', totalQuantity: 1350, totalCost: 15000 },
  { date: '2025-06-01', meterSubCategory: 'DSv5 Series', totalQuantity: 1380, totalCost: 15200 },
  { date: '2025-07-01', meterSubCategory: 'DSv5 Series', totalQuantity: 1400, totalCost: 15500 },
  { date: '2025-08-01', meterSubCategory: 'DSv5 Series', totalQuantity: 1420, totalCost: 15800 },
  { date: '2025-09-01', meterSubCategory: 'DSv5 Series', totalQuantity: 1450, totalCost: 16000 },
  { date: '2024-12-01', meterSubCategory: 'BSv5 Series', totalQuantity: 800, totalCost: 22000 },
  { date: '2025-01-01', meterSubCategory: 'BSv5 Series', totalQuantity: 750, totalCost: 21000 },
  { date: '2025-02-01', meterSubCategory: 'BSv5 Series', totalQuantity: 720, totalCost: 20500 },
  { date: '2025-03-01', meterSubCategory: 'BSv5 Series', totalQuantity: 700, totalCost: 20000 },
  { date: '2025-04-01', meterSubCategory: 'BSv5 Series', totalQuantity: 680, totalCost: 19500 },
  { date: '2025-05-01', meterSubCategory: 'BSv5 Series', totalQuantity: 650, totalCost: 19000 },
  { date: '2025-06-01', meterSubCategory: 'BSv5 Series', totalQuantity: 630, totalCost: 18500 },
  { date: '2025-07-01', meterSubCategory: 'BSv5 Series', totalQuantity: 600, totalCost: 18000 },
  { date: '2025-08-01', meterSubCategory: 'BSv5 Series', totalQuantity: 580, totalCost: 17500 },
  { date: '2025-09-01', meterSubCategory: 'BSv5 Series', totalQuantity: 550, totalCost: 17000 },
];

export const mockEligibility: Record<string, EligibilityResult> = {
  'DSv5 Series': {
    status: 'Eligible Stable >€12K',
    total: 15000,
    variance: 3.2,
    trend: 'stable',
  },
  'BSv5 Series': {
    status: 'Eligible Decreasing >€20K',
    total: 20000,
    variance: 8.5,
    trend: 'decreasing',
  },
  'FSv2 Series': {
    status: 'Not Eligible Erratic >€12K',
    total: 13000,
    variance: 45.2,
    trend: 'erratic',
  },
  'Esv4 Series': {
    status: 'Not Eligible Low <€12K',
    total: 8500,
    variance: 12.1,
    trend: 'low',
  },
};

export const generateMockForecast = (meterCategory: string, months: number = 15): ForecastData[] => {
  const baseValue = mockEligibility[meterCategory]?.total || 15000;
  const forecasts: ForecastData[] = [];
  
  for (let i = 1; i <= months; i++) {
    const date = new Date(2025, 9 + i, 1); // Starting from Oct 2025
    const predicted = baseValue * (1 + (Math.random() * 0.1 - 0.05));
    const margin = predicted * 0.1;
    
    forecasts.push({
      date: date.toISOString().split('T')[0],
      predicted: Math.round(predicted),
      lower: Math.round(predicted - margin),
      upper: Math.round(predicted + margin),
    });
  }
  
  return forecasts;
};

export const mockReservations = [
  { group: 'DSv5 Series', reason: 'Eligible Stable >€12K', projected: 15000, hours: 8760, savings: 32 },
  { group: 'BSv5 Series', reason: 'Eligible Decreasing >€20K', projected: 20000, hours: 8760, savings: 28 },
  { group: 'MSv3 Series', reason: 'Eligible Stable >€12K', projected: 18000, hours: 8760, savings: 35 },
  { group: 'LSv3 Series', reason: 'Eligible Stable >€12K', projected: 16500, hours: 8760, savings: 30 },
];
