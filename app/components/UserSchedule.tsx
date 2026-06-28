// app/components/UserSchedule.tsx
export default function UserSchedule() {
    return (
    <div className="w-full h-[700px]">
        <iframe
        src="https://calendar.google.com/calendar/embed?src=primary&ctz=Asia/Tokyo"
        style={{ border: 0 }}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        ></iframe>
    </div>
    );
}
