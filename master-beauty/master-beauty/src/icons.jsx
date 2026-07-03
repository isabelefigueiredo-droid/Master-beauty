import React from 'react';

const Ic = ({ d, size = 20, fill = "none", sw = 1.8, children, vb = "0 0 24 24" }) => (
  <svg width={size} height={size} viewBox={vb} fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="square" strokeLinejoin="miter">
    {d ? <path d={d} /> : children}
  </svg>
);

export const IcoHome     = (p) => <Ic {...p} d="M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10" />;
export const IcoMail     = (p) => <Ic {...p}><rect x="3" y="5" width="18" height="14" /><path d="M3 6l9 7 9-7" /></Ic>;
export const IcoCalendar = (p) => <Ic {...p}><rect x="3" y="5" width="18" height="16" /><path d="M3 9h18M8 3v4M16 3v4" /></Ic>;
export const IcoCheck    = (p) => <Ic {...p}><rect x="4" y="4" width="16" height="16" rx="0" /><path d="M8 12l3 3 5-6" /></Ic>;
export const IcoChat     = (p) => <Ic {...p}><path d="M4 4h16v12H8l-4 4z" /></Ic>;
export const IcoNote     = (p) => <Ic {...p}><path d="M5 3h10l4 4v14H5zM15 3v4h4M8 12h8M8 16h5" /></Ic>;
export const IcoSearch   = (p) => <Ic {...p}><circle cx="11" cy="11" r="6" /><path d="M20 20l-4-4" /></Ic>;
export const IcoSparkle  = (p) => <Ic {...p} sw={1.6}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" /></Ic>;
export const IcoVideo    = (p) => <Ic {...p}><rect x="3" y="6" width="13" height="12" /><path d="M16 10l5-3v10l-5-3z" /></Ic>;
export const IcoPlus     = (p) => <Ic {...p}><path d="M12 5v14M5 12h14" /></Ic>;
export const IcoArrow    = (p) => <Ic {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Ic>;
export const IcoSun      = (p) => <Ic {...p}><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></Ic>;
export const IcoMoon     = (p) => <Ic {...p}><path d="M20 14a8 8 0 11-9.5-9.8A7 7 0 0020 14z" /></Ic>;
export const IcoDoc      = (p) => <Ic {...p}><path d="M6 3h9l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" /></Ic>;
export const IcoBolt     = (p) => <Ic {...p}><path d="M13 3L5 13h6l-1 8 8-10h-6z" /></Ic>;
export const IcoFile     = (p) => <Ic {...p}><rect x="4" y="3" width="16" height="18" /><path d="M8 8h8M8 12h8M8 16h5" /></Ic>;
export const IcoDrive    = (p) => <Ic {...p}><path d="M8 4h8l5 9-4 7H7l-4-7zM3 13h18M8 4l5 9M16 4l-5 9" /></Ic>;
export const IcoGrid     = (p) => <Ic {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></Ic>;
export const IcoTable    = (p) => <Ic {...p}><rect x="3" y="3" width="18" height="18" /><path d="M3 9h18M3 15h18M9 3v18" /></Ic>;
export const IcoSettings = (p) => <Ic {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></Ic>;
export const IcoChart    = (p) => <Ic {...p}><path d="M3 20h18M6 20V12M10 20V8M14 20V4M18 20v-6" /></Ic>;

const Icons = {
  home: IcoHome, mail: IcoMail, calendar: IcoCalendar, check: IcoCheck,
  chat: IcoChat, note: IcoNote, search: IcoSearch, sparkle: IcoSparkle,
  video: IcoVideo, plus: IcoPlus, arrow: IcoArrow, sun: IcoSun, moon: IcoMoon,
  doc: IcoDoc, bolt: IcoBolt, filePresent: IcoFile, drive: IcoDrive,
  grid: IcoGrid, table: IcoTable, settings: IcoSettings, chart: IcoChart,
};

export default Icons;
