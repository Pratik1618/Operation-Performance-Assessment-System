import { AssessmentActivity } from '@/lib/types';

interface ComplianceWidgetProps {
  activities: AssessmentActivity[];
}

export function ComplianceWidget({ activities }: ComplianceWidgetProps) {
  const totalActivities = activities.length;
  const completedActivities = activities.filter(a => ['achieved', 'approved'].includes(a.status)).length;
  const pendingActivities = activities.filter(a => a.status === 'pending').length;
  const overdueActivities = activities.filter(a => a.status === 'pending' && new Date(a.dueDate) < new Date()).length;
  
  // Calculate weighted compliance score
  const totalWeightage = activities.reduce((sum, a) => sum + a.weightage, 0);
  const completedWeightage = activities
    .filter(a => ['achieved', 'approved'].includes(a.status))
    .reduce((sum, a) => sum + a.weightage, 0);
  const compliancePercent = totalWeightage > 0 ? Math.round((completedWeightage / totalWeightage) * 100) : 0;

  // Calculate average score
  const ratedActivities = activities.filter(a => a.rating > 0);
  const avgScore = ratedActivities.length > 0 ? (ratedActivities.reduce((sum, a) => sum + a.rating, 0) / ratedActivities.length).toFixed(1) : '0.0';

  const widgets = [
    { label: 'Total Activities', value: totalActivities, color: 'text-blue-600' },
    { label: 'Completed', value: completedActivities, color: 'text-green-600' },
    { label: 'Pending', value: pendingActivities, color: 'text-orange-600' },
    { label: 'Overdue', value: overdueActivities, color: 'text-red-600' },
    { label: 'Performance %', value: `${compliancePercent}%`, color: 'text-indigo-600' },
    { label: 'Avg Score', value: avgScore, color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {widgets.map((widget) => (
        <div key={widget.label} className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm font-medium mb-2">{widget.label}</p>
          <p className={`text-2xl font-bold ${widget.color}`}>{widget.value}</p>
        </div>
      ))}
    </div>
  );
}
