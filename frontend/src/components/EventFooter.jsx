import SocialLinks from './SocialLinks';

function EventFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-gray-600 text-sm">
            © 2024 Unite. All rights reserved. Made with ❤️ for professionals.
          </div>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}

export default EventFooter;
