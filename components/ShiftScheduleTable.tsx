
import React from 'react';
import type { Staff, ShiftName, ShiftScheduleData } from '../types';
import { DAYS_OF_WEEK } from '../constants';

interface ShiftScheduleTableProps {
    staffing: { [key in ShiftName]: Staff };
    schedule: ShiftScheduleData;
    onUpdate: (shift: string, day: string, value: string) => void;
}

const ShiftScheduleTable: React.FC<ShiftScheduleTableProps> = ({ staffing, schedule, onUpdate }) => {
    
    const getStaffTotal = (shiftName: ShiftName): number => {
        const staff = staffing[shiftName];
        return Object.values(staff).reduce((acc, val) => acc + val, 0);
    };

    const isShiftActive = (shiftScheduleValue: string): boolean => {
        const lowerCaseSchedule = shiftScheduleValue.toLowerCase().trim();
        return lowerCaseSchedule !== 'libre' && lowerCaseSchedule !== 'salida';
    }

    const dailyTotals = DAYS_OF_WEEK.map(day => {
        let total = 0;
        if (isShiftActive(schedule['Turno 1'][day])) {
            total += getStaffTotal('turno1');
        }
        if (isShiftActive(schedule['Turno 2'][day])) {
            total += getStaffTotal('turno2');
        }
        if (isShiftActive(schedule['Turno PT'][day])) {
            total += getStaffTotal('turnoPT');
        }
        return total;
    });

    const getCellClass = (text: string) => {
        if (!isShiftActive(text)) {
            return 'bg-yellow-100 text-yellow-800 focus-within:bg-yellow-200';
        }
        return 'bg-green-100 text-green-800 focus-within:bg-green-200';
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-center bg-white shadow-md rounded-lg border border-slate-200">
                <thead className="bg-slate-200 text-slate-700 font-bold uppercase">
                    <tr>
                        <th className="py-3 px-2">Turno</th>
                        {DAYS_OF_WEEK.map(day => <th key={day} className="py-3 px-2">{day}</th>)}
                    </tr>
                </thead>
                <tbody className="text-slate-600">
                    {Object.entries(schedule).map(([shift, scheduleData]) => (
                        <tr key={shift} className="border-b border-slate-200">
                            <td className="py-3 px-2 font-semibold bg-slate-50">{shift}</td>
                            {DAYS_OF_WEEK.map(day => (
                                <td key={`${shift}-${day}`} className={`py-1 px-1 font-mono align-middle transition-colors duration-200 ${getCellClass(scheduleData[day])}`}>
                                    <input
                                      type="text"
                                      value={scheduleData[day]}
                                      onChange={(e) => onUpdate(shift, day, e.target.value)}
                                      className="w-full h-full bg-transparent text-center p-2 border-none focus:ring-2 focus:ring-blue-500 rounded-md"
                                      aria-label={`Horario para ${shift} el ${day}`}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                    <tr className="bg-slate-800 text-white font-bold">
                        <td className="py-3 px-2">Total Recurso Por Día</td>
                        {dailyTotals.map((total, index) => (
                            <td key={`total-${index}`} className="py-3 px-2 text-lg">{total}</td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default ShiftScheduleTable;
