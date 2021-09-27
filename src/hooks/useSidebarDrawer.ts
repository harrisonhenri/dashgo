import { useContext } from "react";

import { SidebarDrawerContext } from "../contexts/SidebarDrawer";

export function useSidebarDrawer() {
  return useContext(SidebarDrawerContext);
}
