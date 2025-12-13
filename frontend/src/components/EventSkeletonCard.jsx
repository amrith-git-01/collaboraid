import React from 'react';
import Skeleton from './ui/Skeleton';

/**
 * Event Skeleton Card Component
 * Displays a skeleton loader that mimics the EventCard structure
 */
const EventSkeletonCard = () => {
  return (
    <div className="relative max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Mobile/Tablet Card Layout (lg:hidden) */}
        <div className="lg:hidden">
          {/* Image Skeleton */}
          <Skeleton variant="rectangular" height="300px" className="w-full" />

          {/* Primary Details Below Image */}
          <div className="p-4">
            {/* Event Title Skeleton */}
            <Skeleton
              variant="text"
              height="24px"
              width="70%"
              className="mb-2"
            />

            {/* Description Skeleton */}
            <Skeleton
              variant="text"
              height="16px"
              width="100%"
              className="mb-1"
            />
            <Skeleton
              variant="text"
              height="16px"
              width="80%"
              className="mb-4"
            />

            {/* Main Details Section */}
            <div className="space-y-3 mb-4">
              {/* Start Date Skeleton */}
              <div className="flex items-center space-x-3">
                <Skeleton variant="circular" width="40px" height="40px" />
                <div className="flex-1">
                  <Skeleton
                    variant="text"
                    height="14px"
                    width="40%"
                    className="mb-1"
                  />
                  <Skeleton variant="text" height="18px" width="90%" />
                </div>
              </div>

              {/* End Date Skeleton */}
              <div className="flex items-center space-x-3">
                <Skeleton variant="circular" width="40px" height="40px" />
                <div className="flex-1">
                  <Skeleton
                    variant="text"
                    height="14px"
                    width="40%"
                    className="mb-1"
                  />
                  <Skeleton variant="text" height="18px" width="90%" />
                </div>
              </div>

              {/* Access Type Skeleton */}
              <div className="flex items-center space-x-3">
                <Skeleton variant="circular" width="40px" height="40px" />
                <div className="flex-1">
                  <Skeleton
                    variant="text"
                    height="14px"
                    width="40%"
                    className="mb-1"
                  />
                  <Skeleton variant="text" height="18px" width="50%" />
                </div>
              </div>

              {/* Creator Skeleton */}
              <div className="flex items-center space-x-3">
                <Skeleton variant="circular" width="40px" height="40px" />
                <div className="flex-1">
                  <Skeleton
                    variant="text"
                    height="14px"
                    width="40%"
                    className="mb-1"
                  />
                  <Skeleton variant="text" height="18px" width="60%" />
                </div>
              </div>
            </div>

            {/* Button Skeleton */}
            <Skeleton
              variant="rectangular"
              height="40px"
              width="100%"
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Desktop Layout (hidden lg:flex) */}
        <div className="hidden lg:flex items-stretch">
          {/* Left Side - Image Skeleton */}
          <div className="flex-shrink-0">
            <Skeleton
              variant="rectangular"
              width="256px"
              height="256px"
              className="rounded-l-lg"
            />
          </div>

          {/* Right Side - Event Details */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between h-full">
              <div className="flex-1 min-w-0">
                {/* Title and Badge Skeleton */}
                <div className="flex items-start justify-between mb-2">
                  <Skeleton variant="text" height="24px" width="60%" />
                  <div className="flex items-center space-x-2">
                    <Skeleton
                      variant="rectangular"
                      height="28px"
                      width="100px"
                      className="rounded-full"
                    />
                  </div>
                </div>

                {/* Description Skeleton */}
                <Skeleton
                  variant="text"
                  height="16px"
                  width="100%"
                  className="mb-1 mt-4"
                />
                <Skeleton
                  variant="text"
                  height="16px"
                  width="85%"
                  className="mb-4"
                />

                {/* Details Grid Skeleton */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="col-span-2 space-y-4">
                    {/* Start Date Skeleton */}
                    <div className="flex items-start space-x-3">
                      <Skeleton variant="circular" width="40px" height="40px" />
                      <div className="flex-1">
                        <Skeleton
                          variant="text"
                          height="14px"
                          width="30%"
                          className="mb-1"
                        />
                        <Skeleton variant="text" height="18px" width="80%" />
                      </div>
                    </div>

                    {/* End Date Skeleton */}
                    <div className="flex items-start space-x-3">
                      <Skeleton variant="circular" width="40px" height="40px" />
                      <div className="flex-1">
                        <Skeleton
                          variant="text"
                          height="14px"
                          width="30%"
                          className="mb-1"
                        />
                        <Skeleton variant="text" height="18px" width="80%" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Access Type Skeleton */}
                    <div className="flex items-start space-x-3">
                      <Skeleton variant="circular" width="40px" height="40px" />
                      <div className="flex-1">
                        <Skeleton
                          variant="text"
                          height="14px"
                          width="50%"
                          className="mb-1"
                        />
                        <Skeleton variant="text" height="16px" width="60%" />
                      </div>
                    </div>

                    {/* Creator Skeleton */}
                    <div className="flex items-start space-x-3">
                      <Skeleton variant="circular" width="40px" height="40px" />
                      <div className="flex-1">
                        <Skeleton
                          variant="text"
                          height="14px"
                          width="50%"
                          className="mb-1"
                        />
                        <Skeleton variant="text" height="16px" width="70%" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSkeletonCard;
