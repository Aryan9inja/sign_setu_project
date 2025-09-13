import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export default function PageHeader({ title, showBackButton = true, backUrl = '/' }: PageHeaderProps) {
  const router = useRouter();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {showBackButton && (
              <button
                onClick={() => router.push(backUrl)}
                className="text-indigo-600 hover:text-indigo-800 mr-4"
              >
                ← Back
              </button>
            )}
            <h1 className="text-xl font-semibold text-gray-900">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </nav>
  );
}