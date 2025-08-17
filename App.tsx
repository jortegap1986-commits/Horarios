import React, { useState, useCallback } from 'react';
import type { Staff, ShiftName, Role, DailyWorkload, ShiftScheduleData, OptimizationSuggestion } from './types';
import { DEFAULT_STAFFING, DEFAULT_SHIFT_SCHEDULE, DEFAULT_SKU_LOAD, DEFAULT_SKU_PER_PERSON, DAYS_OF_WEEK } from './constants';
import StaffingTable from './components/StaffingTable';
import ShiftScheduleTable from './components/ShiftScheduleTable';
import WorkloadChart from './components/WorkloadChart';
import Card from './components/Card';
import RecommendationEngine from './components/RecommendationEngine';

interface ModelParametersProps {
    dailySkuLoad: DailyWorkload;
    skuPerPerson: number;
    onSkuUpdate: (day: string, value: number) => void;
    onCapacityUpdate: (value: number) => void;
}

const ModelParameters: React.FC<ModelParametersProps> = ({ dailySkuLoad, skuPerPerson, onSkuUpdate, onCapacityUpdate }) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-3 border-b pb-2">Carga de Trabajo (SKU)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {DAYS_OF_WEEK.map(day => (
                        <div key={day}>
                            <label htmlFor={`sku-${day}`} className="block text-sm font-medium text-slate-600 mb-1">{day}</label>
                            <input
                                type="number"
                                id={`sku-${day}`}
                                min="0"
                                value={dailySkuLoad[day]}
                                onChange={(e) => onSkuUpdate(day, parseInt(e.target.value, 10) || 0)}
                                className="w-full p-2 text-center bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-3 border-b pb-2">Capacidad Operativa</h3>
                 <div className="max-w-xs">
                    <label htmlFor="sku-per-person" className="block text-sm font-medium text-slate-600 mb-1">SKUs procesados por persona</label>
                    <input
                        type="number"
                        id="sku-per-person"
                        min="0"
                        value={skuPerPerson}
                        onChange={(e) => onCapacityUpdate(parseInt(e.target.value, 10) || 0)}
                        className="w-full p-2 text-center bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [staffing, setStaffing] = useState<{ [key in ShiftName]: Staff }>(DEFAULT_STAFFING);
  const [shiftSchedule, setShiftSchedule] = useState<ShiftScheduleData>(DEFAULT_SHIFT_SCHEDULE);
  const [dailySkuLoad, setDailySkuLoad] = useState<DailyWorkload>(DEFAULT_SKU_LOAD);
  const [skuPerPerson, setSkuPerPerson] = useState<number>(DEFAULT_SKU_PER_PERSON);


  const handleStaffUpdate = useCallback((shift: ShiftName, role: Role, value: number) => {
    setStaffing(prev => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [role]: value,
      },
    }));
  }, []);

  const handleScheduleUpdate = useCallback((shift: string, day: string, value: string) => {
    setShiftSchedule(prev => ({
        ...prev,
        [shift]: {
            ...prev[shift],
            [day]: value,
        },
    }));
  }, []);

  const handleSkuUpdate = useCallback((day: string, value: number) => {
    setDailySkuLoad(prev => ({
        ...prev,
        [day]: value,
    }));
  }, []);

  const handleCapacityUpdate = useCallback((value: number) => {
    setSkuPerPerson(value);
  }, []);

  const handleApplySuggestion = useCallback((suggestion: OptimizationSuggestion) => {
      const { fromShift, toShift, role, amount } = suggestion;

      setStaffing(prev => {
          const newStaffing = JSON.parse(JSON.stringify(prev));
          
          const fromShiftStaff = newStaffing[fromShift][role];
          
          const amountToMove = Math.min(amount, fromShiftStaff);
          
          if (amountToMove > 0) {
            newStaffing[fromShift][role] -= amountToMove;
            newStaffing[toShift][role] += amountToMove;
          }

          return newStaffing;
      });
  }, []);


  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            Panel de Optimización de Operaciones
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Modele su dotación de personal, visualice la carga de trabajo y reciba sugerencias de IA.
          </p>
        </header>

        <main className="grid grid-cols-1 gap-8">
          <Card title="Planificador de Turnos Semanal (Editable)">
              <ShiftScheduleTable 
                staffing={staffing} 
                schedule={shiftSchedule} 
                onUpdate={handleScheduleUpdate} 
              />
          </Card>
          
          <Card title="Análisis de Carga de Trabajo vs. Personal">
              <WorkloadChart 
                staffing={staffing}
                dailySkuLoad={dailySkuLoad}
                shiftSchedule={shiftSchedule}
                skuPerPerson={skuPerPerson}
              />
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2">
                <Card title="Parámetros del Modelo (Editable)" className="h-full">
                    <ModelParameters 
                        dailySkuLoad={dailySkuLoad}
                        skuPerPerson={skuPerPerson}
                        onSkuUpdate={handleSkuUpdate}
                        onCapacityUpdate={handleCapacityUpdate}
                    />
                </Card>
            </div>
            <div className="lg:col-span-3">
                <Card title="Distribución de Dotación Actual (Editable)" className="h-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <StaffingTable
                        title="Turno 1"
                        staffData={staffing.turno1}
                        onUpdate={(role, value) => handleStaffUpdate('turno1', role, value)}
                        titleBgClass="bg-green-200"
                      />
                      <StaffingTable
                        title="Turno 2"
                        staffData={staffing.turno2}
                        onUpdate={(role, value) => handleStaffUpdate('turno2', role, value)}
                         titleBgClass="bg-blue-200"
                      />
                      <StaffingTable
                        title="Turno PT"
                        staffData={staffing.turnoPT}
                        onUpdate={(role, value) => handleStaffUpdate('turnoPT', role, value)}
                        titleBgClass="bg-yellow-200"
                      />
                  </div>
                </Card>
            </div>
          </div>
          
           <Card title="Sugerencias de Optimización (IA)">
              <RecommendationEngine 
                staffing={staffing}
                workload={dailySkuLoad}
                schedule={shiftSchedule}
                skuPerPerson={skuPerPerson}
                onApplySuggestion={handleApplySuggestion}
              />
           </Card>

        </main>
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Optimizador de Turnos. Creado para la toma de decisiones ágil.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
