export function Section({
  title,
  description,
  children,
  tone = 'default',
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: 'default' | 'danger';
}) {
  return (
    <section
      className={`bg-white border p-6 shadow-sm rounded-lg ${tone === 'danger' ? 'border-red-200' : 'border-gray-200'}`}
    >
      <h2 className={`text-lg font-medium ${tone === 'danger' ? 'text-red-800' : 'text-gray-900'}`}>{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export type Status = { type: 'error' | 'success'; text: string } | null;

export function StatusMessage({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <div
      className={`mt-4 px-4 py-3 text-sm border ${
        status.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-800'
      }`}
    >
      {status.text}
    </div>
  );
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}
