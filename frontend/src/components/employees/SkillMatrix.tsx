// SkillMatrix.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Table } from '../shared/Table';
import { BadgeCheck, Award, TrendingUp, Users } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  requiredCertifications: string[];
}

interface EmployeeSkill {
  employeeId: string;
  skillId: string;
  proficiencyLevel: 1 | 2 | 3 | 4 | 5;
  lastAssessed: string;
  certifications: string[];
}

interface Employee {
  id: string;
  name: string;
  department?: string;
  avatar?: string;
}

const mockEmployees: Employee[] = [
  { id: '1', name: 'John Smith', department: 'Production', avatar: 'JS' },
  { id: '2', name: 'Sarah Johnson', department: 'Quality', avatar: 'SJ' },
  { id: '3', name: 'Mike Wilson', department: 'Maintenance', avatar: 'MW' },
  { id: '4', name: 'Emily Davis', department: 'Production', avatar: 'ED' },
  { id: '5', name: 'Robert Brown', department: 'Quality', avatar: 'RB' },
];

const mockSkills: Skill[] = [
  { id: '1', name: 'CNC Operation', category: 'Machining', description: 'Computer Numerical Control machine operation', requiredCertifications: ['CNC Level 1', 'CNC Level 2'] },
  { id: '2', name: 'Welding', category: 'Fabrication', description: 'Metal welding and fabrication', requiredCertifications: ['AWS Certified Welder'] },
  { id: '3', name: 'Quality Inspection', category: 'Quality', description: 'Product quality inspection and testing', requiredCertifications: ['ISO 9001', 'CQT Certification'] },
  { id: '4', name: 'Equipment Maintenance', category: 'Maintenance', description: 'Preventive and corrective maintenance', requiredCertifications: ['Industrial Maintenance Cert'] },
  { id: '5', name: 'Safety Compliance', category: 'Safety', description: 'Workplace safety procedures', requiredCertifications: ['OSHA 30', 'First Aid'] },
];

const mockEmployeeSkills: EmployeeSkill[] = [
  { employeeId: '1', skillId: '1', proficiencyLevel: 5, lastAssessed: '2024-01-15', certifications: ['CNC Level 1', 'CNC Level 2'] },
  { employeeId: '1', skillId: '2', proficiencyLevel: 3, lastAssessed: '2024-02-20', certifications: [] },
  { employeeId: '2', skillId: '3', proficiencyLevel: 5, lastAssessed: '2024-01-10', certifications: ['ISO 9001', 'CQT Certification'] },
  { employeeId: '2', skillId: '5', proficiencyLevel: 4, lastAssessed: '2024-03-01', certifications: ['OSHA 30'] },
  { employeeId: '3', skillId: '4', proficiencyLevel: 5, lastAssessed: '2024-02-15', certifications: ['Industrial Maintenance Cert'] },
  { employeeId: '3', skillId: '5', proficiencyLevel: 5, lastAssessed: '2024-01-20', certifications: ['OSHA 30', 'First Aid'] },
  { employeeId: '4', skillId: '1', proficiencyLevel: 4, lastAssessed: '2024-03-05', certifications: ['CNC Level 1'] },
  { employeeId: '5', skillId: '3', proficiencyLevel: 4, lastAssessed: '2024-02-28', certifications: ['ISO 9001'] },
];

const SkillMatrix: React.FC = () => {
  const [skills] = useState<Skill[]>(mockSkills);
  const [employeeSkills] = useState<EmployeeSkill[]>(mockEmployeeSkills);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{empId: string; skillId: string} | null>(null);

  const getProficiencyColor = (level: number) => {
    const colors = {
      1: 'bg-gradient-to-br from-red-400 to-red-500 text-white',
      2: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white',
      3: 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white',
      4: 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white',
      5: 'bg-gradient-to-br from-green-400 to-green-500 text-white'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100';
  };

  const getProficiencyLabel = (level: number) => {
    const labels = {
      1: 'Beginner',
      2: 'Elementary',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    return labels[level as keyof typeof labels] || '-';
  };

  const getSkillStats = (skillId: string) => {
    const skillLevels = employeeSkills.filter(es => es.skillId === skillId).map(es => es.proficiencyLevel);
    const avg = skillLevels.length > 0 ? skillLevels.reduce((a, b) => a + b, 0) / skillLevels.length : 0;
    const max = skillLevels.length > 0 ? Math.max(...skillLevels) : 0;
    return { avg: avg.toFixed(1), max, count: skillLevels.length };
  };

  return (
    <Card className="w-full overflow-hidden bg-white/80 backdrop-blur-sm">
      <CardHeader className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Skill Matrix
            </h2>
            <p className="text-sm text-gray-500">Employee proficiency tracking</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-lg border border-indigo-200 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Add Skill
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Update Matrix
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[1, 2, 3, 4, 5].map(level => (
            <div key={level} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-sm ${getProficiencyColor(level)}`}>
                {level}
              </div>
              <span className="text-xs text-gray-600">{getProficiencyLabel(level)}</span>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="border-b-2 border-r border-gray-200 p-4 text-left">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</span>
                </th>
                {skills.map(skill => {
                  const stats = getSkillStats(skill.id);
                  return (
                    <th 
                      key={skill.id} 
                      className="border-b-2 border-r border-gray-200 p-3 whitespace-nowrap cursor-pointer hover:bg-indigo-50 transition-colors duration-200 group"
                      onClick={() => setSelectedSkill(skill)}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{skill.name}</div>
                        <div className="text-xs text-gray-500 mt-1">Avg: {stats.avg}</div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, empIndex) => (
                <tr 
                  key={employee.id} 
                  className="hover:bg-indigo-50/30 transition-colors duration-150 animate-fade-in"
                  style={{ animationDelay: `${empIndex * 50}ms` }}
                >
                  <td className="border-r border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                        {employee.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{employee.name}</div>
                        <div className="text-xs text-gray-500">{employee.department}</div>
                      </div>
                    </div>
                  </td>
                  {skills.map(skill => {
                    const employeeSkill = employeeSkills.find(
                      es => es.employeeId === employee.id && es.skillId === skill.id
                    );
                    const isHovered = hoveredCell?.empId === employee.id && hoveredCell?.skillId === skill.id;
                    return (
                      <td
                        key={skill.id}
                        className={`border-r border-gray-200 p-2 text-center transition-all duration-200 cursor-pointer ${isHovered ? 'scale-110 shadow-lg' : ''}`}
                        onMouseEnter={() => setHoveredCell({ empId: employee.id, skillId: skill.id })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {employeeSkill ? (
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-white shadow-sm transition-transform ${getProficiencyColor(employeeSkill.proficiencyLevel)} ${isHovered ? 'scale-110' : ''}`}>
                            {employeeSkill.proficiencyLevel}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                            <span className="text-lg">−</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedSkill && (
          <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <BadgeCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{selectedSkill.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedSkill(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Category</span>
                </div>
                <p className="text-gray-700 font-medium">{selectedSkill.category}</p>
                <p className="text-gray-600 text-sm">{selectedSkill.description}</p>
                <div className="mt-4 flex gap-3">
                  {getSkillStats(selectedSkill.id) && (
                    <>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-indigo-600">{getSkillStats(selectedSkill.id).avg}</div>
                        <div className="text-xs text-gray-500">Avg Score</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{getSkillStats(selectedSkill.id).count}</div>
                        <div className="text-xs text-gray-500">Certified</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
                  <Award className="w-4 h-4 text-indigo-500" />
                  Required Certifications
                </h4>
                <div className="space-y-2">
                  {selectedSkill.requiredCertifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm">
                      <BadgeCheck className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillMatrix;