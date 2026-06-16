import React from 'react';

const AI_ACTUAL_LINK = 'https://ai.internx.io'; // Store the actual link

const AIService: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white" style={{ zIndex: 1000 }}>
      <iframe
        src={AI_ACTUAL_LINK} // Use the variable instead of hardcoded URL
        width="100%"
        height="100%"
        style={{ 
          width: '100vw',
          height: '100vh',
          border: 'none',
          margin: 0,
          padding: 0,
          display: 'block',
          backgroundColor: 'white'
        }}
        title="InternX AI"
        allow="camera; microphone; clipboard-read; clipboard-write; fullscreen"
      />
    </div>
  );
};

export default AIService;
