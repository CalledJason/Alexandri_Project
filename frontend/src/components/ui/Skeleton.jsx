const Skeleton = ({ className = '', variant = 'card' }) => {
  if (variant === 'card') {
    return (
      <div className={`bg-gray-200 rounded-3xl p-6 border-4 border-gray-300 animate-pulse flex flex-col justify-between h-[250px] ${className}`}>
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
            <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
          </div>
          <div className="w-3/4 h-8 bg-gray-300 rounded mb-3"></div>
          <div className="w-full h-4 bg-gray-300 rounded mb-2"></div>
          <div className="w-5/6 h-4 bg-gray-300 rounded mb-6"></div>
        </div>
        <div className="space-y-4 pt-4 border-t-2 border-gray-300">
          <div className="w-1/2 h-4 bg-gray-300 rounded"></div>
          <div className="w-2/3 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return <div className={`bg-gray-300 rounded animate-pulse ${className}`}></div>;
  }

  return <div className={`bg-gray-300 rounded animate-pulse ${className}`}></div>;
};

export default Skeleton;
