# Site Visit Planner - Calendar Implementation

## Overview
A fully-functional, interactive calendar system for the visit planner with multiple view modes, drag-and-drop rescheduling, and comprehensive filtering capabilities.

## Features Implemented

### 1. **Reusable Calendar Component** (`visit-calendar.tsx`)
- Professional month-view calendar with 7-day grid layout
- Auto-generated calendar days with proper month offset handling
- Color-coded visits (planned in blue, completed in green)
- Today indicator with amber highlighting
- Smooth transitions and hover effects

### 2. **Week View** (`week-view.tsx`)
- Alternative weekly schedule display
- Shows all 7 days with visit details
- Easy navigation between weeks
- Responsive grid layout

### 3. **Drag-and-Drop Rescheduling**
- Drag visits between calendar dates to reschedule
- Visual feedback during dragging (opacity change, scale effect)
- Drag source highlighting
- Disabled when planner is locked

### 4. **View Mode Toggle**
- Switch between Month and Week views
- State-based view management
- Separate navigation controls for each view

### 5. **Status Filtering**
- Filter by: All, Planned, Completed
- Button-based filter controls with visual indicators
- Color-coded filter buttons matching visit statuses
- Works seamlessly with both view modes

### 6. **Site Filtering**
- Dropdown selector for viewing specific sites
- "All Mapped Sites" option
- Filters calendar and statistics

### 7. **Enhanced UI/UX**
- Lock/Unlock planner state
- Export plan functionality
- Real-time statistics dashboard
- Visit edit and delete capabilities
- Comprehensive checklist sidebar
- Upcoming schedules quick view

## File Structure

```
components/operations/
├── visit-calendar.tsx      # Main month view calendar component
└── week-view.tsx           # Weekly schedule view component

app/visit-planner/
└── page.tsx                # Main planner page with state management
```

## Key Components & Props

### VisitCalendar Component
```typescript
interface VisitCalendarProps {
  currentDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  visits: CalendarVisit[]
  selectedSite: string
  onDateClick: (dateStr: string) => void
  onVisitMove?: (visitId: string, newDateStr: string) => void
  isLocked: boolean
}
```

### WeekView Component
```typescript
interface WeekViewProps {
  currentDate: Date
  onPrevWeek: () => void
  onNextWeek: () => void
  visits: CalendarVisit[]
  selectedSite: string
  isLocked: boolean
}
```

## Data Structure

```typescript
interface Visit {
  id: string
  siteId: string
  siteName: string
  dateStr: string              // Format: YYYY-MM-DD
  time: string                 // Format: HH:MM AM/PM
  status: 'planned' | 'completed'
}
```

## Usage Examples

### Adding a Visit
1. Unlock the planner (button in top-right)
2. Click on any date in the calendar
3. Fill in the site, date, and time
4. Click "Add Visit Schedule"

### Rescheduling a Visit
1. Ensure planner is unlocked
2. Drag a visit card to a new date
3. Release to confirm rescheduling
4. Visual feedback confirms the action

### Filtering Visits
1. Use site dropdown to filter by specific site
2. Use status buttons to show: All, Planned, or Completed visits
3. Filters apply to both views

### Switching Views
1. Click "Month" button for calendar month view
2. Click "Week" button for week view
3. Navigate using month/week arrows

## Features Breakdown

### Visual Indicators
- **Blue visits**: Planned audits
- **Green visits**: Completed audits
- **Amber border**: Today's date
- **Dashed border**: Drop zone during drag

### Interactive Elements
- Clickable calendar dates (when unlocked)
- Draggable visit cards (when unlocked)
- Hover effects on interactive elements
- Status filter buttons with color coding
- View mode toggle buttons

### Responsive Design
- Grid layouts that adapt to screen size
- Touch-friendly button sizes
- Overflow scrolling for visit lists
- Mobile-optimized spacing

## Customization Options

### Styling
- Colors can be customized via Tailwind classes
- Transitions and animations are smooth and configurable
- Dark mode compatible with existing theme

### Data
- Visit data is managed in component state
- Easy to integrate with backend APIs
- Supports real-time updates

### Functionality
- Add more views (day, agenda, etc.)
- Customize filtering options
- Add notifications/reminders
- Integrate with other systems

## Known Limitations
- Drag-and-drop is disabled when planner is locked
- Filters are client-side only (no server persistence)
- Week navigation resets month reference

## Future Enhancements
- Drag-and-drop visit edit modal
- Time slot picker for new visits
- Visit analytics dashboard
- Email notifications for scheduled audits
- Calendar export to iCal format
- Mobile app integration
- Team collaboration features
