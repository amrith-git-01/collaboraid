import AuthTabs from '../components/forms/AuthTabs';

function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center py-12 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left lg:flex-1">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 whitespace-nowrap">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                Collaboraid
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl lg:max-w-none text-center lg:text-center leading-relaxed text-justify">
              Join thousands of event professionals who trust us with their most
              important occasions
            </p>
          </div>

          {/* Right Side - Auth Form */}
          <div className="lg:flex-1 flex justify-center">
            <AuthTabs />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
