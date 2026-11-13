import React from 'react';
import { ResumeData } from '../../types/resumeBuilder';
import { ModernTemplate } from './templates/ModernTemplate';
import { ExecutiveTemplate } from './templates/ExecutiveTemplate';
import { MinimalistTemplate } from './templates/MinimalistTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { TwoColumnTemplate } from './templates/TwoColumnTemplate';
import { HarvardTemplate } from './templates/HarvardTemplate';
import { StartupTemplate } from './templates/StartupTemplate';
import { NordicTemplate } from './templates/NordicTemplate';
import { TimelineTemplate } from './templates/TimelineTemplate';
import { IndianTechTemplate } from './templates/IndianTechTemplate';

interface ResumePreviewProps {
  data: ResumeData;
  scale?: number;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, scale = 1 }) => {
  const renderTemplate = () => {
    switch (data.templateId) {
      case 'modern':
        return <ModernTemplate data={data} />;
      case 'executive':
        return <ExecutiveTemplate data={data} />;
      case 'minimalist':
        return <MinimalistTemplate data={data} />;
      case 'creative':
        return <CreativeTemplate data={data} />;
      case 'two-column':
        return <TwoColumnTemplate data={data} />;
      case 'harvard':
        return <HarvardTemplate data={data} />;
      case 'startup':
        return <StartupTemplate data={data} />;
      case 'nordic':
        return <NordicTemplate data={data} />;
      case 'timeline':
        return <TimelineTemplate data={data} />;
      case 'indian-tech':
        return <IndianTechTemplate data={data} />;
      default:
        return <ModernTemplate data={data} />;
    }
  };

  return (
    <div className="w-full flex justify-center py-4 overflow-x-auto">
      {/* Print media styles injected */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide everything outside resume */
          body * {
            visibility: hidden !important;
          }
          #resume-print-area, #resume-print-area * {
            visibility: visible !important;
          }
          #resume-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* A4 Resume Sheet Container */}
      <div
        id="resume-print-area"
        style={{
          width: '210mm',
          minHeight: '297mm',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
        className="bg-white shadow-2xl rounded-sm border border-slate-200 transition-all text-slate-800"
      >
        {renderTemplate()}
      </div>
    </div>
  );
};

