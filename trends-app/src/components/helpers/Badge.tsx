export const Badge = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  return (
    <p className={`text-sm text-gray-500 bg-gray-100 rounded-md px-2 py-1 m-1 whitespace-nowrap ${onClick ? "cursor-pointer" : ""}`} onClick={onClick}>
      {children}
    </p>
  );
};
