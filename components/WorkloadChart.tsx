
import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Cell } from 'recharts';
import type { Staff, ShiftName, DailyWorkload, ShiftScheduleData } from '../types';
import { DAYS_OF_WEEK } from '../constants';

interface WorkloadChartProps {
    staffing: { [key in ShiftName]: Staff };
    dailySkuLoad: DailyWorkload;
    shiftSchedule: ShiftScheduleData;
    skuPerPerson: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const skuPayload = payload.find(p => p.dataKey === 'SKU');
        const personalPayload = payload.find(p => p.dataKey === 'Personal');
        
        if (!skuPayload || !personalPayload) return null;

        const { value: skuValue, payload: itemPayload } = skuPayload;
        const { value: personalValue } = personalPayload;
        const capacity = itemPayload.capacity;
        const overCapacity = skuValue > capacity;

        return (
            <div className="p-3 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800 mb-2">{label}</p>
                <p style={{ color: skuPayload.fill }} className="flex justify-between items-center gap-4">
                    <span>Carga SKU:</span> 
                    <span className="font-bold">{skuValue}</span>
                </p>
                <p style={{ color: personalPayload.fill }} className="flex justify-between items-center gap-4">
                    <span>Personal:</span>
                    <span className="font-bold">{personalValue}</span>
                </p>
                <p className="text-slate-600 flex justify-between items-center gap-4">
                    <span>Capacidad (SKU):</span>
                    <span className="font-bold">{capacity.toFixed(0)}</span>
                </p>
                 {overCapacity && (
                    <p className="mt-2 font-semibold text-red-500 text-center border-t pt-1">¡Sobrecapacidad!</p>
                )}
            </div>
        );
    }
    return null;
};


const WorkloadChart: React.FC<WorkloadChartProps> = ({ staffing, dailySkuLoad, shiftSchedule, skuPerPerson }) => {

    const getStaffTotal = (shiftName: ShiftName): number => {
        return Object.values(staffing[shiftName]).reduce((acc, val) => acc + val, 0);
    };

    const isShiftActive = (shiftScheduleValue: string): boolean => {
        const lowerCaseSchedule = shiftScheduleValue.toLowerCase().trim();
        return lowerCaseSchedule !== 'libre' && lowerCaseSchedule !== 'salida';
    }
    
    const chartData = DAYS_OF_WEEK.map(day => {
        let staffCount = 0;
        if (isShiftActive(shiftSchedule['Turno 1'][day])) {
            staffCount += getStaffTotal('turno1');
        }
        if (isShiftActive(shiftSchedule['Turno 2'][day])) {
            staffCount += getStaffTotal('turno2');
        }
        if (isShiftActive(shiftSchedule['Turno PT'][day])) {
            staffCount += getStaffTotal('turnoPT');
        }
        
        const capacity = staffCount * skuPerPerson;

        return {
            name: day.substring(0, 3),
            SKU: dailySkuLoad[day],
            Personal: staffCount,
            capacity: capacity,
        };
    });

    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <ComposedChart
                    data={chartData}
                    margin={{
                        top: 30,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0"/>
                    <XAxis dataKey="name" stroke="#6b7280" tickLine={false} axisLine={false}/>
                    <YAxis yAxisId="left" orientation="left" stroke="#60a5fa" tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#4ade80" tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(230, 230, 230, 0.4)' }}/>
                    <Legend wrapperStyle={{paddingTop: '20px'}}/>
                    <Bar yAxisId="left" dataKey="SKU" name="Carga de SKU">
                        <LabelList dataKey="SKU" position="top" fill="#4b5563" fontSize={12} fontWeight="bold"/>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.SKU > entry.capacity ? '#f87171' /* red-400 */ : '#60a5fa' /* blue-400 */} />
                        ))}
                    </Bar>
                    <Bar yAxisId="right" dataKey="Personal" fill="#4ade80" /* green-400 */ name="Personal Disponible">
                        <LabelList dataKey="Personal" position="top" fill="#166534" /* green-800 */ fontSize={12} fontWeight="bold" />
                    </Bar>
                    <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="capacity" 
                        name="Capacidad SKU" 
                        stroke="#e11d48" /* rose-600 */
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                        dot={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WorkloadChart;
