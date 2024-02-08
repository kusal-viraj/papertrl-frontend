export interface Country {
  name?: string;
  code?: string;
}

export interface Representative {
  name?: string;
  image?: string;
}

export interface Customer {
  id?: number;
  name?: number;
  country?: Country;
  company?: string;
  date?: string;
  status?: string;
  representative?: Representative;
  totalRecords?: number;
}
export interface TableData {
  columns?: any;
  advancedFilters?: any;
  representatives?: any;
  state?: any;
}
