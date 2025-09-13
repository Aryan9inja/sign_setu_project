import { useState } from "react";

interface Progress {
  id: string;
  progress_percent: number;
  user_id: string;
  users?: {
    user_name: string;
  };
}

interface ProgressTableProps {
  progress: Progress[];
  userRole: string | null;
  onUpdateProgress: () => void;
}

interface ApiResponse {
  success: boolean;
  res: string;
}

export default function ProgressTable({
  progress,
  userRole,
  onUpdateProgress,
}: ProgressTableProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<string | null>(null);

  const handleGetReview = async (progressPercent: number, progressId: string) => {
    setIsLoading(progressId);
    try {
      const response = await fetch(`/api/ai-review?progress=${progressPercent}`, {
        method: "GET",
      });
      
      if (response.ok) {
        const data: ApiResponse = await response.json();
        if (data.success) {
          setReviewResult(data.res);
        } else {
          console.error("API request failed:", data.res);
          setReviewResult("Failed to get review. Please try again.");
        }
      } else {
        console.error("HTTP error:", response.status, response.statusText);
        setReviewResult("Failed to get review. Please try again.");
      }
    } catch (error) {
      console.error("Error getting review:", error);
      setReviewResult("An error occurred while getting the review. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Progress Data</h3>
        {userRole === "teacher" && (
          <button
            onClick={onUpdateProgress}
            className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-2 rounded-md text-xs font-medium transition-colors"
          >
            Update Progress
          </button>
        )}
      </div>
      {progress.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress Percent
                </th>
                {userRole !== "teacher" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {progress.map((item: Progress) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.users?.user_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="mr-2">{item.progress_percent}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.progress_percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  {userRole !== "teacher" && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleGetReview(item.progress_percent, item.id)}
                        disabled={isLoading === item.id}
                        className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-2 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading === item.id ? "Loading..." : "Get Review"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No progress data found</p>
      )}
      
      {reviewResult && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-blue-900 mb-2">AI based Review :</h4>
          <p className="text-blue-800 whitespace-pre-wrap">{reviewResult}</p>
          <button
            onClick={() => setReviewResult(null)}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Clear Review
          </button>
        </div>
      )}
    </div>
  );
}
