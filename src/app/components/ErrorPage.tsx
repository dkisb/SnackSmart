export default function ErrorPage({ message }: { message: string }) {
  return (
    <div className="p-6 bg-red-900 text-red-200 rounded-lg text-center">
      <h2 className="text-xl font-bold mb-2">⚠️ Error</h2>
      <p>{message}</p>
    </div>
  );
}
