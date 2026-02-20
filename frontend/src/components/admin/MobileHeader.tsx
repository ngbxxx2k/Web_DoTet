export default function MobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1a202c] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
      <h1 className="text-lg font-bold text-[#111318] dark:text-white">
        Trang Quản Trị
      </h1>
      <button className="text-[#616f89] dark:text-gray-300">
        <span className="material-symbols-outlined">menu</span>
      </button>
    </div>
  );
}
