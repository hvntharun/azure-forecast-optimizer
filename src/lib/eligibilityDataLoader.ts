import { ClassificationCategory, ClassificationType } from './classificationData';

// Define the structure of your JSON data
export interface PlotlyTrace {
  hovertemplate: string;
  mode: string;
  name: string;
  visible: boolean;
  x: string[];
  y: number[];
  type: string;
}

export interface EligibilityData {
  data: PlotlyTrace[];
  layout: {
    title: { text: string };
    xaxis: { title: { text: string } };
    yaxis: { title: { text: string }; tickprefix: string; separatethousands: boolean };
    updatemenus: Array<{
      buttons: Array<{
        args: any[];
        label: string;
        method: string;
      }>;
      direction: string;
      showactive: boolean;
      x: number;
      xanchor: string;
      y: number;
      yanchor: string;
    }>;
    showlegend: boolean;
  };
}

// Mapping of classification types to their corresponding JSON files
const ELIGIBILITY_DATA_FILES = {
  'stable-high': '/JSON/eligibility_Eligible_for_forecasting_costs_are_stable_12K_Stable_High_Spend (1).json',
  'high-spend': '/JSON/eligibility_Eligible_for_forecasting_even_if_trend_slightly_decreasing_20K_High_Spend (1).json',
  'unstable': '/JSON/eligibility_Clearly_not_eligible_due_to_unstable_or_erratic_usage_12K_Unstable__Erratic (1).json',
  'low-spend': '/JSON/eligibility_Not_eligible_because_total_spend_is_too_low_12K_Low_Spend (1).json',
} as const;

// Cache for loaded data
const dataCache = new Map<ClassificationType, EligibilityData>();

/**
 * Load eligibility data for a specific classification type
 */
export async function loadEligibilityData(classificationType: ClassificationType): Promise<EligibilityData> {
  // Check cache first
  if (dataCache.has(classificationType)) {
    return dataCache.get(classificationType)!;
  }

  try {
    const filePath = ELIGIBILITY_DATA_FILES[classificationType];
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Failed to load data for ${classificationType}: ${response.statusText}`);
    }
    
    const data: EligibilityData = await response.json();
    
    // Cache the loaded data
    dataCache.set(classificationType, data);
    
    return data;
  } catch (error) {
    console.error(`Error loading eligibility data for ${classificationType}:`, error);
    
    // Return empty data structure as fallback
    return {
      data: [],
      layout: {
        title: { text: `No data available for ${classificationType}` },
        xaxis: { title: { text: 'Month' } },
        yaxis: { title: { text: 'Cost (€)' }, tickprefix: '€', separatethousands: true },
        updatemenus: [],
        showlegend: false,
      },
    };
  }
}

/**
 * Get all available series names from the eligibility data
 */
export function getSeriesFromData(data: EligibilityData): string[] {
  return data.data.map(trace => trace.name);
}

/**
 * Filter data by selected series
 */
export function filterDataBySeries(data: EligibilityData, selectedSeries: string[]): EligibilityData {
  if (selectedSeries.length === 0) {
    return data;
  }

  const filteredTraces = data.data.filter(trace => selectedSeries.includes(trace.name));
  
  return {
    ...data,
    data: filteredTraces,
  };
}

/**
 * Calculate series statistics for pie chart
 */
export interface SeriesStats {
  name: string;
  totalCost: number;
  averageCost: number;
  dataPoints: number;
  isVisible: boolean;
}

export function calculateSeriesStats(data: EligibilityData): SeriesStats[] {
  return data.data.map(trace => {
    const totalCost = trace.y.reduce((sum, cost) => sum + cost, 0);
    const averageCost = totalCost / trace.y.length;
    
    return {
      name: trace.name,
      totalCost,
      averageCost,
      dataPoints: trace.y.length,
      isVisible: trace.visible,
    };
  });
}

/**
 * Get pie chart data from series statistics
 */
export interface PieChartData {
  labels: string[];
  values: number[];
  colors: string[];
  hoverData: string[];
}

export function getPieChartDataFromStats(
  stats: SeriesStats[], 
  selectedSeries: string[] = [],
  colorPalette: string[] = [
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6B7280', // Gray
  ]
): PieChartData {
  const filteredStats = selectedSeries.length > 0 
    ? stats.filter(stat => selectedSeries.includes(stat.name))
    : stats.filter(stat => stat.isVisible);

  // Sort by total cost for better visualization
  filteredStats.sort((a, b) => b.totalCost - a.totalCost);

  return {
    labels: filteredStats.map(stat => stat.name),
    values: filteredStats.map(stat => stat.totalCost),
    colors: filteredStats.map((_, index) => colorPalette[index % colorPalette.length]),
    hoverData: filteredStats.map(stat => 
      `Total: €${stat.totalCost.toLocaleString()}<br>` +
      `Average: €${stat.averageCost.toLocaleString()}<br>` +
      `Data Points: ${stat.dataPoints}`
    ),
  };
}

/**
 * Load all eligibility data for all classification types
 */
export async function loadAllEligibilityData(): Promise<Record<ClassificationType, EligibilityData>> {
  const promises = Object.keys(ELIGIBILITY_DATA_FILES).map(async (type) => {
    const classificationType = type as ClassificationType;
    const data = await loadEligibilityData(classificationType);
    return [classificationType, data] as const;
  });

  const results = await Promise.all(promises);
  return Object.fromEntries(results) as Record<ClassificationType, EligibilityData>;
}

/**
 * Get aggregated statistics across all classification types
 */
export interface AggregatedStats {
  totalServices: number;
  totalCost: number;
  eligibleServices: number;
  eligibleCost: number;
  eligibilityRate: number;
  costSavingsPotential: number;
}

export function getAggregatedStats(allData: Record<ClassificationType, EligibilityData>): AggregatedStats {
  const eligibleTypes: ClassificationType[] = ['stable-high', 'high-spend'];
  const nonEligibleTypes: ClassificationType[] = ['unstable', 'low-spend'];

  let totalServices = 0;
  let totalCost = 0;
  let eligibleServices = 0;
  let eligibleCost = 0;

  Object.entries(allData).forEach(([type, data]) => {
    const classificationType = type as ClassificationType;
    const stats = calculateSeriesStats(data);
    
    const typeServices = stats.length;
    const typeCost = stats.reduce((sum, stat) => sum + stat.totalCost, 0);
    
    totalServices += typeServices;
    totalCost += typeCost;
    
    if (eligibleTypes.includes(classificationType)) {
      eligibleServices += typeServices;
      eligibleCost += typeCost;
    }
  });

  const eligibilityRate = totalServices > 0 ? (eligibleServices / totalServices) * 100 : 0;
  const costSavingsPotential = eligibleCost * 0.72; // Up to 72% savings with Reserved Instances

  return {
    totalServices,
    totalCost,
    eligibleServices,
    eligibleCost,
    eligibilityRate,
    costSavingsPotential,
  };
}

