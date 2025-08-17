
import React from 'react';
import type { Staff, Role } from '../types';
import { ROLES } from '../types';

interface StaffingTableProps {
  title: string;
  staffData: Staff;
  onUpdate: (role: Role, value: number) => void;
  titleBgClass: string;
}

const StaffingTable: React.FC<StaffingTableProps> = ({ title, staffData, onUpdate, titleBgClass }) => {
  const total = Object.values(staffData).reduce((sum, value) => sum + value, 0);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
      <h3 className={`text-lg font-bold p-3 text-center text-slate-800 ${titleBgClass}`}>{title}</h3>
      <table className="w-full text-sm text-left text-slate-600">
        <tbody>
          {ROLES.map(({ key, name }) => (
            <tr key={key} className="border-b border-slate-200 last:border-b-0">
              <td className="py-2 px-4 font-medium">{name}</td>
              <td className="py-2 px-4">
                <input
                  type="number"
                  min="0"
                  value={staffData[key]}
                  onChange={(e) => onUpdate(key, parseInt(e.target.value, 10) || 0)}
                  className="w-16 p-1 text-center bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
            </tr>
          ))}
          <tr className="bg-slate-100 font-bold text-slate-800">
            <td className="py-2 px-4">Total</td>
            <td className="py-2 px-4 text-center w-16">{total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StaffingTable;
