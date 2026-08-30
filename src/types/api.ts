export interface User {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export interface Company {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  companyId: number;
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
  createdAt: string;
  isStaffReply: boolean;
  user: User;
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  customer: User;
  agent?: User;
  subStatus?: TicketSubStatus;
  comments?: Comment[];
}

export interface DashboardStatsDto {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTimeHours: number;
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
