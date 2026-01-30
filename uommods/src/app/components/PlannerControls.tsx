import { Button } from "@/components/ui/button";
import { Program } from "@/lib/types";
import { RefreshCwIcon } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Year = 1 | 2 | 3;

interface PlannerControlsProps {
  programs: Record<string, Program>;
  selectedProgramCode: string;
  setSelectedProgramCode: (code: string) => void;
  selectedYear: Year;
  setSelectedYear: (year: Year) => void;
  selectedSemester: string;
  setSelectedSemester: (semester: string) => void;
  onResetChoices: () => void;
  isMobileView?: boolean;
}

export default function PlannerControls({
  programs,
  selectedProgramCode,
  setSelectedProgramCode,
  selectedYear,
  setSelectedYear,
  selectedSemester,
  setSelectedSemester,
  onResetChoices,
  isMobileView,
}: PlannerControlsProps) {
  const SemesterSelector = () => {
    if (isMobileView && selectedProgramCode && selectedYear) {
      // Mobile dropdown
      return (
        <div className="flex flex-col gap-1 sm:hidden">
          <label className="text-sm font-medium">Semester View</label>
          <Select 
            value={selectedSemester} 
            onValueChange={(value) => setSelectedSemester(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full year">Year-Long</SelectItem>
              <SelectItem value="Semester 1">Semester 1</SelectItem>
              <SelectItem value="Semester 2">Semester 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Course of Study</label>
            <select
              className="border rounded px-3 py-2"
              value={selectedProgramCode}
              onChange={(e) => setSelectedProgramCode(e.target.value)}
            >
              <option value="">Select Program</option>
              {Object.values(programs).map((prog) => (
                <option key={prog.program_id} value={prog.program_id}>
                  {prog.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Year of Study</label>
            <select
              className="border rounded px-3 py-2"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value) as Year)}
            >
              <option value="">Select Year</option>
              {[1, 2, 3].map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <SemesterSelector />

      {selectedProgramCode && selectedYear && (
        <Button onClick={onResetChoices}>
          <RefreshCwIcon /> Reset Choices
        </Button>
      )}
    </>
  );
}