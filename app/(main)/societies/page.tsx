import EventCard from "@/app/components/features/feed/EventCard";

const EVENTS = [
  {
    society: "Robotics Society",
    title: "Battle Bots: Semester Finals",
    description: "Registration closes at midnight!",
  },
  {
    society: "Music Club",
    title: "Open Mic Night",
    description: "Show your talent this Friday 🎤",
  },
];

export default function SocietiesPage() {
  return (
    <div className="flex flex-col gap-6">
      {EVENTS.map((event, index) => (
        <EventCard key={index} {...event} />
      ))}
    </div>
  );
}