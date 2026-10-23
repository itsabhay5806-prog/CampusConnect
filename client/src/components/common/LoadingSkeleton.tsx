import React from 'react';

export const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="w-1/3 h-4 bg-slate-200 rounded" />
          <div className="w-1/4 h-3 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="space-y-2.5 mb-4">
        <div className="w-full h-4 bg-slate-200 rounded" />
        <div className="w-5/6 h-4 bg-slate-200 rounded" />
        <div className="w-2/3 h-4 bg-slate-100 rounded" />
      </div>
      <div className="flex gap-4 pt-3 border-t border-slate-100">
        <div className="w-16 h-6 bg-slate-100 rounded-lg" />
        <div className="w-16 h-6 bg-slate-100 rounded-lg" />
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card animate-pulse space-y-3">
      <div className="w-1/2 h-5 bg-slate-200 rounded" />
      <div className="w-full h-12 bg-slate-100 rounded" />
      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <div className="w-20 h-4 bg-slate-200 rounded" />
        <div className="w-16 h-7 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
};
