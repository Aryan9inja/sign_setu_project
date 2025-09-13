import { useRouter } from 'next/navigation';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export default function AccessDenied({ 
  title = "Access Denied",
  message = "You are not authorized to access this route.",
  showBackButton = true 
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {title}
        </h1>
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        {showBackButton && (
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Go Back to Home
          </button>
        )}
      </div>
    </div>
  );
}