import { mockEligibility, generateMockForecast, type EligibilityResult, type ForecastData } from './mockData';

export const checkEligibility = async (meterCategory: string): Promise<EligibilityResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = mockEligibility[meterCategory] || {
        status: 'Not Eligible Low <€12K' as const,
        total: 8000,
        variance: 15,
        trend: 'low',
      };
      resolve(result);
    }, 800);
  });
};

export const getForecast = async (meterCategory: string, horizon: number = 15): Promise<ForecastData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const forecast = generateMockForecast(meterCategory, horizon);
      resolve(forecast);
    }, 1200);
  });
};

export const generateReservationCSV = async (reservationData: any): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const csv = `Resource,ForecastedQty,Term,Savings\n${reservationData.group},${reservationData.hours},1Y,${reservationData.savings}%`;
      resolve(csv);
    }, 500);
  });
};
