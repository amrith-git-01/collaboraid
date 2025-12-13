import React from 'react';

/**
 * Base Skeleton Component
 * A reusable skeleton loader that can be used as a base class for all skeleton loaders
 *
 * @param {string} className - Additional CSS classes
 * @param {string} variant - Skeleton variant: 'rectangular' | 'circular' | 'text'
 * @param {string} width - Width of the skeleton (e.g., '100%', '200px', 'w-32')
 * @param {string} height - Height of the skeleton (e.g., '100%', '40px', 'h-10')
 * @param {boolean} animate - Whether to show pulse animation (default: true)
 */
const Skeleton = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animate = true,
  ...props
}) => {
  const baseClasses = 'bg-gray-200 rounded';

  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded',
  };

  const animationClass = animate ? 'animate-pulse' : '';

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClass} ${className}`}
      style={style}
      {...props}
    />
  );
};

export default Skeleton;
