import React from "react";

export const AnnouncementBar: React.FC = () => {
  return (
    <aside
      aria-label="Promotional Announcement"
      className="bg-brand-primary text-white text-xs font-medium py-2 px-4 text-center tracking-wide"
    >
      <p>
        Free shipping across India on orders above ₹799 | 100% Authentic Handwoven Natural Fibers
      </p>
    </aside>
  );
};
