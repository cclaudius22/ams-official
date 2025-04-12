// src/components/visa-builder/VisaInfoForm.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // Assuming you have a Label component
import { Plus, Trash2 } from 'lucide-react';

interface VisaInfoFormProps {
  visaName: string;
  setVisaName: (name: string) => void;
  visaDescription: string;
  setVisaDescription: (desc: string) => void;
  visaTypeId: string;
  setVisaTypeId: (id: string) => void;
  visaCode: string;
  setVisaCode: (code: string) => void;
  eligibilityCriteria: string[];
  setEligibilityCriteria: (criteria: string[]) => void;
}

const VisaInfoForm: React.FC<VisaInfoFormProps> = ({
  visaName,
  setVisaName,
  visaDescription,
  setVisaDescription,
  visaTypeId,
  setVisaTypeId,
  visaCode,
  setVisaCode,
  eligibilityCriteria,
  setEligibilityCriteria,
}) => {

  const handleCriteriaChange = (index: number, value: string) => {
    const newCriteria = [...eligibilityCriteria];
    newCriteria[index] = value;
    setEligibilityCriteria(newCriteria);
  };

  const addCriteria = () => {
    setEligibilityCriteria([...eligibilityCriteria, '']); // Add an empty string for a new criterion
  };

  const removeCriteria = (index: number) => {
    const newCriteria = [...eligibilityCriteria];
    newCriteria.splice(index, 1);
    setEligibilityCriteria(newCriteria);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">1. Basic Visa Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="visaName" className="block text-sm font-medium text-gray-700 mb-1">Visa Name</Label>
          <Input
            id="visaName"
            type="text"
            value={visaName}
            onChange={(e) => setVisaName(e.target.value)}
            className="w-full"
            placeholder="e.g., Business Visitor Visa"
          />
        </div>

        <div>
          <Label htmlFor="visaDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</Label>
          <Textarea
            id="visaDescription"
            value={visaDescription}
            onChange={(e) => setVisaDescription(e.target.value)}
            className="w-full h-24"
            placeholder="Briefly describe the purpose of this visa..."
          />
        </div>

        {/* Eligibility Criteria */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-sm text-gray-700">Eligibility Criteria</h3>
            <Button variant="ghost" size="sm" onClick={addCriteria} type="button">
              <Plus className="h-4 w-4" />
              <span className="ml-1">Add</span>
            </Button>
          </div>
          <div className="space-y-2 mb-4">
            {eligibilityCriteria.length > 0 ? (
              eligibilityCriteria.map((criteria, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={criteria}
                    onChange={(e) => handleCriteriaChange(index, e.target.value)}
                    className="w-full text-sm"
                    placeholder={`Requirement ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCriteria(index)}
                    className="flex-shrink-0"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Remove requirement</span>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic text-center">No eligibility criteria added yet.</p>
            )}
          </div>
        </div>


        <div className="mb-4">
          <Label htmlFor="visaTypeId" className="block text-sm font-medium text-gray-700 mb-1">Visa Type ID (System)</Label>
          <Input
            id="visaTypeId"
            type="text"
            value={visaTypeId}
            onChange={(e) => setVisaTypeId(e.target.value)}
            className="w-full text-sm font-mono"
            placeholder="e.g., high-potential-individual"
          />
          <p className="text-xs text-gray-500 mt-1">Unique system identifier (lowercase, dashes).</p>
        </div>

        <div>
          <Label htmlFor="visaCode" className="block text-sm font-medium text-gray-700 mb-1">Visa Code (Official)</Label>
          <Input
            id="visaCode"
            type="text"
            value={visaCode}
            onChange={(e) => setVisaCode(e.target.value)}
            className="w-full text-sm"
            placeholder="e.g., B1, F1, H1B"
          />
           <p className="text-xs text-gray-500 mt-1">Official code used for this visa type.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisaInfoForm;