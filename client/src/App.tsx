import { PatientHeader } from "./components/PatientHeader/PatientHeader";
import { Timeline } from "./components/Timeline/Timeline";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Activity } from "lucide-react";

export function App() {
  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-1 data-[orientation=vertical]:h-4"
            />
            <div className="flex items-center gap-2 mr-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-600">
                <Activity className="h-3.5 w-3.5 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold tracking-tight text-ink hidden sm:inline">
                HealthLine
              </span>
            </div>
            <Separator
              orientation="vertical"
              className="mr-1 data-[orientation=vertical]:h-4 hidden sm:block"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1 max-w-150">
                    <PatientHeader />
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <Timeline />
        </div>
      </SidebarInset>
      <SidebarRight />
    </SidebarProvider>
  );
}
