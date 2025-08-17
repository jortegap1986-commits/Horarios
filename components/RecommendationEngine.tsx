import React, { useState, useCallback } from 'react';
import { SparklesIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { getStructuredStaffingRecommendation } from '../services/geminiService';
import type { Staff, DailyWorkload, ShiftName, ShiftScheduleData, AIResponse, OptimizationSuggestion, Role } from '../types';

interface RecommendationEngineProps {
    staffing: { [key in ShiftName]: Staff };
    workload: DailyWorkload;
    schedule: ShiftScheduleData;
    skuPerPerson: number;
    onApplySuggestion: (suggestion: OptimizationSuggestion) => void;
}

const SHIFT_DISPLAY_NAMES: { [key in ShiftName]: string } = {
    turno1: 'Turno 1',
    turno2: 'Turno 2',
    turnoPT: 'Turno PT',
};

const ROLE_DISPLAY_NAMES: { [key in Role]: string } = {
    reach: 'Reach',
    gruas: 'Grúas',
    operativo: 'Operativo',
    certificador: 'Certificador',
};

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ staffing, workload, schedule, skuPerPerson, onApplySuggestion }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
    const [error, setError] = useState('');

    const handleGetRecommendation = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setAiResponse(null);
        try {
            const result = await getStructuredStaffingRecommendation(staffing, workload, schedule, skuPerPerson);
            setAiResponse(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
            setError(errorMessage);
            setAiResponse(null);
        } finally {
            setIsLoading(false);
        }
    }, [staffing, workload, schedule, skuPerPerson]);

    const handleApplyClick = (suggestion: OptimizationSuggestion) => {
        onApplySuggestion(suggestion);
        setAiResponse(prev => {
            if (!prev) return null;
            return {
                ...prev,
                suggestions: prev.suggestions.filter(s => s !== suggestion),
            };
        });
    };

    return (
        <div>
             <p className="text-slate-600 mb-6 -mt-2">Obtén recomendaciones para mover recursos, reducir el cuello de botella y cumplir con el horario.</p>
            <div className="flex justify-end mb-6">
                 <button
                    onClick={handleGetRecommendation}
                    disabled={isLoading}
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Obteniendo Sugerencias...
                        </>
                    ) : (
                         "Obtener Sugerencias"
                    )}
                </button>
            </div>
            
            {error && <div className="p-4 mb-6 bg-red-100 text-red-800 border-l-4 border-red-500 rounded-r-lg">{error}</div>}

            {aiResponse?.operationAlert && (
                 <div className="p-4 mb-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow">
                    <div className="flex items-start">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-yellow-800">Alerta de Operación</h4>
                            <p className="text-yellow-700">{aiResponse.operationAlert}</p>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="text-center p-8">
                    <div role="status" className="flex justify-center items-center">
                        <svg aria-hidden="true" className="w-8 h-8 text-slate-200 animate-spin dark:text-slate-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>
                        <span className="sr-only">Cargando...</span>
                    </div>
                    <p className="text-slate-500 mt-4">Analizando datos y generando optimizaciones...</p>
                </div>
            )}

            {!isLoading && aiResponse && aiResponse.suggestions.length > 0 && (
                 <div className="space-y-6">
                    {aiResponse.suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-slate-200 transition-shadow hover:shadow-lg">
                            <h4 className="text-xl font-bold text-slate-800">{suggestion.title}</h4>
                            <div className="mt-2 text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                                <span><span className="font-semibold">Desde:</span> {SHIFT_DISPLAY_NAMES[suggestion.fromShift]}</span>
                                <span><span className="font-semibold">Hacia:</span> {SHIFT_DISPLAY_NAMES[suggestion.toShift]}</span>
                                <span><span className="font-semibold">Rol:</span> {ROLE_DISPLAY_NAMES[suggestion.role]}</span>
                            </div>

                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start">
                                    <ClockIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-blue-800">Momento Sugerido:</p>
                                        <p className="text-blue-700">{suggestion.suggestedTime}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="mt-4 text-slate-700">{suggestion.reason}</p>
                            <p className="mt-2 text-sm text-slate-600 italic">"{suggestion.impact}"</p>

                            <div className="mt-6 flex justify-end">
                                <button 
                                    onClick={() => handleApplyClick(suggestion)}
                                    className="px-5 py-2 bg-blue-600 text-white font-bold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    aria-label={`Aplicar sugerencia: ${suggestion.title}`}
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    ))}
                 </div>
            )}

            {!isLoading && !aiResponse && !error && (
                <div className="mt-4 p-6 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-center">
                    <p>Haga clic en "Obtener Sugerencias" para recibir recomendaciones de IA para optimizar su personal.</p>
                </div>
            )}
            
            {!isLoading && aiResponse && aiResponse.suggestions.length === 0 && !aiResponse.operationAlert && (
                 <div className="mt-4 p-6 bg-green-50 text-green-700 border-2 border-dashed border-green-200 rounded-lg text-center">
                    <p className="font-semibold text-lg">¡Todo en orden!</p>
                    <p>No se encontraron desbalances significativos que requieran acción. La operación parece estar equilibrada.</p>
                </div>
            )}
        </div>
    );
};

export default RecommendationEngine;
