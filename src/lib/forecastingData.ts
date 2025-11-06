// Load forecasting data from JSON file dynamically
let forecastingData: any = null;
let serviceNames: string[] = [];

// Load data dynamically to avoid build-time import errors
const loadForecastingData = async () => {
  if (forecastingData) {
    return forecastingData;
  }

  // Try multiple paths to find the JSON file
  const paths = [
    '/JSON/updated_bridge.json',  // Public folder (dev & prod)
    './JSON/updated_bridge.json', // Relative path (prod)
    '/updated_bridge.json',        // Root fallback
  ];

  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        forecastingData = await response.json();
        serviceNames = Object.keys(forecastingData.meter_groups || {});
        console.log(`✅ Loaded updated_bridge.json from ${path}`);
        return forecastingData;
      }
    } catch (error) {
      // Continue to next path
      continue;
    }
  }

  // If all paths fail, log warning and return empty structure
  console.warn('⚠️ Could not load updated_bridge.json. Please ensure the file exists in public/JSON/ or dist/JSON/');
  forecastingData = { meter_groups: {} };
  serviceNames = [];
  return forecastingData;
};

// Initialize data on module load
loadForecastingData();

export interface ServiceData {
  name: string;
  bestModel?: {
    name: string;
    RMSE: number;
    MAE: number;
    MAPE: number;
  };
  modelPerformance?: Array<{
    model?: string;
    RMSE?: number;
    MAE?: number;
    MAPE?: number;
  }>;
  forecastData: {
    timestamps: string[];
    actual: Array<number | null>;
    predicted: Array<number | null>;
  };
  rollingAverage?: {
    timestamps?: string[];
    [key: string]: any; // dynamic series like daily, roll_10, roll_30
  };
  summaryStats?: {
    Mean?: number;
    Median?: number;
    Min?: number;
    Max?: number;
    StdDev?: number;
    IQR?: number;
    CV?: number;
  };
}

// Export service names (will be populated after data loads)
export { serviceNames };

// Re-export the load function for manual initialization if needed
export { loadForecastingData };

export function getServiceData(serviceName: string): ServiceData | null {
  // Ensure data is loaded
  if (!forecastingData || !forecastingData.meter_groups) {
    return null;
  }

  const service = forecastingData.meter_groups[serviceName as keyof typeof forecastingData.meter_groups];
  
  if (!service) {
    return null;
  }

  return {
    name: serviceName,
    bestModel: service.best_model,
    modelPerformance: service.model_performance,
    forecastData: {
      timestamps: service.forecast_graph_data?.timestamps || [],
      actual: service.forecast_graph_data?.actual || [],
      predicted: service.forecast_graph_data?.predicted || [],
    },
    rollingAverage: service.rolling_average_graph || {},
    summaryStats: service.summary_stats || undefined,
  };
}

export function getAllServicesData(): ServiceData[] {
  // Ensure data is loaded
  if (!forecastingData || serviceNames.length === 0) {
    return [];
  }
  return serviceNames.map(name => getServiceData(name)).filter(Boolean) as ServiceData[];
}

// Helper function to ensure data is loaded before use
export async function ensureDataLoaded(): Promise<void> {
  await loadForecastingData();
}
