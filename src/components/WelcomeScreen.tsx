import Link from "next/link";

export default function WelcomeScreen() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Welcome to Sign Setu Project
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Please sign in or create an account to continue
        </p>
        <div className="space-x-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}