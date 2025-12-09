import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

export default function MarkdownTable({ children }) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-gray-300 bg-white">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                    table: ({ node, ...props }) => (
                        <table className="min-w-full table-fixed border-separate border-spacing-0" {...props} />
                    ),
                    thead: (props) => <thead className="bg-gray-50" {...props} />,
                    th: (props) => (
                        <th
                            className="text-left text-sm font-semibold text-gray-900 px-4 py-3 border-b border-gray-200"
                            {...props}
                        />
                    ),
                    td: (props) => (
                        <td className="align-top text-sm text-gray-800 px-4 py-3 border-b border-gray-200" {...props} />
                    ),
                    tr: ({ node, ...props }) => <tr className="last:[&>td]:border-b-0" {...props} />
                }}
            >
                {`\n${children?.trim?.() ?? ""}\n`}
            </ReactMarkdown>
        </div>
    );
}
