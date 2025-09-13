interface Classroom {
  id: string;
  class_name: string;
  grade: string;
  user_id: string;
  users?: {
    user_name: string;
  };
}

interface ClassroomsTableProps {
  classrooms: Classroom[];
  userRole: string | null;
  onUpdateClassroom: () => void;
}

export default function ClassroomsTable({ classrooms, userRole, onUpdateClassroom }: ClassroomsTableProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Classrooms Data
        </h3>
        {userRole === "teacher" && (
          <button
            onClick={onUpdateClassroom}
            className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-2 rounded-md text-xs font-medium transition-colors"
          >
            Update Classrooms
          </button>
        )}
      </div>
      {classrooms.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Name
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classrooms.map((classroom: Classroom) => (
                <tr key={classroom.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classroom.users?.user_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classroom.grade || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classroom.class_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No classroom data found</p>
      )}
    </div>
  );
}