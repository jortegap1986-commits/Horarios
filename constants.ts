
import type { Staff, DailyWorkload, ShiftScheduleData } from './types';

export const DEFAULT_STAFFING: { [key in 'turno1' | 'turno2' | 'turnoPT']: Staff } = {
  turno1: { reach: 3, gruas: 1, operativo: 3, certificador: 1 },
  turno2: { reach: 3, gruas: 1, operativo: 3, certificador: 1 },
  turnoPT: { reach: 2, gruas: 1, operativo: 3, certificador: 1 },
};

export const DEFAULT_SKU_LOAD: DailyWorkload = {
  Domingo: 600, // Combined 200 (14:00) + 400 (22:00)
  Lunes: 600,
  Martes: 550,
  Miercoles: 450,
  Jueves: 450,
  Viernes: 450,
  Sabado: 0,
};

export const DEFAULT_SHIFT_SCHEDULE: ShiftScheduleData = {
    'Turno 1': {
        Domingo: '14:00-22:30', Lunes: '22:00-07:30', Martes: '22:00-07:30', Miercoles: '22:00-07:30', Jueves: '14:00-22:30', Viernes: 'Salida', Sabado: 'Libre'
    },
    'Turno 2': {
        Domingo: '22:00-07:30', Lunes: '22:00-07:30', Martes: '22:00-07:30', Miercoles: '22:00-07:30', Jueves: 'Libre', Viernes: '22:00-07:30', Sabado: 'Libre'
    },
    'Turno PT': {
        Domingo: '22:00-07:30', Lunes: 'Libre', Martes: 'Libre', Miercoles: 'Libre', Jueves: '22:00-07:30', Viernes: 'Salida', Sabado: 'Salida'
    }
};

export const DEFAULT_SKU_PER_PERSON = 25;

export const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
