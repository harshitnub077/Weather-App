"use client";

import { useState } from "react";
import WeatherView from "@/components/WeatherView";
import HistoryView from "@/components/HistoryView";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  return (
    <div className="space-y-8 animate-in fade-in duration-700 ease-out">
      
      {/* Tabs */}
      <div className="flex bg-gray-100/50 dark:bg-white/5 p-1 rounded-full w-full max-w-sm mx-auto border border-gray-200/50 dark:border-white/5 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
            activeTab === 'current'
              ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-white/5'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Current Weather
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
            activeTab === 'history'
              ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-white/5'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Historical Search
        </button>
      </div>

      {/* Content */}
      <div className="mt-8 transition-opacity duration-300">
        {activeTab === 'current' ? <WeatherView /> : <HistoryView />}
      </div>
      
    </div>
  );
}
