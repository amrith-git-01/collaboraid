function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  isLoading = false,
  rounded = 'full', // 'full' | 'lg' | 'md' | 'none'
  icon = null, // Icon component to display before text
  iconPosition = 'left', // 'left' | 'right'
  fullWidth = false,
  ...props
}) {
  const baseClasses =
    'font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2';

  const roundedClasses = {
    full: 'rounded-full',
    lg: 'rounded-lg',
    md: 'rounded-md',
    none: 'rounded-none',
  };

  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white',
    secondary:
      'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white',
    outline:
      'border-2 border-gray-300 text-gray-700 hover:border-purple-600 hover:text-purple-600',
    danger:
      'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500',
    ghost:
      'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-none shadow-none',
    link: 'text-purple-600 hover:text-purple-700 underline-offset-4 hover:underline bg-transparent border-none shadow-none p-0',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-3',
    lg: 'px-12 py-4 text-lg',
    xs: 'px-2 py-1 text-xs',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${roundedClasses[rounded]} ${widthClass} ${className}`;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>{children}</span>
        </div>
      );
    }

    if (icon) {
      const iconElement = (
        <span
          className={iconPosition === 'left' ? 'order-first' : 'order-last'}
        >
          {icon}
        </span>
      );
      return (
        <>
          {iconPosition === 'left' && iconElement}
          <span>{children}</span>
          {iconPosition === 'right' && iconElement}
        </>
      );
    }

    return children;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {renderContent()}
    </button>
  );
}
export default Button;
