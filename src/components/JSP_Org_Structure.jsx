import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const RELATIONSHIP_TYPES = {
  administrative: { color: "#90226C", label: "Administrative Oversight", dash: "",          desc: "Formal reporting relationship — who you ultimately answer to" },
  functional:     { color: "#F3755E", label: "Functional Direction",     dash: "6,3",       desc: "Day-to-day work direction and area-specific supervision" },
  coaching:       { color: "#FABE3D", label: "Coaching & Development",   dash: "3,3",       desc: "Professional growth, EIP, and developmental support (DSIC)" },
  project:        { color: "#6A453A", label: "Project Oversight",        dash: "8,4,2,4",   desc: "Work direction within a specific project scope" },
};

const PRESET_COLORS = [
  "#0B0909", "#E0944A", "#F3755E", "#FABE3D", "#90226C",
  "#6A453A", "#5A2051", "#1A7895", "#0F6E56", "#1F1D1C",
];

const DEFAULT_DATA = {
  roles: {
    president:    { x: 400, y: 68,  label: "President",       fullLabel: null, color: "#0B0909", textColor: "#ffffff", r: 44, desc: "Final administrative authority over all Directors and the organization" },
    evp:          { x: 400, y: 180, label: "EVP",             fullLabel: null, color: "#E0944A", textColor: "#0B0909", r: 38, desc: "Oversees day-to-day organizational operations; Directors work functionally with the EVP" },
    dii:          { x: 215, y: 340, label: "DII",             fullLabel: "Director of\nImpact &\nInnovation",       color: "#F3755E", textColor: "#ffffff", r: 48, desc: "Administrative & functional oversight of program staff; resolves cross-project conflicts" },
    dsic:         { x: 585, y: 260, label: "DSIC",            fullLabel: "Director of\nStaff Investment\n& Curiosity", color: "#FABE3D", textColor: "#0B0909", r: 48, desc: "Coaches all staff across the organization; owns EIP process and professional development" },
    dis:          { x: 585, y: 440, label: "DIS",             fullLabel: "Director of\nInfluence &\nStorytelling",  color: "#90226C", textColor: "#ffffff", r: 48, desc: "Administrative & functional oversight of communications staff" },
    dfa:          { x: 215, y: 500, label: "DFA",             fullLabel: "Director of\nFinance &\nAdministration",  color: "#6A453A", textColor: "#ffffff", r: 48, desc: "Administrative & functional oversight of admin team staff" },
    projectLead:  { x: 400, y: 510, label: "Project\nLeads",  fullLabel: null, color: "#5A2051", textColor: "#ffffff", r: 36, desc: "Oversee work and day-to-day function within their project; handle project-level conflicts" },
    staffProjects: { x: 400, y: 370, label: "Staff &\nProjects", fullLabel: null, color: "#5A2051", textColor: "#ffffff", r: 62, desc: "All staff and project teams within JSP", isCenterZone: true },
  },
  connections: [
    { from: "president",   to: "evp",         type: "administrative" },
    { from: "president",   to: "dii",         type: "administrative" },
    { from: "president",   to: "dsic",        type: "administrative" },
    { from: "president",   to: "dis",         type: "administrative" },
    { from: "president",   to: "dfa",         type: "administrative" },
    { from: "evp",         to: "dii",         type: "functional" },
    { from: "evp",         to: "dsic",        type: "functional" },
    { from: "evp",         to: "dis",         type: "functional" },
    { from: "evp",         to: "dfa",         type: "functional" },
    { from: "dsic",        to: "dii",         type: "coaching",  label: "coaches staff" },
    { from: "dsic",        to: "dis",         type: "coaching",  label: "coaches staff" },
    { from: "dsic",        to: "dfa",         type: "coaching",  label: "coaches staff" },
    { from: "dii",         to: "projectLead", type: "functional" },
    { from: "projectLead", to: "dii",         type: "project",   label: "escalates" },
  ],
  footer_text: "All staff ultimately work for the President and the Executive Vice President",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function Input({ value, onChange, placeholder, style = {}, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "7px 10px", borderRadius: "7px",
        border: "1px solid #D4D0C4", fontSize: "12px", background: "#FAFAF7",
        color: "#1F1D1C", outline: "none", boxSizing: "border-box", ...style,
      }}
    />
  );
}

function Textarea({ value, onChange, rows = 3, placeholder }) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "7px 10px", borderRadius: "7px",
        border: "1px solid #D4D0C4", fontSize: "12px", background: "#FAFAF7",
        color: "#1F1D1C", resize: "vertical", outline: "none", boxSizing: "border-box",
        fontFamily: "inherit",
      }}
    />
  );
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "#9C8878", marginBottom: "4px" }}>
      {children}
    </div>
  );
}

function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
      {PRESET_COLORS.map(c => (
        <button key={c} onClick={() => onChange(c)} style={{
          width: "22px", height: "22px", borderRadius: "50%", background: c, border: value === c ? "2px solid #FABE3D" : "2px solid transparent",
          cursor: "pointer", padding: 0, flexShrink: 0,
          boxShadow: value === c ? "0 0 0 2px #fff, 0 0 0 4px #FABE3D" : "none",
        }} />
      ))}
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "28px", height: "28px", padding: "1px", borderRadius: "6px", border: "1px solid #D4D0C4", cursor: "pointer", background: "none" }}
      />
    </div>
  );
}

// ── Role editor panel ─────────────────────────────────────────────────────────
function RoleEditor({ roleKey, role, onChange, onDelete, roleKeys }) {
  const [open, setOpen] = useState(false);
  const set = (k, v) => onChange({ ...role, [k]: v });

  return (
    <div style={{ border: "1px solid #E4E2D6", borderRadius: "10px", overflow: "hidden", marginBottom: "8px" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#fff", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: role.color, flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: "12px", fontWeight: 700, color: "#1F1D1C" }}>
          {role.label.replace(/\n/g, " ")}
          {(role.subtitle || (!role.isCenterZone)) && (
            <span style={{ fontWeight: 400, color: "#9C8878", fontSize: "11px" }}>
              {" "}({role.subtitle || roleKey})
            </span>
          )}
          {role.isCenterZone && <span style={{ marginLeft: "6px", fontSize: "9px", fontWeight: 700, background: "#F2F1E9", color: "#6A453A", borderRadius: "4px", padding: "1px 5px", letterSpacing: ".04em" }}>ZONE</span>}
        </div>
        <div style={{ fontSize: "16px", color: "#9C8878", lineHeight: 1 }}>{open ? "▴" : "▾"}</div>
      </div>

      {open && (
        <div style={{ padding: "14px", borderTop: "1px solid #F0EFE7", background: "#FAFAF7", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <FieldLabel>Short label (SVG)</FieldLabel>
              <Textarea value={role.label} onChange={v => set("label", v)} rows={2} placeholder="Label shown in circle" />
              <div style={{ fontSize: "10px", color: "#9C8878", marginTop: "3px" }}>Use \n for line breaks</div>
            </div>
            <div>
              <FieldLabel>Full title (tooltip)</FieldLabel>
              <Textarea value={role.fullLabel || ""} onChange={v => set("fullLabel", v || null)} rows={2} placeholder="Optional expanded name" />
            </div>
          </div>

          <div>
            <FieldLabel>Subtitle {role.isCenterZone ? "(shown in parentheses & inside circle)" : "(shown in parentheses in editor)"}</FieldLabel>
            <Input value={role.subtitle || ""} onChange={v => set("subtitle", v || undefined)} placeholder={role.isCenterZone ? "e.g. All Staff & Project Teams" : "Optional label override"} />
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <Textarea value={role.desc} onChange={v => set("desc", v)} rows={2} placeholder="Role description shown on hover" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
            <div>
              <FieldLabel>X position</FieldLabel>
              <Input type="number" value={role.x} onChange={v => set("x", parseInt(v) || 0)} />
            </div>
            <div>
              <FieldLabel>Y position</FieldLabel>
              <Input type="number" value={role.y} onChange={v => set("y", parseInt(v) || 0)} />
            </div>
            <div>
              <FieldLabel>Radius</FieldLabel>
              <Input type="number" value={role.r} onChange={v => set("r", parseInt(v) || 30)} />
            </div>
            <div>
              <FieldLabel>Text color</FieldLabel>
              <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                {["#ffffff", "#0B0909"].map(c => (
                  <button key={c} onClick={() => set("textColor", c)} style={{
                    flex: 1, padding: "5px", borderRadius: "6px", fontSize: "11px", fontWeight: 700,
                    background: c, color: c === "#ffffff" ? "#0B0909" : "#ffffff",
                    border: role.textColor === c ? "2px solid #FABE3D" : "2px solid #D4D0C4",
                    cursor: "pointer",
                  }}>
                    {c === "#ffffff" ? "Light" : "Dark"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <FieldLabel>Circle color</FieldLabel>
            <ColorPicker value={role.color} onChange={v => set("color", v)} />
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" checked={!!role.isCenterZone} onChange={e => set("isCenterZone", e.target.checked || undefined)} />
              <span style={{ fontSize: "12px", color: "#1F1D1C", fontWeight: 600 }}>Center zone</span>
              <span style={{ fontSize: "11px", color: "#9C8878" }}>— renders as a transparent background area (can still receive arrows)</span>
            </label>
          </div>

          {roleKeys.length > 1 && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={onDelete} style={{
                padding: "5px 14px", borderRadius: "7px", border: "1px solid #F3755E", background: "#FFF5F3",
                color: "#C4361E", fontSize: "11px", fontWeight: 700, cursor: "pointer",
              }}>Remove role</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Connection editor ─────────────────────────────────────────────────────────
function ConnectionEditor({ connections, onChange, roleKeys, roles }) {
  const addConn = () => {
    const first = roleKeys[0] || "";
    const second = roleKeys[1] || first;
    onChange([...connections, { from: first, to: second, type: "administrative", label: "" }]);
  };
  const removeConn = i => onChange(connections.filter((_, j) => j !== i));
  const updateConn = (i, field, val) => onChange(connections.map((c, j) => j === i ? { ...c, [field]: val } : c));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <FieldLabel>Connections ({connections.length})</FieldLabel>
        <button onClick={addConn} style={{ padding: "4px 12px", borderRadius: "6px", border: "1px solid #D4D0C4", background: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer", color: "#1F1D1C" }}>
          + Add
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "6px", padding: "0 10px", marginBottom: "2px" }}>
        <div style={{ fontSize: "9px", fontWeight: 700, color: "#9C8878", letterSpacing: ".06em", textTransform: "uppercase" }}>FROM (tail)</div>
        <div style={{ fontSize: "9px", fontWeight: 700, color: "#9C8878", letterSpacing: ".06em", textTransform: "uppercase" }}>TO (arrowhead)</div>
        <div style={{ fontSize: "9px", fontWeight: 700, color: "#9C8878", letterSpacing: ".06em", textTransform: "uppercase" }}>Type</div>
        <div style={{ fontSize: "9px", fontWeight: 700, color: "#9C8878", letterSpacing: ".06em", textTransform: "uppercase" }}>Label</div>
        <div />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {connections.map((conn, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "6px", alignItems: "center", padding: "8px 10px", background: "#fff", borderRadius: "8px", border: "1px solid #E4E2D6" }}>
            <select value={conn.from} onChange={e => updateConn(i, "from", e.target.value)}
              style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #D4D0C4", fontSize: "11px", background: "#FAFAF7", color: "#1F1D1C" }}>
              {roleKeys.map(k => <option key={k} value={k}>{roles?.[k]?.label?.replace(/\n/g, " ") || k}</option>)}
            </select>
            <select value={conn.to} onChange={e => updateConn(i, "to", e.target.value)}
              style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #D4D0C4", fontSize: "11px", background: "#FAFAF7", color: "#1F1D1C" }}>
              {roleKeys.map(k => <option key={k} value={k}>{roles?.[k]?.label?.replace(/\n/g, " ") || k}</option>)}
            </select>
            <select value={conn.type} onChange={e => updateConn(i, "type", e.target.value)}
              style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #D4D0C4", fontSize: "11px", background: "#FAFAF7", color: "#1F1D1C" }}>
              {Object.keys(RELATIONSHIP_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <Input value={conn.label || ""} onChange={v => updateConn(i, "label", v)} placeholder="Label (opt.)" />
            <button onClick={() => removeConn(i)} style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #F3755E", background: "#FFF5F3", color: "#C4361E", fontSize: "14px", lineHeight: 1, cursor: "pointer" }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main chart view ───────────────────────────────────────────────────────────
function ChartView({ roles, connections, footer_text }) {
  const [activeLayer, setActiveLayer] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);
  const cx = 400;

  const opacity = (type) => {
    if (!activeLayer) return 0.7;
    return activeLayer === type ? 1 : 0.08;
  };

  const roleOpacity = (roleKey) => {
    if (!activeLayer) return 1;
    const relevant = connections.filter(c => c.type === activeLayer);
    const involvedRoles = new Set();
    relevant.forEach(c => { involvedRoles.add(c.from); involvedRoles.add(c.to); });
    return involvedRoles.has(roleKey) ? 1 : 0.15;
  };

  const hoveredData = hoveredRole ? roles[hoveredRole] : null;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Filter bar */}
      <div style={{ padding: "14px 24px", background: "#fff", borderBottom: "1px solid #F2F1E9", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "#6A453A", fontWeight: 700, marginRight: "4px", letterSpacing: ".05em" }}>SHOW:</span>
        <button onClick={() => setActiveLayer(null)} style={{
          padding: "4px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
          background: !activeLayer ? "#1F1D1C" : "#F2F1E9", color: !activeLayer ? "#fff" : "#1F1D1C", border: "none",
        }}>All Layers</button>
        {Object.entries(RELATIONSHIP_TYPES).map(([key, { color, label }]) => (
          <button key={key} onClick={() => setActiveLayer(activeLayer === key ? null : key)} style={{
            padding: "4px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
            background: activeLayer === key ? color : "#F2F1E9",
            color: activeLayer === key ? (key === "coaching" ? "#0B0909" : "#fff") : "#1F1D1C",
            border: activeLayer === key ? "none" : "1px solid #e1e0d2",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span style={{ width: "12px", height: "3px", background: color, borderRadius: "2px", display: "inline-block" }} />
            {label}
          </button>
        ))}
      </div>

      {/* SVG */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px 16px 0" }}>
        <svg viewBox="0 0 800 640" style={{ maxWidth: "680px", width: "100%" }}>
          <defs>
            <filter id="orgShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.12" />
            </filter>
            <filter id="orgGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodOpacity="0.25" />
            </filter>
            {Object.entries(RELATIONSHIP_TYPES).map(([key, { color }]) => (
              <marker key={key} id={`arrow-${key}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
              </marker>
            ))}
          </defs>

          <circle cx={cx} cy={380} r="230" fill="none" stroke="#F2F1E9" strokeWidth="1.5" strokeDasharray="4,4" opacity={activeLayer ? 0.3 : 0.6} />
          <circle cx={cx} cy={380} r="140" fill="none" stroke="#F2F1E9" strokeWidth="1.5" strokeDasharray="4,4" opacity={activeLayer ? 0.3 : 0.6} />

          {/* Center-zone roles drawn first (behind everything) */}
          {Object.entries(roles).filter(([, r]) => r.isCenterZone).map(([key, role]) => {
            const isHovered = hoveredRole === key;
            const lines = (role.label || "").split("\n");
            const baseOpacity = roleOpacity(key);
            return (
              <g key={key} opacity={baseOpacity}
                onMouseEnter={() => setHoveredRole(key)}
                onMouseLeave={() => setHoveredRole(null)}
                style={{ cursor: "pointer", transition: "opacity 0.3s" }}
              >
                <circle cx={role.x} cy={role.y} r={role.r + (isHovered ? 4 : 0)}
                  fill={role.color} fillOpacity={isHovered ? 0.18 : 0.1}
                  stroke={role.color} strokeWidth="1.5" strokeDasharray="4,3" strokeOpacity={isHovered ? 0.7 : 0.35}
                  style={{ transition: "all 0.2s" }} />
                {lines.map((line, li) => (
                  <text key={li} x={role.x} y={role.y - ((lines.length - 1) * 6) + li * 13 - (role.subtitle ? 8 : 0)}
                    textAnchor="middle" dominantBaseline="central"
                    fill={role.color} fontSize="10"
                    fontWeight="700" fontFamily="DM Sans" letterSpacing="1"
                    opacity={isHovered ? 0.9 : 0.5}
                  >{line.toUpperCase()}</text>
                ))}
                {role.subtitle && (
                  <text x={role.x} y={role.y + (lines.length * 7)}
                    textAnchor="middle" dominantBaseline="central"
                    fill={role.color} fontSize="7.5"
                    fontWeight="400" fontFamily="DM Sans"
                    opacity={isHovered ? 0.7 : 0.38}
                  >{role.subtitle}</text>
                )}
              </g>
            );
          })}

          {connections.map((conn, i) => {
            const from = roles[conn.from];
            const to = roles[conn.to];
            if (!from || !to) return null;
            const rel = RELATIONSHIP_TYPES[conn.type];
            if (!rel) return null;
            const dx = to.x - from.x, dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) return null;
            const nx = dx / dist, ny = dy / dist;

            // When circles overlap, route the arrow around the outside using
            // a large arc that exits and enters each circle from the side.
            const overlapping = dist < (from.r + to.r);
            let pathD;
            if (overlapping) {
              // Perpendicular offset to route arrow outside both circles
              const perpX = -ny;
              const perpY = nx;
              const offset = Math.max(from.r, to.r) + 24;
              const ax = from.x + perpX * offset;
              const ay = from.y + perpY * offset;
              const bx = to.x + perpX * offset;
              const by = to.y + perpY * offset;
              // Entry/exit points on each circle along the arc direction
              const ex1 = from.x + perpX * (from.r + 4);
              const ey1 = from.y + perpY * (from.r + 4);
              const ex2 = to.x + perpX * (to.r + 4);
              const ey2 = to.y + perpY * (to.r + 4);
              pathD = `M ${ex1} ${ey1} C ${ax} ${ay} ${bx} ${by} ${ex2} ${ey2}`;
            } else {
              const x1 = from.x + nx * (from.r + 4);
              const y1 = from.y + ny * (from.r + 4);
              const x2 = to.x - nx * (to.r + 4);
              const y2 = to.y - ny * (to.r + 4);
              const midX = (x1 + x2) / 2 + (-ny * 30);
              const midY = (y1 + y2) / 2 + (nx * 30);
              pathD = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
            }

            return (
              <g key={i} opacity={opacity(conn.type)}>
                <path d={pathD}
                  fill="none" stroke={rel.color} strokeWidth="2.5"
                  strokeDasharray={rel.dash} markerEnd={`url(#arrow-${conn.type})`} />
              </g>
            );
          })}

          {/* Regular roles drawn on top */}
          {Object.entries(roles).filter(([, r]) => !r.isCenterZone).map(([key, role]) => {
            const isHovered = hoveredRole === key;
            const lines = (role.fullLabel || role.label || "").split("\n");
            return (
              <g key={key} opacity={roleOpacity(key)}
                onMouseEnter={() => setHoveredRole(key)}
                onMouseLeave={() => setHoveredRole(null)}
                style={{ cursor: "pointer", transition: "opacity 0.3s" }}
              >
                <circle cx={role.x} cy={role.y} r={role.r + (isHovered ? 4 : 0)}
                  fill={role.color} filter={isHovered ? "url(#orgGlow)" : "url(#orgShadow)"}
                  style={{ transition: "all 0.2s" }} />
                {lines.map((line, li) => (
                  <text key={li} x={role.x} y={role.y - ((lines.length - 1) * 6) + li * 13}
                    textAnchor="middle" dominantBaseline="central"
                    fill={role.textColor || "#fff"}
                    fontSize={lines.length > 2 ? "9" : lines.length > 1 ? "10" : "13"}
                    fontWeight="700" fontFamily="DM Sans"
                  >{line}</text>
                ))}
              </g>
            );
          })}

          <text x={cx} y={620} textAnchor="middle" fill="#6A453A" fontSize="10" fontFamily="DM Sans" opacity="0.5">{footer_text}</text>
        </svg>
      </div>

      {/* Hover card */}
      {hoveredData && (
        <div style={{
          margin: "-4px auto 0", maxWidth: "500px", padding: "14px 20px",
          background: "#fff", borderRadius: "12px", boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
          border: `2px solid ${hoveredData.color}30`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{
              background: hoveredData.color, color: hoveredData.textColor || "#fff",
              padding: "3px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
            }}>{hoveredData.label.replace(/\n/g, " ")}</span>
            {hoveredData.fullLabel && (
              <span style={{ fontSize: "12px", color: "#6A453A" }}>{hoveredData.fullLabel.replace(/\n/g, " ")}</span>
            )}
          </div>
          <p style={{ fontSize: "12px", color: "#0B0909", margin: 0, lineHeight: 1.5, opacity: 0.8 }}>{hoveredData.desc}</p>
        </div>
      )}

      {/* Legend */}
      <div style={{ padding: "20px 24px 32px", maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ background: "#fff", borderRadius: "10px", padding: "16px 20px", border: "1px solid #F2F1E9" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#90226C", marginBottom: "10px", letterSpacing: "1px" }}>RELATIONSHIP TYPES</div>
          {Object.entries(RELATIONSHIP_TYPES).map(([key, { color, label, dash, desc }]) => (
            <div key={key} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px" }}>
              <svg width="28" height="14" style={{ flexShrink: 0, marginTop: "2px" }}>
                <line x1="0" y1="7" x2="28" y2="7" stroke={color} strokeWidth="3" strokeDasharray={dash || "none"} />
              </svg>
              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#0B0909" }}>{label}</span>
                <span style={{ fontSize: "11px", color: "#6A453A", marginLeft: "6px", opacity: 0.8 }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Edit panel ────────────────────────────────────────────────────────────────
function EditPanel({ draft, setDraft, onSave, onCancel, saving }) {
  const roleKeys = Object.keys(draft.roles);

  const updateRole = useCallback((key, val) => {
    setDraft(d => ({ ...d, roles: { ...d.roles, [key]: val } }));
  }, [setDraft]);

  const deleteRole = useCallback((key) => {
    setDraft(d => {
      const newRoles = { ...d.roles };
      delete newRoles[key];
      const newConns = d.connections.filter(c => c.from !== key && c.to !== key);
      return { ...d, roles: newRoles, connections: newConns };
    });
  }, [setDraft]);

  const addRole = () => {
    const key = `role_${Date.now()}`;
    setDraft(d => ({
      ...d,
      roles: {
        ...d.roles,
        [key]: { x: 400, y: 300, label: "New Role", fullLabel: null, color: "#1A7895", textColor: "#ffffff", r: 40, desc: "" },
      },
    }));
  };

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Footer text */}
      <div>
        <FieldLabel>Footer caption</FieldLabel>
        <Input value={draft.footer_text} onChange={v => setDraft(d => ({ ...d, footer_text: v }))} placeholder="Caption beneath the chart" />
      </div>

      {/* Roles */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <FieldLabel>Roles ({roleKeys.length})</FieldLabel>
          <button onClick={addRole} style={{ padding: "4px 12px", borderRadius: "6px", border: "1px solid #D4D0C4", background: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer", color: "#1F1D1C" }}>
            + Add role
          </button>
        </div>
        {roleKeys.map(key => (
          <RoleEditor
            key={key}
            roleKey={key}
            role={draft.roles[key]}
            onChange={val => updateRole(key, val)}
            onDelete={() => deleteRole(key)}
            roleKeys={roleKeys}
          />
        ))}
      </div>

      {/* Connections */}
      <ConnectionEditor
        connections={draft.connections}
        onChange={conns => setDraft(d => ({ ...d, connections: conns }))}
        roleKeys={roleKeys}
        roles={draft.roles}
      />

      {/* Save / Cancel */}
      <div style={{ display: "flex", gap: "8px", paddingTop: "8px", borderTop: "1px solid #E4E2D6" }}>
        <button onClick={onSave} disabled={saving} style={{
          flex: 1, padding: "10px", borderRadius: "8px", border: "none",
          background: saving ? "#9C8878" : "#1F1D1C", color: "#FABE3D",
          fontSize: "13px", fontWeight: 700, cursor: saving ? "default" : "pointer", fontFamily: "inherit",
        }}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button onClick={onCancel} style={{
          padding: "10px 20px", borderRadius: "8px", border: "1px solid #D4D0C4",
          background: "#fff", color: "#1F1D1C", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function OrgChart() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin" || profile?.role === "executive" || profile?.role === "jsp_admin";

  const [data, setData] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    supabase.from("org_chart_data").select("*").limit(1).maybeSingle().then(({ data: row, error }) => {
      if (error || !row) {
        setData(DEFAULT_DATA);
      } else {
        setRecordId(row.id);
        setData({ roles: row.roles, connections: row.connections, footer_text: row.footer_text });
      }
      setLoading(false);
    });
  }, []);

  const openEdit = () => {
    setDraft(JSON.parse(JSON.stringify(data)));
    setSaveError(null);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setDraft(null);
    setSaveError(null);
  };

  const saveEdit = async () => {
    setSaving(true);
    setSaveError(null);
    const payload = { roles: draft.roles, connections: draft.connections, footer_text: draft.footer_text, updated_at: new Date().toISOString() };
    let error;
    if (recordId) {
      ({ error } = await supabase.from("org_chart_data").update(payload).eq("id", recordId));
    } else {
      const { data: inserted, error: ie } = await supabase.from("org_chart_data").insert(payload).select("id").single();
      error = ie;
      if (inserted) setRecordId(inserted.id);
    }
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    setData(draft);
    setEditMode(false);
    setDraft(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", fontFamily: "inherit", color: "#9C8878", fontSize: "13px" }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0B0909 0%, #2f1d1a 50%, #5A2051 100%)", padding: "22px 28px 18px", color: "#fff", position: "relative" }}>
        <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#FABE3D", marginBottom: "5px", fontWeight: 600 }}>Justice System Partners</div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>Organizational Structure</h1>
        <p style={{ fontSize: "12px", opacity: 0.5, margin: "3px 0 0" }}>Layered oversight model — hover roles for details</p>
        {isAdmin && !editMode && (
          <button onClick={openEdit} style={{
            position: "absolute", top: "20px", right: "20px",
            padding: "6px 14px", borderRadius: "8px", border: "1px solid #FABE3D40",
            background: "rgba(250,190,61,0.12)", color: "#FABE3D",
            fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>
            Edit
          </button>
        )}
        {isAdmin && editMode && (
          <div style={{ position: "absolute", top: "18px", right: "20px", fontSize: "11px", color: "#FABE3D", opacity: 0.7, fontWeight: 600 }}>
            Editing
          </div>
        )}
      </div>

      {editMode ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", minHeight: "500px" }}>
          <div style={{ overflowY: "auto" }}>
            <ChartView roles={draft.roles} connections={draft.connections} footer_text={draft.footer_text} />
          </div>
          <div style={{ borderLeft: "1px solid #E4E2D6", background: "#FAFAF7", overflowY: "auto" }}>
            {saveError && (
              <div style={{ margin: "12px 16px 0", padding: "10px 14px", borderRadius: "8px", background: "#FFF5F3", border: "1px solid #F3755E", color: "#C4361E", fontSize: "12px" }}>
                {saveError}
              </div>
            )}
            <EditPanel draft={draft} setDraft={setDraft} onSave={saveEdit} onCancel={cancelEdit} saving={saving} />
          </div>
        </div>
      ) : (
        <ChartView roles={data.roles} connections={data.connections} footer_text={data.footer_text} />
      )}
    </div>
  );
}
