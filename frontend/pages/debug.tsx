import { useEffect, useState } from "react";
import { TemplateAnalyzer } from "../lib/template-analyzer";

export default function DebugPage() {
  const [templateLines, setTemplateLines] = useState<string[]>([]);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const analyzeTemplate = async () => {
      try {
        setLoading(true);
        const lines = await TemplateAnalyzer.analyzeTemplate();
        const foundPlaceholders = await TemplateAnalyzer.extractPlaceholders();
        
        setTemplateLines(lines);
        setPlaceholders(foundPlaceholders);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
      } finally {
        setLoading(false);
      }
    };

    analyzeTemplate();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Template Analysis</h1>
        
        {loading && (
          <div className="text-center py-8">
            <p className="text-lg">Analyzing template...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Potential Placeholders ({placeholders.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {placeholders.map((placeholder, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <code className="text-sm text-gray-800">{placeholder}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">All Template Lines ({templateLines.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {templateLines.map((line, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <span className="text-gray-500 mr-2">#{index + 1}:</span>
                    <span className="text-gray-800">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
