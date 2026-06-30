import { useState } from "react";
import { IconChevron } from "./Icons";

export default function CollapsibleSection({
  title,
  badge,
  defaultOpen = false,
  headerAction,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`collapsible${open ? " collapsible--open" : ""}`}>
      <div className="collapsible__header">
        <button
          type="button"
          className="collapsible__trigger"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          <IconChevron size={16} className="collapsible__chevron" />
          <span className="collapsible__title">{title}</span>
          {badge != null && <span className="collapsible__badge">{badge}</span>}
        </button>
        {headerAction && (
          <div className="collapsible__header-action" onClick={(e) => e.stopPropagation()}>
            {headerAction}
          </div>
        )}
      </div>
      <div className="collapsible__panel" hidden={!open}>
        {children}
      </div>
    </section>
  );
}
