export interface Staff {
  reach: number;
  gruas: number;
  operativo: number;
  certificador: number;
}

export type Role = keyof Staff;

export type ShiftName = 'turno1' | 'turno2' | 'turnoPT';

export interface DailyWorkload {
  [day: string]: number;
}

export interface Schedule {
    [day: string]: string;
}

export interface ShiftScheduleData {
    [shiftName: string]: Schedule;
}

export const ROLES: { key: Role; name: string }[] = [
    { key: 'reach', name: 'Reach' },
    { key: 'gruas', name: 'Gruas' },
    { key: 'operativo', name: 'Operativo' },
    { key: 'certificador', name: 'Certificador' },
];

export interface OptimizationSuggestion {
    title: string;
    fromShift: ShiftName;
    toShift: ShiftName;
    role: Role;
    amount: number;
    suggestedTime: string;
    reason: string;
    impact: string;
}

export interface AIResponse {
    operationAlert?: string;
    suggestions: OptimizationSuggestion[];
}
