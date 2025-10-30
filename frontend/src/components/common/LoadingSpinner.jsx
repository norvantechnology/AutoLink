function LoadingSpinner({ size = 'medium' }) {
  const sizes = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex items-center justify-center h-64">
      <div className={`animate-spin rounded-full border-b-2 border-linkedin ${sizes[size]}`}></div>
    </div>
  );
}

export default LoadingSpinner;

