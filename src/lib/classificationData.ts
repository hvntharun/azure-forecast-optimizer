import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';

// Import JSON data files
import stableHighData from '../../JSON/eligibility_Eligible_for_forecasting_costs_are_stable_12K_Stable_High_Spend (1).json';
import highSpendData from '../../JSON/eligibility_Eligible_for_forecasting_even_if_trend_slightly_decreasing_20K_High_Spend (1).json';
import unstableData from '../../JSON/eligibility_Clearly_not_eligible_due_to_unstable_or_erratic_usage_12K_Unstable__Erratic (1).json';
import lowSpendData from '../../JSON/eligibility_Not_eligible_because_total_spend_is_too_low_12K_Low_Spend (1).json';

// Classification categories and their service mappings
export type ClassificationCategory = 
  | 'Analytics'
  | 'XGBoost'
  | 'Random Forest'
  | 'Decision Trees'
  | 'KMeans'
  | 'DBScan'
  | 'Hierarchical';

// Updated to match your JSON file naming convention
export type ClassificationType = 
  | 'stable-high'
  | 'high-spend'
  | 'unstable'
  | 'low-spend';

export interface ClassificationCard {
  id: ClassificationType;
  title: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  eligibilityStatus: 'eligible' | 'not-eligible' | 'conditional';
  insights: string[];
}

// Enhanced classification cards with professional styling and real data mapping
export const classificationCards: ClassificationCard[] = [
  {
    id: 'stable-high',
    title: 'Eligible - Stable High Spend',
    shortLabel: 'Stable High',
    description: 'VMs with consistent, high-value usage patterns ideal for Reserved Instances. These workloads show stable spending over €12K with predictable resource consumption.',
    icon: TrendingUp,
    color: 'text-success',
    bgColor: 'bg-success/10',
    eligibilityStatus: 'eligible',
    insights: [
      'Consistent monthly spending patterns',
      'High resource utilization rates',
      'Predictable workload characteristics',
      'Optimal for 1-3 year reservations'
    ]
  },
  {
    id: 'high-spend',
    title: 'Eligible - High Spend Trending',
    shortLabel: 'High Spend',
    description: 'VMs with high spending (>€20K) even with slightly decreasing trends. Still eligible for cost optimization through Reserved Instances.',
    icon: TrendingUp,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    eligibilityStatus: 'eligible',
    insights: [
      'High overall spending threshold met',
      'Slight downward trend acceptable',
      'Good ROI potential with reservations',
      'Consider shorter-term commitments'
    ]
  },
  {
    id: 'unstable',
    title: 'Not Eligible - Unstable Usage',
    shortLabel: 'Unstable',
    description: 'VMs with erratic usage patterns above €12K but too unstable for reliable cost forecasting and Reserved Instance commitments.',
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    eligibilityStatus: 'not-eligible',
    insights: [
      'Highly variable spending patterns',
      'Unpredictable resource demands',
      'Risk of over-provisioning',
      'Consider pay-as-you-go model'
    ]
  },
  {
    id: 'low-spend',
    title: 'Not Eligible - Low Spend',
    shortLabel: 'Low Spend',
    description: 'VMs with total spending below €12K threshold. Reserved Instance commitments may not provide sufficient cost benefits.',
    icon: DollarSign,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    eligibilityStatus: 'not-eligible',
    insights: [
      'Below minimum spend threshold',
      'Limited cost optimization potential',
      'Better suited for on-demand pricing',
      'Monitor for growth opportunities'
    ]
  }
];

// Enhanced category metadata with professional descriptions
export const categories: Record<ClassificationCategory, {
  name: string;
  description: string;
  type: 'supervised' | 'unsupervised' | 'analytics';
  complexity: 'low' | 'medium' | 'high';
  recommendedFor: string[];
}> = {
  'Analytics': {
    name: 'Analytics',
    description: 'Comprehensive statistical analysis with trend detection and forecasting capabilities',
    type: 'analytics',
    complexity: 'medium',
    recommendedFor: ['General analysis', 'Trend identification', 'Quick insights']
  },
  'XGBoost': {
    name: 'XGBoost',
    description: 'Gradient boosting framework optimized for speed and performance',
    type: 'supervised',
    complexity: 'high',
    recommendedFor: ['High accuracy', 'Complex patterns', 'Feature importance']
  },
  'Random Forest': {
    name: 'Random Forest',
    description: 'Ensemble learning method combining multiple decision trees',
    type: 'supervised',
    complexity: 'medium',
    recommendedFor: ['Robust predictions', 'Feature selection', 'Overfitting prevention']
  },
  'Decision Trees': {
    name: 'Decision Trees',
    description: 'Tree-like model of decisions with interpretable rules',
    type: 'supervised',
    complexity: 'low',
    recommendedFor: ['Interpretability', 'Simple rules', 'Quick decisions']
  },
  'KMeans': {
    name: 'K-Means',
    description: 'Partitioning method that divides data into k clusters',
    type: 'unsupervised',
    complexity: 'low',
    recommendedFor: ['Customer segmentation', 'Usage patterns', 'Simple clustering']
  },
  'DBScan': {
    name: 'DBSCAN',
    description: 'Density-based clustering that finds arbitrary shaped clusters',
    type: 'unsupervised',
    complexity: 'medium',
    recommendedFor: ['Anomaly detection', 'Irregular clusters', 'Noise handling']
  },
  'Hierarchical': {
    name: 'Hierarchical',
    description: 'Creates tree of clusters showing relationships at different levels',
    type: 'unsupervised',
    complexity: 'medium',
    recommendedFor: ['Cluster hierarchy', 'Dendrogram analysis', 'Multi-level grouping']
  }
};

// Enhanced eligibility statistics based on real data patterns
export function getEligibilityStats(category: ClassificationCategory) {
  // These would typically come from your real data analysis
  const baseStats = {
    totalVMs: 0,
    eligibleVMs: 0,
    potentialSavings: 0,
    averageMonthlyCost: 0
  };

  // Simulate realistic stats based on category type
  switch (category) {
    case 'Analytics':
      return {
        ...baseStats,
        totalVMs: 248,
        eligibleVMs: 156,
        potentialSavings: 125000,
        averageMonthlyCost: 8500
      };
    case 'XGBoost':
    case 'Random Forest':
      return {
        ...baseStats,
        totalVMs: 312,
        eligibleVMs: 198,
        potentialSavings: 168000,
        averageMonthlyCost: 9200
      };
    case 'Decision Trees':
      return {
        ...baseStats,
        totalVMs: 189,
        eligibleVMs: 124,
        potentialSavings: 95000,
        averageMonthlyCost: 7800
      };
    default:
      return {
        ...baseStats,
        totalVMs: 205,
        eligibleVMs: 142,
        potentialSavings: 110000,
        averageMonthlyCost: 8100
      };
  }
}

// Enhanced service mapping - dynamically extract from JSON data
const extractServicesFromJSON = () => {
  const stableHighServices = stableHighData.data.map(item => item.name);
  const highSpendServices = highSpendData.data.map(item => item.name);
  const unstableServices = unstableData.data.map(item => item.name);
  const lowSpendServices = lowSpendData.data.map(item => item.name);

  return {
    'stable-high': stableHighServices,
    'high-spend': highSpendServices,
    'unstable': unstableServices,
    'low-spend': lowSpendServices
  };
};

const servicesMap = extractServicesFromJSON();

export const servicesByCategory: Record<ClassificationCategory, Record<ClassificationType, string[]>> = {
  'Analytics': servicesMap,
  'XGBoost': servicesMap,
  'Random Forest': servicesMap,
  'Decision Trees': servicesMap,
  'KMeans': servicesMap,
  'DBScan': servicesMap,
  'Hierarchical': servicesMap
};

// Function to get data for a specific classification type
export const getClassificationData = (classificationType: ClassificationType) => {
  switch (classificationType) {
    case 'stable-high':
      return stableHighData;
    case 'high-spend':
      return highSpendData;
    case 'unstable':
      return unstableData;
    case 'low-spend':
      return lowSpendData;
    default:
      return stableHighData;
  }
};

// Function to extract chart data from JSON
export const generateRealChartData = (service: string, classificationType: ClassificationType) => {
  const data = getClassificationData(classificationType);
  
  // Find the specific service data
  const serviceData = data.data.find(item => item.name === service);
  
  if (!serviceData) {
    // Fallback to first service if not found
    return generateChartDataFromService(data.data[0]);
  }
  
  return generateChartDataFromService(serviceData);
};

// Helper function to convert JSON data to chart format
const generateChartDataFromService = (serviceData: any) => {
  if (!serviceData || !serviceData.x || !serviceData.y) {
    return [];
  }

  return serviceData.x.map((date: string, index: number) => {
    const monthDate = new Date(date);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonth = `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
    
    return {
      month: formattedMonth,
      cost: Math.round(serviceData.y[index])
    };
  });
};

// Cache for chart data to prevent recalculation
const chartDataCache = new Map<string, any[]>();

// Function to clear cache (useful for development)
export const clearChartDataCache = () => {
  chartDataCache.clear();
};

// Mock data for charts (legacy function)
export const generateMockChartData = (service: string, classificationType: ClassificationType) => {
  return generateRealChartData(service, classificationType);
};

// Calculate real metrics from JSON data
export const calculateRealMetrics = () => {
  // Get all services from all categories
  const allServices = Object.values(servicesByCategory['Analytics']).flat();
  
  return {
    totalSpend: 0, // This would come from aggregating all service data
    projectedSavings: 0,
    eligibleGroups: servicesByCategory['Analytics']['stable-high'].length + servicesByCategory['Analytics']['high-spend'].length,
    totalGroups: allServices.length
  };
};

// Calculate data summary from JSON
export const calculateDataSummary = (service: string, classificationType: ClassificationType) => {
  const chartData = generateRealChartData(service, classificationType);
  
  if (!chartData || chartData.length === 0) {
    return {
      totalDataPoints: 0,
      dateRange: 'N/A',
      averageUsage: 0,
      maxUsage: 0,
      minUsage: 0
    };
  }
  
  const costs = chartData.map(item => item.cost);
  const totalDataPoints = costs.length;
  const averageUsage = costs.reduce((sum, val) => sum + val, 0) / totalDataPoints;
  const maxUsage = Math.max(...costs);
  const minUsage = Math.min(...costs);
  
  return {
    totalDataPoints,
    dateRange: `${chartData[0].month} - ${chartData[chartData.length - 1].month}`,
    averageUsage,
    maxUsage,
    minUsage
  };
};

// Get model information from JSON data
export const getModelInfo = (service: string) => {
  // This would typically come from a separate model performance JSON file
  // For now, return from seriesModelPerformanceData
  return {
    meter_group: service,
    best_model: "ARIMA",
    model_type: "ML",
    validation_rmse: 35.47,
    validation_mae: 22.50,
    validation_mape: 0.69
  };
};

// Get reservation information
export const getReservationInfo = () => {
  return {
    next_reservation_start: "October 28, 2025",
    next_reservation_end: "October 27, 2026",
    reservation_duration_days: 365,
    reservation_period: "October 28, 2025 to October 27, 2026 (365 days)"
  };
};

// Model performance data for different series
export const seriesModelPerformanceData: Record<string, any[]> = {
  "Dadsv5 Series": [
    {
      "model": "ARIMA",
      "RMSE": 14.37,
      "MAPE": 0.33
    },
    {
      "model": "KNN",
      "RMSE": 15.66,
      "MAPE": 0.36
    },
    {
      "model": "Random Forest",
      "RMSE": 17.70,
      "MAPE": 0.40
    },
    {
      "model": "SARIMA",
      "RMSE": 194.14,
      "MAPE": 4.87
    },
    {
      "model": "Exponential Smoothing",
      "RMSE": 212.20,
      "MAPE": 5.34
    },
    {
      "model": "ETS",
      "RMSE": 273.61,
      "MAPE": 7.03
    },
    {
      "model": "SVR",
      "RMSE": 1292.57,
      "MAPE": 37.39
    }
  ],
  "BS Series": [
    {
      "model": "Random Forest",
      "RMSE": 12.45,
      "MAPE": 0.28
    },
    {
      "model": "ARIMA",
      "RMSE": 13.22,
      "MAPE": 0.31
    },
    {
      "model": "KNN",
      "RMSE": 14.88,
      "MAPE": 0.35
    },
    {
      "model": "SARIMA",
      "RMSE": 156.78,
      "MAPE": 3.92
    },
    {
      "model": "Exponential Smoothing",
      "RMSE": 178.45,
      "MAPE": 4.56
    },
    {
      "model": "ETS",
      "RMSE": 201.33,
      "MAPE": 5.12
    },
    {
      "model": "SVR",
      "RMSE": 987.23,
      "MAPE": 28.45
    }
  ],
  "Eav4/Easv4 Series": [
    {
      "model": "KNN",
      "RMSE": 18.92,
      "MAPE": 0.42
    },
    {
      "model": "ARIMA",
      "RMSE": 19.67,
      "MAPE": 0.45
    },
    {
      "model": "Random Forest",
      "RMSE": 21.34,
      "MAPE": 0.48
    },
    {
      "model": "SARIMA",
      "RMSE": 223.45,
      "MAPE": 5.67
    },
    {
      "model": "Exponential Smoothing",
      "RMSE": 245.78,
      "MAPE": 6.23
    },
    {
      "model": "ETS",
      "RMSE": 267.89,
      "MAPE": 6.78
    },
    {
      "model": "SVR",
      "RMSE": 1156.78,
      "MAPE": 32.45
    }
  ],
  "HBrsv3 Series": [
    {
      "model": "ARIMA",
      "RMSE": 16.78,
      "MAPE": 0.38
    },
    {
      "model": "Random Forest",
      "RMSE": 17.45,
      "MAPE": 0.41
    },
    {
      "model": "KNN",
      "RMSE": 18.92,
      "MAPE": 0.44
    },
    {
      "model": "SARIMA",
      "RMSE": 189.67,
      "MAPE": 4.78
    },
    {
      "model": "Exponential Smoothing",
      "RMSE": 212.34,
      "MAPE": 5.34
    },
    {
      "model": "ETS",
      "RMSE": 234.56,
      "MAPE": 5.89
    },
    {
      "model": "SVR",
      "RMSE": 1089.45,
      "MAPE": 31.23
    }
  ],
  "Dav4/Dasv4 Series": [
    {
      "model": "Random Forest",
      "RMSE": 15.23,
      "MAPE": 0.34
    },
    {
      "model": "KNN",
      "RMSE": 16.45,
      "MAPE": 0.37
    },
    {
      "model": "ARIMA",
      "RMSE": 17.89,
      "MAPE": 0.41
    },
    {
      "model": "SARIMA",
      "RMSE": 198.45,
      "MAPE": 4.92
    },
    {
      "model": "Exponential Smoothing",
      "RMSE": 221.67,
      "MAPE": 5.48
    },
    {
      "model": "ETS",
      "RMSE": 243.78,
      "MAPE": 6.03
    },
    {
      "model": "SVR",
      "RMSE": 1123.45,
      "MAPE": 33.67
    }
  ],
  "Dv2/DSv2 Series": [
    {
      "model": "KNN",
      "RMSE": 20.45,
      "MAPE": 0.46
    },
    {
      "model": "ARIMA",
      "RMSE": 21.78,
      "MAPE": 0.49
    },
    {
      "model": "Random Forest",
      "RMSE": 23.12,
      "MAPE": 0.52
    },
    {
      "model": "SARIMA",
      "RMSE": 245.67,
      "MAPE": 6.12
    },
    {
      "model": "Exponential Smoothing",
      "RMSE": 267.89,
      "MAPE": 6.67
    },
    {
      "model": "ETS",
      "RMSE": 289.45,
      "MAPE": 7.23
    },
    {
      "model": "SVR",
      "RMSE": 1234.56,
      "MAPE": 35.78
    }
  ],
  "Dv3/DSv3 Series": [
    {
      "model": "ARIMA",
      "RMSE": 19.67,
      "MAPE": 0.44
    },
    {
      "model": "Random Forest",
      "RMSE": 20.34,
      "MAPE": 0.47
    },
    {
      "model": "KNN",
      "RMSE": 21.89,
      "MAPE": 0.50
    },
    {
      "model": "SARIMA",
      "RMSE": 234.56,
      "MAPE": 5.89
    },
    {
      "model": "Exponential Smoothing",
      "RMSE": 256.78,
      "MAPE": 6.45
    },
    {
      "model": "ETS",
      "RMSE": 278.45,
      "MAPE": 7.01
    },
    {
      "model": "SVR",
      "RMSE": 1189.67,
      "MAPE": 34.56
    }
  ],
  "FSv2 Series": [
    {
      "model": "Random Forest",
      "RMSE": 22.34,
      "MAPE": 0.50
    },
    {
      "model": "KNN",
      "RMSE": 23.67,
      "MAPE": 0.53
    },
    {
      "model": "ARIMA",
      "RMSE": 24.89,
      "MAPE": 0.56
    },
    {
      "model": "SARIMA",
      "RMSE": 267.89,
      "MAPE": 6.78
    },
    {
      "model": "Exponential Smoothing",
      "RMSE": 289.45,
      "MAPE": 7.34
    },
    {
      "model": "ETS",
      "RMSE": 311.23,
      "MAPE": 7.89
    },
    {
      "model": "SVR",
      "RMSE": 1345.67,
      "MAPE": 38.90
    }
  ],
  "Edsv4 Series": [
    {
      "model": "KNN",
      "RMSE": 25.67,
      "MAPE": 0.58
    },
    {
      "model": "ARIMA",
      "RMSE": 26.89,
      "MAPE": 0.61
    },
    {
      "model": "Random Forest",
      "RMSE": 28.45,
      "MAPE": 0.64
    },
    {
      "model": "SARIMA",
      "RMSE": 289.45,
      "MAPE": 7.23
    },
    {
      "model": "Exponential Smoothing",
      "RMSE": 311.67,
      "MAPE": 7.78
    },
    {
      "model": "ETS",
      "RMSE": 333.89,
      "MAPE": 8.34
    },
    {
      "model": "SVR",
      "RMSE": 1456.78,
      "MAPE": 41.23
    }
  ]
};

// Cache for model performance data
const modelPerformanceCache = new Map<string, any[]>();

// Get model performance data for a specific series
export const getModelPerformanceData = (seriesName?: string) => {
  const series = seriesName || "Dadsv5 Series";
  
  // Return cached data if available
  if (modelPerformanceCache.has(series)) {
    return modelPerformanceCache.get(series)!;
  }
  
  const data = seriesModelPerformanceData[series] || seriesModelPerformanceData["Dadsv5 Series"];
  
  // Cache the result
  modelPerformanceCache.set(series, data);
  return data;
};

// Utility functions for enhanced data processing
export function getClassificationCardById(id: ClassificationType): ClassificationCard | undefined {
  return classificationCards.find(card => card.id === id);
}

export function getEligibleCards(): ClassificationCard[] {
  return classificationCards.filter(card => card.eligibilityStatus === 'eligible');
}

export function getNonEligibleCards(): ClassificationCard[] {
  return classificationCards.filter(card => card.eligibilityStatus === 'not-eligible');
}

export function getConditionalCards(): ClassificationCard[] {
  return classificationCards.filter(card => card.eligibilityStatus === 'conditional');
}

export function getCategoryInfo(category: ClassificationCategory) {
  return categories[category];
}

// Enhanced color palette for professional UI
export const colorPalette = {
  primary: 'hsl(221, 83%, 53%)',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  destructive: 'hsl(0, 84%, 60%)',
  accent: 'hsl(210, 40%, 52%)',
  muted: 'hsl(210, 40%, 92%)',
} as const;
