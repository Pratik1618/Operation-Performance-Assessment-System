'use client';

import { AssessmentActivity } from '@/lib/types';
import { useState } from 'react';
import { ChevronDown, FileText, Image, FileVideo, Download, Trash2, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EvidenceGalleryProps {
  activities: AssessmentActivity[];
}

interface EvidenceFile {
  name: string;
  type: 'pdf' | 'image' | 'video' | 'document' | 'archive';
  size: string;
  uploadedDate: string;
}

const mockEvidenceFiles = {
  'ASS_001_OPS_001': [
    { name: 'absent_report_daily.pdf', type: 'pdf', size: '245 KB', uploadedDate: '2025-05-04' },
    { name: 'attendance_screenshot.jpg', type: 'image', size: '1.2 MB', uploadedDate: '2025-05-04' },
    { name: 'report_summary.docx', type: 'document', size: '156 KB', uploadedDate: '2025-05-04' },
  ],
  'ASS_001_OPS_003': [
    { name: 'site_visit_photos.zip', type: 'archive', size: '5.3 MB', uploadedDate: '2025-05-07' },
    { name: 'visit_report.pdf', type: 'pdf', size: '892 KB', uploadedDate: '2025-05-07' },
    { name: 'client_feedback.txt', type: 'document', size: '45 KB', uploadedDate: '2025-05-07' },
    { name: 'visit_video.mp4', type: 'video', size: '12.5 MB', uploadedDate: '2025-05-07' },
  ],
} satisfies Record<string, EvidenceFile[]>;

const fileIcons: Record<EvidenceFile['type'], LucideIcon> = {
  pdf: FileText,
  image: Image,
  video: FileVideo,
  document: FileText,
  archive: FileText,
};

interface EvidenceGalleryProps {
  activities: AssessmentActivity[];
  customEvidenceFiles?: Record<string, EvidenceFile[]>;
  onDeleteEvidence?: (activityId: string, fileName: string) => void;
}

export function EvidenceGallery({ activities, customEvidenceFiles, onDeleteEvidence }: EvidenceGalleryProps) {
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  const activitiesWithEvidence = activities.filter(a => a.evidenceCount > 0);

  if (activitiesWithEvidence.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground bg-white/70">
        <p className="text-sm font-semibold">No evidence files uploaded yet for this scorecard.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="p-4 border-b border-border bg-muted/20">
        <CardTitle className="font-bold text-lg text-foreground">Evidence Gallery</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">{activitiesWithEvidence.length} activities with evidence</CardDescription>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border">
        {activitiesWithEvidence.map(activity => {
          const files = (customEvidenceFiles && customEvidenceFiles[activity.id]) || 
                        mockEvidenceFiles[activity.id as keyof typeof mockEvidenceFiles] || [];
          
          return (
            <div key={activity.id}>
              <button
                onClick={() => setExpandedActivityId(expandedActivityId === activity.id ? null : activity.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    {files.length}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground text-sm leading-snug">{activity.activityName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{files.length} file(s)</p>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-muted-foreground transition-transform ${
                    expandedActivityId === activity.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedActivityId === activity.id && (
                <div className="px-4 py-4 bg-muted/20 border-t border-border">
                  <div className="space-y-2">
                    {files.map((file, idx) => {
                      const IconComponent = fileIcons[file.type] || FileText;
                      return (
                        <Card key={idx} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <IconComponent size={20} className="text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-foreground truncate">{file.name}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{file.size} • {file.uploadedDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 text-muted-foreground" title="Download">
                              <Download size={14} />
                            </Button>
                            {onDeleteEvidence && (
                              <Button 
                                onClick={() => onDeleteEvidence(activity.id, file.name)}
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 hover:bg-red-100 hover:text-red-600 text-muted-foreground" 
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
