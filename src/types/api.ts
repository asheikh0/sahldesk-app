export interface User {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  company?: Company;
}

export interface Company {
  id: number;
  name: string;
  plan?: string;
}

export interface Category {
  id: number;
  name: string;
  companyId: number;
  color?: string;
  ticketCount?: number;
}

export interface TicketSubStatus {
  id: number;
  name: string;
  color: string;
  companyId: number;
}

export interface Comment {
  id: number;
  ticketId: number;
  content: string;
  createdDate: string;
  isStaffReply: boolean;
  isInternal?: boolean;
  attachmentUrl?: string;
  user: User;
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdDate: string;
  category?: string;
  referenceId?: string;
  customer: User;
  agent?: User;
  subStatus?: TicketSubStatus;
  comments?: Comment[];
}

export interface StatusCountDto { status: string; count: number; }
export interface AgentPerformanceDto { agentName: string; assignedCount: number; resolvedCount: number; }
export interface CategoryCountDto { category: string; count: number; }
export interface PriorityCountDto { priority: string; count: number; }
export interface VolumeTrendDto { date: string; count: number; }

export interface DashboardStatsDto {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  pendingTickets: number;
  closedTickets: number;
  averageResolutionTimeHrs: number;
  statusSummary: StatusCountDto[];
  agentPerformance: AgentPerformanceDto[];
  categoryDistribution: CategoryCountDto[];
  priorityDistribution: PriorityCountDto[];
  volumeTrend: VolumeTrendDto[];
}

export interface CannedResponse {
  id: number;
  title: string;
  content: string;
}

export interface LoginDto {
  email: string;
  password?: string;
}
