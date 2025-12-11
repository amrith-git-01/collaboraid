import React from 'react';
import { X } from 'lucide-react';

const ImageSelectionModal = ({
  isOpen,
  onClose,
  onImageSelect,
  selectedImage,
}) => {
  if (!isOpen) return null;

  // List of preset event images with their definitions
  const presetImages = [
    {
      src: '/images/event_images/Virtual Social & Team Building.jpg',
      name: 'Virtual Social & Team Building',
      alt: 'Virtual Social & Team Building',
    },
    {
      src: '/images/event_images/Interactive Q&As & AMA Sessions.jpg',
      name: 'Interactive Q&As & AMA Sessions',
      alt: 'Interactive Q&As & AMA Sessions',
    },
    {
      src: '/images/event_images/Webinars & Digital Keynotes.jpg',
      name: 'Webinars & Digital Keynotes',
      alt: 'Webinars & Digital Keynotes',
    },
    {
      src: '/images/event_images/Interactive Online Workshops.jpg',
      name: 'Interactive Online Workshops',
      alt: 'Interactive Online Workshops',
    },
    {
      src: '/images/event_images/Collaborative Team Meetings.jpg',
      name: 'Collaborative Team Meetings',
      alt: 'Collaborative Team Meetings',
    },
    {
      src: '/images/event_images/Public and Community Engagements.jpg',
      name: 'Public and Community Engagements',
      alt: 'Public and Community Engagements',
    },
    {
      src: '/images/event_images/Academic and Career Fairs.jpg',
      name: 'Academic and Career Fairs',
      alt: 'Academic and Career Fairs',
    },
    {
      src: '/images/event_images/Tech and Innovation Forums.jpg',
      name: 'Tech and Innovation Forums',
      alt: 'Tech and Innovation Forums',
    },
    {
      src: '/images/event_images/Corporate Galas and Award Ceremonies.jpg',
      name: 'Corporate Galas and Award Ceremonies',
      alt: 'Corporate Galas and Award Ceremonies',
    },
    {
      src: '/images/event_images/Trade Shows and Exhibitions.jpg',
      name: 'Trade Shows and Exhibitions',
      alt: 'Trade Shows and Exhibitions',
    },
    {
      src: '/images/event_images/Seminars and Training Workshops.jpg',
      name: 'Seminars and Training Workshops',
      alt: 'Seminars and Training Workshops',
    },
    {
      src: '/images/event_images/Conference and Summits.jpg',
      name: 'Conference and Summits',
      alt: 'Conference and Summits',
    },
  ];

  const handleImageSelect = image => {
    onImageSelect(image);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Select Event Image
              </h2>
              <p className="text-gray-600 mt-1">
                Choose from our curated collection of event images
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Image Grid */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-3 gap-4">
            {presetImages.map((image, index) => (
              <div
                key={index}
                className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  selectedImage?.src === image.src
                    ? 'border-purple-500 shadow-lg shadow-purple-100'
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                }`}
                onClick={() => handleImageSelect(image)}
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Overlay with image name */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium leading-tight">
                      {image.name}
                    </p>
                  </div>
                </div>

                {/* Selection indicator */}
                {selectedImage?.src === image.src && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {selectedImage
                ? `Selected: ${selectedImage.name}`
                : 'No image selected'}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  selectedImage && handleImageSelect(selectedImage)
                }
                disabled={!selectedImage}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedImage
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSelectionModal;
