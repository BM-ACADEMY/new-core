// BlogPreview.jsx (Updated: Author removed from List preview)
import React, { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

const BlogPreview = ({ meta, coverPreview, sections }) => {
  const allBlocks = sections ? sections.flatMap(section => section.items) : [];
  const [openAccordion, setOpenAccordion] = useState(null);

  // Helper: Bold only the first word of the list heading
  const formatListHeading = (text) => {
    if (!text || text.trim() === "") return null;
    const words = text.trim().split(" ");
    const firstWord = words[0];
    const rest = words.slice(1).join(" ");
    return (
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        <span className="font-extrabold">{firstWord}</span>{rest ? ` ${rest}` : ""}
      </h3>
    );
  };

  return (
    <article className="max-w-2xl mx-auto bg-white min-h-[600px] shadow-lg rounded-lg overflow-hidden pb-10">
      <div className="h-64 bg-gray-200 w-full relative">
        {coverPreview ? (
          <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <span className="text-sm font-semibold">Cover Image</span>
          </div>
        )}
      </div>

      <div className="p-8">
        <div className="mb-8 border-b pb-6">
          <span className="inline-block bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mb-3">
            {meta.category || "General"}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            {meta.mainHeading || "Your Blog Title..."}
          </h1>
          {meta.description && (
            <p className="text-gray-500 mt-4 text-lg leading-relaxed">
              {meta.description}
            </p>
          )}
        </div>

        <div className="space-y-6 text-gray-800">
          {allBlocks.length === 0 && (
            <p className="text-center text-gray-300 italic py-10">Start adding sections to see content here...</p>
          )}

          {allBlocks.map((block, i) => {
            if (block.type === 'heading') {
              return <h2 key={i} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{block.data.text || "Heading..."}</h2>;
            }
            if (block.type === 'paragraph') {
              return <p key={i} className="text-gray-700 leading-7 whitespace-pre-line">{block.data.text || "Paragraph text..."}</p>;
            }
            if (block.type === 'image') {
              return block.data.url ? (
                <div key={i} className="my-6">
                  <img src={block.data.url} alt="Content" className="w-full rounded-lg shadow-sm border border-gray-100" />
                </div>
              ) : null;
            }
            if (block.type === 'list') {
              return (
                <div key={i} className="my-8">
                  {formatListHeading(block.data.heading)}
                  <ul className="list-disc pl-6 space-y-3 text-gray-700">
                    {block.data.items.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item || "List item..."}</li>
                    ))}
                  </ul>
                  {/* Author line removed */}
                </div>
              );
            }
            if (block.type === 'quote') {
              return (
                <blockquote key={i} className="border-l-4 border-blue-500 bg-gray-50 p-6 my-8 rounded-r-lg italic text-lg text-gray-700">
                  "{block.data.text || "Quote text here..."}"
                  {block.data.author && <cite className="block text-right text-sm text-gray-500 font-semibold mt-4 not-italic">- {block.data.author}</cite>}
                </blockquote>
              );
            }
            if (block.type === 'button') {
              const btnClasses = {
                primary: "bg-blue-600 text-white hover:bg-blue-700",
                outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
                black: "bg-gray-900 text-white hover:bg-black"
              };
              const styleClass = btnClasses[block.data.style] || btnClasses.primary;

              return (
                <div key={i} className="my-8 text-center">
                  <a href={block.data.url || "#"} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-lg transition duration-200 shadow-lg ${styleClass}`}>
                    {block.data.text || "Button Text"} <ExternalLink size={18}/>
                  </a>
                </div>
              );
            }
            if (block.type === 'accordion') {
              const isOpen = openAccordion === i;
              return (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden my-6">
                  <button
                    onClick={() => setOpenAccordion(isOpen ? null : i)}
                    className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center font-semibold text-left"
                  >
                    {block.data.title || "Accordion Title"}
                    {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                  </button>
                  {isOpen && (
                    <div className="p-6 bg-white border-t">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {block.data.content || "Accordion content goes here..."}
                      </p>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </article>
  );
};

export default BlogPreview;