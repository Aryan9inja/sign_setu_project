import ClassroomsTable from "./ClassroomsTable";
import ProgressTable from "./ProgressTable";

interface Classroom {
  id: string;
  class_name: string;
  grade: string;
  user_id: string;
  users?: {
    user_name: string;
  };
}

interface Progress {
  id: string;
  progress_percent: number;
  user_id: string;
  users?: {
    user_name: string;
  };
}

interface DashboardProps {
  classrooms: Classroom[];
  progress: Progress[];
  userRole: string | null;
  onUpdateProgress: () => void;
  onUpdateClassroom: () => void;
}

export default function Dashboard({
  classrooms,
  progress,
  userRole,
  onUpdateProgress,
  onUpdateClassroom,
}: DashboardProps) {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <p className="text-gray-600 mb-6">
            You are successfully logged in!
          </p>
        </div>

        <ClassroomsTable classrooms={classrooms} userRole={userRole} onUpdateClassroom={onUpdateClassroom} />
        <ProgressTable progress={progress} userRole={userRole} onUpdateProgress={onUpdateProgress} />
      </div>
    </div>
  );
}
