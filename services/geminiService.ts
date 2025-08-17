import { GoogleGenAI, Type } from "@google/genai";
import type { Staff, DailyWorkload, ShiftName, ShiftScheduleData, AIResponse, Role } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function formatStaffing(staffing: { [key in ShiftName]: Staff }): string {
    return Object.entries(staffing)
        .map(([shiftName, staff]) => {
            const formattedShiftName = shiftName.replace('turno', 'Turno ');
            const staffDetails = Object.entries(staff)
                .map(([role, count]) => `${role}: ${count}`)
                .join(', ');
            return `- ${formattedShiftName}: ${staffDetails}`;
        })
        .join('\n');
}

function formatSchedule(schedule: ShiftScheduleData): string {
    return Object.entries(schedule)
        .map(([shiftName, scheduleData]) => {
            const scheduleDetails = Object.entries(scheduleData)
                .map(([day, time]) => `${day}: ${time}`)
                .join(', ');
            return `- ${shiftName}: ${scheduleDetails}`;
        })
        .join('\n');
}

export const getStructuredStaffingRecommendation = async (
    staffing: { [key in ShiftName]: Staff },
    workload: DailyWorkload,
    schedule: ShiftScheduleData,
    skuPerPerson: number
): Promise<AIResponse> => {
    const prompt = `
        Eres un experto en logística y supervisor de operaciones de almacén. Tu misión es analizar los datos operativos y generar recomendaciones de optimización en formato JSON estructurado.

        DATOS OPERATIVOS:
        1. Dotación de Personal por Turno:
        ${formatStaffing(staffing)}

        2. Horario de Turnos Semanal:
        ${formatSchedule(schedule)}

        3. Carga de Trabajo Diaria (SKUs):
        ${Object.entries(workload).map(([day, sku]) => `- ${day}: ${sku} SKU`).join('\n')}

        4. Capacidad Operativa:
        - Cada persona procesa ${skuPerPerson} SKUs por turno.

        TAREA:
        Analiza los datos y devuelve un objeto JSON.
        
        1.  **Alerta de Operación (Opcional):** Si detectas un problema crítico general (ej. un backlog masivo, un cuello de botella inminente que afecta a toda la operación), crea una alerta en 'operationAlert'. Debe ser un mensaje de urgencia, breve y claro. Si no hay una alerta crítica general, deja este campo nulo.

        2.  **Sugerencias de Optimización:** Identifica los desbalances entre la carga de trabajo y la capacidad del personal. Genera una lista de sugerencias de movimiento de personal para equilibrar la operación.
            -   **Prioridad:** Enfócate en mover personal desde turnos con baja carga hacia turnos con alta carga.
            -   **Lógica:** Las sugerencias deben ser lógicas. Propón movimientos que tengan el mayor impacto positivo.
            -   **Formato de cada sugerencia:**
                -   **title:** Un título claro y accionable. Ej: "Mover 1 Operativo".
                -   **fromShift/toShift:** Los identificadores del turno de origen y destino ('turno1', 'turno2', 'turnoPT').
                -   **role:** El rol del personal a mover ('reach', 'gruas', 'operativo', 'certificador').
                -   **amount:** La cantidad de personas a mover.
                -   **suggestedTime:** ¿Cuándo se debería hacer este movimiento? Sé específico. Ej: "Al inicio del turno del Lunes para afrontar la alta demanda".
                -   **reason:** La justificación. ¿Por qué este movimiento es necesario? Explica el problema que resuelve. Ej: "Para acelerar el proceso crítico de 'Almacenamiento en Reserva', que es el cuello de botella actual".
                -   **impact:** El beneficio esperado. ¿Qué se gana con este movimiento? Ej: "Esta reasignación permitirá reducir significativamente el tiempo total de la operación."

        El objetivo es generar recomendaciones concretas y aplicables que un supervisor pueda ejecutar directamente.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            operationAlert: {
                type: Type.STRING,
                description: "Una alerta operativa crítica si existe. De lo contrario, omitir.",
                nullable: true,
            },
            suggestions: {
                type: Type.ARRAY,
                description: "Una lista de sugerencias de optimización.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Título de la acción. Ej: Mover 1 Operativo." },
                        fromShift: { type: Type.STRING, enum: ['turno1', 'turno2', 'turnoPT'], description: "Turno de origen." },
                        toShift: { type: Type.STRING, enum: ['turno1', 'turno2', 'turnoPT'], description: "Turno de destino." },
                        role: { type: Type.STRING, enum: ['reach', 'gruas', 'operativo', 'certificador'], description: "Rol del personal." },
                        amount: { type: Type.INTEGER, description: "Cantidad de personas a mover." },
                        suggestedTime: { type: Type.STRING, description: "Momento sugerido para la acción." },
                        reason: { type: Type.STRING, description: "Justificación del movimiento." },
                        impact: { type: Type.STRING, description: "Impacto esperado de la acción." },
                    },
                    required: ["title", "fromShift", "toShift", "role", "amount", "suggestedTime", "reason", "impact"],
                },
            },
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonResponse = JSON.parse(response.text);
        
        if (!jsonResponse || !Array.isArray(jsonResponse.suggestions)) {
             return { suggestions: [] };
        }

        return jsonResponse as AIResponse;

    } catch (error) {
        console.error("Error al obtener recomendación de Gemini:", error);
        return {
            operationAlert: "Error al contactar al servicio de IA.",
            suggestions: [{
                title: "Error de Conexión",
                fromShift: 'turno1',
                toShift: 'turno1',
                role: 'operativo',
                amount: 0,
                suggestedTime: "Ahora",
                reason: "No se pudo obtener una respuesta del motor de IA. Revisa la consola para más detalles o verifica la API Key.",
                impact: "Las recomendaciones no están disponibles en este momento.",
            }],
        };
    }
};
