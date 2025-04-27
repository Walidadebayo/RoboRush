import React from 'react';

const RobotIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 rounded-full"></div>
      <div className="relative flex justify-center items-center h-64">
        {/*  robot illustration */}
        <div className="relative">
          {/* Robot head */}
          <div className="w-32 h-24 bg-slate-800 border-2 border-purple-400 rounded-2xl relative overflow-hidden">
            {/* Eyes */}
            <div className="absolute top-6 left-4 w-6 h-6 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="absolute top-6 right-4 w-6 h-6 bg-purple-400 rounded-full animate-pulse"></div>
            
            {/* Antenna */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-2 h-8 bg-slate-700 border border-purple-400">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-500 rounded-full animate-ping"></div>
            </div>
            
            {/* Mouth */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-slate-600 rounded-full"></div>
            
            {/* Tech pattern */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-2 right-2 w-8 h-1 bg-purple-300 opacity-60"></div>
              <div className="absolute top-4 right-2 w-4 h-1 bg-purple-300 opacity-60"></div>
              <div className="absolute bottom-2 left-2 w-6 h-1 bg-purple-300 opacity-60"></div>
            </div>
          </div>
          
          {/* Robot body */}
          <div className="w-40 h-28 mt-2 bg-slate-800 border-2 border-purple-400 rounded-lg relative overflow-hidden">
            {/* Body lights */}
            <div className="absolute top-4 left-4 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="absolute top-4 right-4 w-4 h-4 bg-purple-500 rounded-full animate-pulse delay-100"></div>
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-slate-700 rounded">
              <div className="grid grid-cols-3 gap-1 p-1">
                <div className="bg-purple-400 w-full h-1.5 rounded-full opacity-80"></div>
                <div className="bg-purple-400 w-full h-1.5 rounded-full opacity-60"></div>
                <div className="bg-purple-400 w-full h-1.5 rounded-full opacity-40"></div>
                <div className="bg-blue-500 w-full h-1.5 rounded-full opacity-60"></div>
                <div className="bg-blue-500 w-full h-1.5 rounded-full opacity-40"></div>
                <div className="bg-blue-500 w-full h-1.5 rounded-full opacity-80"></div>
              </div>
            </div>
          </div>
          
          {/* Arms */}
          <div className="absolute top-32 -left-8 w-6 h-16 bg-slate-700 border border-purple-400 rounded-full"></div>
          <div className="absolute top-32 -right-8 w-6 h-16 bg-slate-700 border border-purple-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default RobotIllustration;
