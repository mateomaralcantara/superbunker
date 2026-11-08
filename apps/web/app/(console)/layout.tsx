import { Sidebar } from "../../src/console/Sidebar";
import { ConsoleTop } from "../../src/console/ConsoleTop";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="console">
      <Sidebar />
      <div className="console-main">
        <ConsoleTop />
        <main className="console-body">{children}</main>
      </div>
    </div>
  );
}
