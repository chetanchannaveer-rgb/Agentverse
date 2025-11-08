import StudyScheduleCard from '../StudyScheduleCard';

export default function StudyScheduleCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      <StudyScheduleCard
        id="schedule-1"
        topic="JavaScript Fundamentals"
        date="December 15, 2024"
        time="2:00 PM"
        duration="1 hour"
        status="upcoming"
        onComplete={() => console.log('Marked complete')}
        onDelete={() => console.log('Deleted')}
      />
      <StudyScheduleCard
        id="schedule-2"
        topic="React Hooks Deep Dive"
        date="December 14, 2024"
        time="10:00 AM"
        duration="2 hours"
        status="completed"
      />
      <StudyScheduleCard
        id="schedule-3"
        topic="Data Structures"
        date="December 13, 2024"
        time="3:00 PM"
        duration="1.5 hours"
        status="missed"
      />
    </div>
  );
}
