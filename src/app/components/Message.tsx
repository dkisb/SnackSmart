import ReactMarkdown from 'react-markdown';

export default function Message({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  return (
    <div
      className={`p-4 rounded-lg whitespace-pre-wrap border border-[#333333] ${
        role === 'user' ? 'bg-[#333333] text-right' : 'bg-[#222222] text-left'
      }`}
    >
      <div className="text-sm font-semibold text-[#FFD700] mb-2">{role === 'user' ? 'You' : 'AI'}</div>
      <div className="text-[#F5F5F5] prose prose-invert">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
            table: ({ children }) => (
              <table className="table-auto w-full border-collapse border border-[#444444]">{children}</table>
            ),
            th: ({ children }) => <th className="border border-[#444444] p-2">{children}</th>,
            td: ({ children }) => <td className="border border-[#444444] p-2">{children}</td>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
