'use client';

interface TabNavigationProps {
  activeTab: 'single' | 'bulk';
  onTabChange: (tab: 'single' | 'bulk') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="flex">
        <button
          onClick={() => onTabChange('single')}
          className={`
            flex-1 px-6 py-4 font-semibold text-sm transition-colors
            ${activeTab === 'single'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Single Verification
          </div>
          <p className="text-xs mt-1 opacity-80">Verify one label at a time</p>
        </button>
        
        <button
          onClick={() => onTabChange('bulk')}
          className={`
            flex-1 px-6 py-4 font-semibold text-sm transition-colors border-l border-gray-200
            ${activeTab === 'bulk'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Bulk Upload
            <span className="bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded text-xs font-bold">NEW</span>
          </div>
          <p className="text-xs mt-1 opacity-80">Verify up to 100 labels at once</p>
        </button>
      </div>
    </div>
  );
}

