import BottomNav from "@/components/BottomNav";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main
        className="mx-auto min-h-dvh max-w-md px-5 pb-28"
        style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}
      >
        {children}
      </main>
      <BottomNav />
    </>
  );
}
