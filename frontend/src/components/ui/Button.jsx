const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-black text-white rounded-xl border-2 border-black hover:bg-gray-800 neo-brutalism",
    secondary: "bg-white text-black rounded-xl border-2 border-black hover:bg-gray-50 neo-brutalism",
    danger: "bg-red-500 text-white rounded-xl border-2 border-black hover:bg-red-600 neo-brutalism",
    success: "bg-brand-green text-white rounded-xl border-2 border-black hover:bg-green-600 neo-brutalism",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 rounded-xl"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
