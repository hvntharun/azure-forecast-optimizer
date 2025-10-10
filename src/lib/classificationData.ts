// Classification categories and their service mappings
export type ClassificationCategory = 
  | 'Analytics'
  | 'XGBoost'
  | 'Random Forest'
  | 'Decision Trees'
  | 'KMeans'
  | 'DBScan'
  | 'Hierarchical';

export type ClassificationType = 
  | 'stable-high'
  | 'high-spend'
  | 'unstable'
  | 'low-spend';

export interface ClassificationCard {
  id: ClassificationType;
  shortLabel: string;
  fullLabel: string;
  description: string;
  color: string;
  badgeClass: string;
}

export const classificationCards: ClassificationCard[] = [
  {
    id: 'stable-high',
    shortLabel: 'Stable High Spend (>12K)',
    fullLabel: 'Eligible for forecasting — costs are stable (>12K, Stable High Spend)',
    description: 'Stable and predictable costs above €12K threshold',
    color: 'hsl(160, 84%, 45%)',
    badgeClass: 'bg-success/10 text-success border-success/20'
  },
  {
    id: 'high-spend',
    shortLabel: 'High Spend (>20K)',
    fullLabel: 'Eligible for forecasting even if trend slightly decreasing (>20K, High Spend)',
    description: 'High spend eligible despite decreasing trend',
    color: 'hsl(264, 89%, 62%)',
    badgeClass: 'bg-primary/10 text-primary border-primary/20'
  },
  {
    id: 'unstable',
    shortLabel: 'Unstable / Erratic (>12K)',
    fullLabel: 'Clearly not eligible due to unstable or erratic usage (>12K, Unstable / Erratic)',
    description: 'Unpredictable usage patterns',
    color: 'hsl(0, 72%, 55%)',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/20'
  },
  {
    id: 'low-spend',
    shortLabel: 'Low Spend (<12K)',
    fullLabel: 'Not eligible because total spend is too low (<12K, Low Spend)',
    description: 'Below minimum threshold for forecasting',
    color: 'hsl(240, 4%, 46%)',
    badgeClass: 'bg-muted/10 text-muted-foreground border-muted/20'
  }
];

// Service mappings per category
export const servicesByCategory: Record<ClassificationCategory, Record<ClassificationType, string[]>> = {
  Analytics: {
    'stable-high': ['BS Series', 'Dadsv5 Series', 'Eav4/Easv4 Series', 'HBrsv3 Series'],
    'high-spend': ['Dav4/Dasv4 Series', 'Dv2/DSv2 Series', 'Dv3/DSv3 Series', 'FSv2 Series'],
    'unstable': ['Edsv4 Series'],
    'low-spend': ['Av2 Series', 'Av2 Series Windows', 'BS Series Windows', 'Basv2 Series', 'D/DS Series', 'D/DS Series Windows', 'DCasv5-series Linux', 'DSv2 Series VM']
  },
  XGBoost: {
    'stable-high': ['BS Series', 'Dadsv5 Series', 'HBrsv3 Series'],
    'high-spend': ['Dav4/Dasv4 Series', 'FSv2 Series'],
    'unstable': ['Edsv4 Series', 'Eav4/Easv4 Series'],
    'low-spend': ['Av2 Series', 'BS Series Windows', 'Basv2 Series', 'DCasv5-series Linux']
  },
  'Random Forest': {
    'stable-high': ['Dadsv5 Series', 'Eav4/Easv4 Series', 'HBrsv3 Series'],
    'high-spend': ['Dv2/DSv2 Series', 'Dv3/DSv3 Series', 'FSv2 Series'],
    'unstable': ['Edsv4 Series'],
    'low-spend': ['Av2 Series Windows', 'Basv2 Series', 'D/DS Series', 'DSv2 Series VM']
  },
  'Decision Trees': {
    'stable-high': ['BS Series', 'HBrsv3 Series'],
    'high-spend': ['Dav4/Dasv4 Series', 'Dv3/DSv3 Series'],
    'unstable': ['Edsv4 Series', 'Eav4/Easv4 Series'],
    'low-spend': ['Av2 Series', 'D/DS Series Windows', 'DCasv5-series Linux']
  },
  KMeans: {
    'stable-high': ['Dadsv5 Series', 'Eav4/Easv4 Series'],
    'high-spend': ['Dav4/Dasv4 Series', 'FSv2 Series'],
    'unstable': ['Edsv4 Series'],
    'low-spend': ['Av2 Series', 'Basv2 Series', 'BS Series Windows']
  },
  DBScan: {
    'stable-high': ['BS Series', 'HBrsv3 Series'],
    'high-spend': ['Dv2/DSv2 Series', 'Dv3/DSv3 Series'],
    'unstable': ['Eav4/Easv4 Series'],
    'low-spend': ['Av2 Series Windows', 'D/DS Series', 'DSv2 Series VM']
  },
  Hierarchical: {
    'stable-high': ['Dadsv5 Series', 'HBrsv3 Series'],
    'high-spend': ['Dav4/Dasv4 Series', 'FSv2 Series'],
    'unstable': ['Edsv4 Series'],
    'low-spend': ['Basv2 Series', 'DCasv5-series Linux', 'D/DS Series Windows']
  }
};

// Mock data for charts
export const generateMockChartData = (service: string, classificationType: ClassificationType) => {
  const months = ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025'];
  
  const basePatterns: Record<ClassificationType, number[]> = {
    'stable-high': [15000, 15200, 15100, 15300, 15250, 15400, 15350, 15500, 15450],
    'high-spend': [40000, 35000, 30000, 32000, 33000, 40000, 28000, 26000, 25000],
    'unstable': [500, 2000, 1950, 2100, 1850, 1900, 1250, 1100, 1150],
    'low-spend': [3200, 4300, 3500, 2500, 2450, 2100, 1900, 3300, 2000]
  };

  const pattern = basePatterns[classificationType];
  const variance = 0.15;
  
  return months.map((month, i) => ({
    month,
    cost: pattern[i] * (1 + (Math.random() - 0.5) * variance)
  }));
};

export const getEligibilityStats = (category: ClassificationCategory) => {
  const services = servicesByCategory[category];
  const eligible = services['stable-high'].length + services['high-spend'].length;
  const notEligible = services['unstable'].length + services['low-spend'].length;
  
  return {
    eligible,
    notEligible,
    total: eligible + notEligible,
    eligiblePercent: Math.round((eligible / (eligible + notEligible)) * 100),
    notEligiblePercent: Math.round((notEligible / (eligible + notEligible)) * 100)
  };
};
