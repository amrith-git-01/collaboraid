function Card({ children, className = '', hover = false, ...props }) {
  const baseClasses = 'bg-white rounded-2xl shadow-lg overflow-hidden';
  const hoverClasses = hover
    ? 'hover:shadow-2xl transition-all duration-500 hover:-translate-y-2'
    : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
