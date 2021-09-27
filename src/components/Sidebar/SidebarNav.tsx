import {
  Stack,
} from "@chakra-ui/react";
import {
  RiContactsLine,
  RiDashboardLine,
  RiInputMethodLine,
  RiGitMergeLine
} from "react-icons/ri";

import { NavSection } from "./NavSection";
import { NavLink } from "./NavLink";

export function SidebarNav() {
  return (
    <Stack spacing="12" align="flex-start">
      <NavSection title="Geral">
        <NavLink title="Dashboard" icon={RiDashboardLine} href="/dashboard" />
        <NavLink title="Usuários" icon={RiContactsLine} href="/users" />
      </NavSection>

      <NavSection title="Automação">
        <NavLink title="Formulários" icon={RiInputMethodLine} href="/forms" />
        <NavLink title="Automação" icon={RiGitMergeLine} href="/automation" />
      </NavSection>
    </Stack>
  );
}