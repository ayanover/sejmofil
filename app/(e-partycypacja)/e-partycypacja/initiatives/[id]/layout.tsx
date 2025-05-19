export const metadata = {
  title: 'Szczegóły Inicjatywy | Sejmofil',
  description: 'Szczegółowe informacje o inicjatywie obywatelskiej',
};

export default function InitiativeDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      {children}
    </div>
  );
}