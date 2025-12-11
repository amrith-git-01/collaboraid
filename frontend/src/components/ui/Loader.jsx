function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95 backdrop-blur-sm">
      <div className="relative">
        {/* Main spinning container */}
        <div className="relative h-24 w-24 animate-spin-slow rounded-full">
          {/* Gradient background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-purple-400 to-purple-200"></div>

          {/* Blurred glow layers */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-purple-400 to-purple-200 blur-[5px] opacity-80"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-purple-400 to-purple-200 blur-[10px] opacity-60"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-purple-400 to-purple-200 blur-[25px] opacity-40"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-purple-400 to-purple-200 blur-[50px] opacity-20"></div>

          {/* White center with border */}
          <div className="absolute inset-2 rounded-full bg-white border-4 border-white shadow-lg"></div>

          {/* Inner purple accent */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-300 opacity-20"></div>
        </div>

        {/* Loading text with animation */}
        <div className="mt-6 text-center">
          <p className="text-purple-600 font-medium animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
}

export default Loader;
