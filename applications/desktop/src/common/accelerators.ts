import { Accelerators } from "./commands/types";

export const accelerators: Accelerators = {
  ChangeCellToCode: "CmdOrCtrl+Shift+Y",
  ChangeCellToText: "CmdOrCtrl+Shift+M",
  Close: { win32: "Alt+F4", others: "CmdOrCtrl+W" },
  Copy: "CmdOrCtrl+C",
  CopyCell: { others: "CmdOrCtrl+Shift+C", interceptEarly: true },
  Cut: "CmdOrCtrl+X",
  CutCell: "CmdOrCtrl+Shift+X",
  DeleteCell: "CmdOrCtrl+Shift+D",
  DeveloperTools: { darwin: "Alt+Command+I", others: "Ctrl+Shift+I" },
  Hide: "Command+H",
  HideOthers: "Command+Alt+H",
  Fullscreen: { darwin: "Ctrl+Command+F", others: "F11" },
  Minimize: "CmdOrCtrl+M",
  NewCodeCellAbove: "CmdOrCtrl+Shift+A",
  NewCodeCellBelow: "CmdOrCtrl+Shift+B",
  NewTextCellAbove: "CmdOrCtrl+Shift+E",
  NewTextCellBelow: "CmdOrCtrl+Shift+G",
  NewNotebook: "CmdOrCtrl+N",
  Open: "CmdOrCtrl+O",
  Paste: "CmdOrCtrl+V",
  PasteCell: { others: "CmdOrCtrl+Shift+V", interceptEarly: true },
  Quit: "Command+Q",
  Reload: "CmdOrCtrl+R",
  Save: "CmdOrCtrl+S",
  SaveAs: "CmdOrCtrl+Shift+S",
  SelectAll: "CmdOrCtrl+A",
  ZoomIn: "CmdOrCtrl+=",
  ZoomReset: "CmdOrCtrl+0",
  ZoomOut: "CmdOrCtrl+-",
};