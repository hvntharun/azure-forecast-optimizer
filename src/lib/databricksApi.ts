// Databricks API Integration
// This file handles all communication with Databricks APIs

const DATABRICKS_BASE_URL = import.meta.env.VITE_DATABRICKS_URL || 'https://your-workspace.cloud.databricks.com';
const DATABRICKS_TOKEN = import.meta.env.VITE_DATABRICKS_TOKEN;
const WAREHOUSE_ID = import.meta.env.VITE_WAREHOUSE_ID;

export interface DatabricksConfig {
  baseURL: string;
  token: string;
  warehouseId: string;
}

export interface JobRun {
  run_id: number;
  job_id: number;
  state: {
    life_cycle_state: string;
    result_state?: string;
    state_message?: string;
  };
  start_time: number;
  end_time?: number;
  execution_time?: number;
}

export interface ClusterInfo {
  cluster_id: string;
  cluster_name: string;
  state: string;
  num_workers: number;
  node_type_id: string;
}

export interface SQLResult {
  data: any[];
  columns: Array<{
    name: string;
    type: string;
  }>;
  row_count: number;
}

class DatabricksAPI {
  private config: DatabricksConfig;

  constructor() {
    this.config = {
      baseURL: DATABRICKS_BASE_URL,
      token: DATABRICKS_TOKEN || '',
      warehouseId: WAREHOUSE_ID || ''
    };

    if (!this.config.token) {
      console.warn('Databricks token not found. API calls will fail.');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.baseURL}/api/2.0${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Databricks API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Databricks API request failed:', error);
      throw error;
    }
  }

  // Jobs API
  async getJobRuns(jobId: string, limit: number = 20): Promise<{ runs: JobRun[] }> {
    return this.request(`/jobs/runs/list?job_id=${jobId}&limit=${limit}`);
  }

  async triggerJob(jobId: string, parameters: Record<string, any> = {}): Promise<{ run_id: number }> {
    return this.request('/jobs/run-now', {
      method: 'POST',
      body: JSON.stringify({
        job_id: jobId,
        notebook_params: parameters
      })
    });
  }

  async getJobRunStatus(runId: number): Promise<JobRun> {
    return this.request(`/jobs/runs/get?run_id=${runId}`);
  }

  // Clusters API
  async getClusters(): Promise<{ clusters: ClusterInfo[] }> {
    return this.request('/clusters/list');
  }

  async getClusterInfo(clusterId: string): Promise<ClusterInfo> {
    return this.request(`/clusters/get?cluster_id=${clusterId}`);
  }

  // SQL Warehouse API
  async executeSQL(query: string, warehouseId?: string): Promise<SQLResult> {
    const targetWarehouseId = warehouseId || this.config.warehouseId;
    
    if (!targetWarehouseId) {
      throw new Error('Warehouse ID not provided');
    }

    const response = await this.request('/sql/statements', {
      method: 'POST',
      body: JSON.stringify({
        statement: query,
        warehouse_id: targetWarehouseId
      })
    });

    // Poll for completion
    let statementId = response.statement_id;
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max

    while (attempts < maxAttempts) {
      const status = await this.request(`/sql/statements/${statementId}`);
      
      if (status.status.state === 'SUCCEEDED') {
        return status.result;
      } else if (status.status.state === 'FAILED') {
        throw new Error(`SQL execution failed: ${status.status.state_message}`);
      }

      // Wait 10 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
    }

    throw new Error('SQL execution timed out');
  }

  // Custom business logic methods
  async getEligibilityData(meterCategory: string): Promise<any> {
    const query = `
      SELECT 
        category,
        total_consumption,
        variance_percentage,
        trend_direction,
        eligibility_status
      FROM your_database.eligibility_analysis 
      WHERE category = '${meterCategory}'
      ORDER BY analysis_date DESC
      LIMIT 1
    `;
    
    try {
      const result = await this.executeSQL(query);
      return result.data[0] || null;
    } catch (error) {
      console.error('Error fetching eligibility data:', error);
      throw error;
    }
  }

  async getForecastData(meterCategory: string, horizon: number = 15): Promise<any[]> {
    const query = `
      SELECT 
        forecast_date,
        predicted_consumption,
        confidence_interval_lower,
        confidence_interval_upper,
        model_version
      FROM your_database.forecast_data 
      WHERE category = '${meterCategory}' 
        AND forecast_date <= DATE_ADD(CURRENT_DATE(), ${horizon})
        AND forecast_date > CURRENT_DATE()
      ORDER BY forecast_date
    `;
    
    try {
      const result = await this.executeSQL(query);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      throw error;
    }
  }

  async getReservationData(): Promise<any[]> {
    const query = `
      SELECT 
        resource_group,
        forecasted_quantity,
        term_length,
        estimated_savings,
        reservation_date
      FROM your_database.reservations 
      WHERE status = 'active'
      ORDER BY reservation_date DESC
    `;
    
    try {
      const result = await this.executeSQL(query);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching reservation data:', error);
      throw error;
    }
  }

  async createReservation(reservationData: {
    resourceGroup: string;
    quantity: number;
    term: string;
    savings: number;
  }): Promise<any> {
    const query = `
      INSERT INTO your_database.reservations 
      (resource_group, forecasted_quantity, term_length, estimated_savings, reservation_date, status)
      VALUES (
        '${reservationData.resourceGroup}',
        ${reservationData.quantity},
        '${reservationData.term}',
        ${reservationData.savings},
        CURRENT_DATE(),
        'pending'
      )
    `;
    
    try {
      await this.executeSQL(query);
      return { success: true, message: 'Reservation created successfully' };
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/workspace/list');
      return true;
    } catch (error) {
      console.error('Databricks health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const databricksAPI = new DatabricksAPI();

// Export types for use in components
export type { JobRun, ClusterInfo, SQLResult };



