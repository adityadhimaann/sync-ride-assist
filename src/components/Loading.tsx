
import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-background">
      <img
        src="/assets/RideSync.gif"
        alt="Loading..."
        className="h-24 w-auto object-contain"
      />
    </div>
  );
};

export default Loading;
