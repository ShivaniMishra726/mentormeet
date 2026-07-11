import React from 'react';
import { Calendar, Clock, XCircle } from 'lucide-react';

const TicketStub = ({
  title,
  subtitle,
  date,
  time,
  avatar,
  status,
  onAction,
  actionLabel = "Cancel Session",
  isLoading = false
}) => {
  // Map statuses to semantic design system colors
  let statusColorClass = 'bg-brandUnavailable';
  let statusText = 'Past';
  
  if (status === 'upcoming') {
    statusColorClass = 'bg-brandAvailable';
    statusText = 'Confirmed';
  } else if (status === 'cancelled') {
    statusColorClass = 'bg-brandBooked';
    statusText = 'Cancelled';
  }

  // Format date nicely (e.g., "Monday, Jul 7, 2026")
  const formatDate = (dateStr) => {
    try {
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      const d = new Date(dateStr + 'T00:00:00'); // Prevent timezone offset shift
      return d.toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="ticket-stub flex border border-slate-100 rounded-xl shadow-sm bg-brandSurface transition-all hover:shadow-md duration-300 relative pl-[32px] overflow-visible">
      {/* Left colored stub strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-[32px] rounded-l-xl flex items-center justify-center ${statusColorClass}`}>
        <span className="text-[10px] font-bold text-white uppercase tracking-widest origin-center -rotate-90 whitespace-nowrap">
          {statusText}
        </span>
      </div>

      {/* Perforation line */}
      <div className="absolute left-[32px] top-3 bottom-3 border-l border-dashed border-slate-200 -translate-x-1/2 z-10" />

      {/* Main Content Area */}
      <div className="flex-1 p-5 pl-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Entity Info (Mentor or Student) */}
        <div className="flex items-center gap-4">
          {avatar && (
            <img
              src={avatar}
              alt={title}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-50 shadow-inner"
            />
          )}
          <div className="flex flex-col">
            <h4 className="font-serif text-lg font-bold text-brandNavy leading-tight">{title}</h4>
            {subtitle && <p className="text-xs text-brandMuted mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Date and Time Details */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2 text-brandNavy">
            <Calendar className="w-4 h-4 text-brandAccent" />
            <span className="text-sm font-medium font-sans">{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-2 text-brandMuted">
            <Clock className="w-4 h-4 text-brandAccent" />
            <span className="text-xs font-mono font-medium tracking-tight bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
              {time}
            </span>
          </div>
        </div>

        {/* Action Button (e.g. Cancel Booking) */}
        <div>
          {status === 'upcoming' && onAction && (
            <button
              onClick={onAction}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 border border-brandBooked/30 text-brandBooked bg-white hover:bg-brandBooked hover:text-white rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-brandBooked border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              {actionLabel}
            </button>
          )}
          {status === 'cancelled' && (
            <span className="text-xs text-brandBooked font-medium bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
              Session Revoked
            </span>
          )}
          {status === 'past' && (
            <span className="text-xs text-brandMuted font-medium bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
              Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketStub;
