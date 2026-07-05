import { Bell } from "lucide-react";

export default function Navbar() {
  return (
    <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="font-semibold text-xl text-gray-800">
          Smart Agriculture Platform
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-sm text-gray-600">
            System Online
          </span>
        </div>

        <Bell className="cursor-pointer" />

        <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center">
          A
        </div>
      </div>
    </header>
  );
}