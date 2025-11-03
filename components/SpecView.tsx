import React from 'react';
import { PrioritizedFeatures, MVPDefinition, DataModel, APISpecification, Integrations, SecurityAndCompliance, Roadmap } from './spec-types';

type SpecData = {
    title: string;
    content?: string;
    intro?: string;
    acceptanceCriteria?: string[];
    userStories?: { story: string; complexity: string; }[];
    categories?: { name: string; features: { name: string; rationale: string; priority: string; complexity: string; }[]; }[];
    schema?: string;
    endpoints?: { method: string; path: string; description: string; queryParams?: { param: string; desc: string }[]; request?: string; response?: string; }[];
    sections?: { name: string; vendors: { name: string; pros: string; cons: string; fit: string; }[]; }[];
    phases?: { name: string; theme: string; features: string[]; acceptanceCriteria: string; }[];
};

interface SpecViewProps {
  data: SpecData;
}

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
    const colors: { [key: string]: string } = {
        'MUST': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        'SHOULD': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
        'NICE-TO-HAVE': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300'
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[priority] || 'bg-slate-100 text-slate-800'}`}>{priority}</span>;
};

const ComplexityBadge: React.FC<{ complexity: string }> = ({ complexity }) => {
    return <span className="px-2 py-1 text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md">{complexity}</span>;
}

const MethodBadge: React.FC<{ method: string }> = ({ method }) => {
    const colors: { [key: string]: string } = {
        'GET': 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
        'POST': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        'PUT': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
        'DELETE': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return <span className={`px-3 py-1 text-sm font-semibold rounded-md ${colors[method]}`}>{method}</span>;
}

const SpecView: React.FC<SpecViewProps> = ({ data }) => {
    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">{data.title}</h1>

            {data.content && <p className="mb-6 text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">{data.content}</p>}
            
            {data.intro && <p className="mb-6 p-4 bg-sky-50 dark:bg-sky-900/50 border-l-4 border-sky-400 text-sky-800 dark:text-sky-300 rounded-r-lg">{data.intro}</p>}

            {data.categories && data.categories.map((cat, idx) => (
                <div key={idx} className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-slate-700 dark:text-slate-200">{cat.name}</h2>
                    <div className="space-y-4">
                        {cat.features.map((feat, fIdx) => (
                            <div key={fIdx} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-slate-800 dark:text-white">{feat.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{feat.rationale}</p>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                                        <ComplexityBadge complexity={feat.complexity} />
                                        <PriorityBadge priority={feat.priority} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            
            {(data.acceptanceCriteria || data.userStories) && (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
                    {data.acceptanceCriteria && (
                        <>
                            <h2 className="text-2xl font-semibold mb-4 text-slate-700 dark:text-white">Acceptance Criteria</h2>
                            <ul className="list-disc list-inside space-y-2 mb-6 text-slate-600 dark:text-slate-400">
                                {data.acceptanceCriteria.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </>
                    )}
                    {data.userStories && (
                        <>
                            <h2 className="text-2xl font-semibold mb-4 text-slate-700 dark:text-white">User Stories</h2>
                            <div className="space-y-3">
                            {data.userStories.map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                                    <p className="text-slate-700 dark:text-slate-300">{item.story}</p>
                                    <ComplexityBadge complexity={item.complexity} />
                                </div>
                            ))}
                            </div>
                        </>
                    )}
                </div>
            )}


            {data.schema && (
                <>
                    <h2 className="text-2xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Prisma Schema</h2>
                    <pre className="bg-slate-900 text-white p-4 rounded-lg overflow-x-auto text-sm border border-slate-700"><code>{data.schema.trim()}</code></pre>
                </>
            )}

            {data.endpoints && (
                <div className="space-y-8">
                    {data.endpoints.map((ep, i) => (
                        <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center space-x-4 mb-2">
                                <MethodBadge method={ep.method} />
                                <span className="text-lg font-mono text-slate-700 dark:text-slate-300">{ep.path}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">{ep.description}</p>
                            {ep.request && (
                                <>
                                <h4 className="font-semibold text-sm mb-2 text-slate-600 dark:text-slate-300">Sample Request Body</h4>
                                <pre className="bg-slate-900 text-white p-4 rounded-lg overflow-x-auto text-sm mb-4 border border-slate-700"><code>{ep.request.trim()}</code></pre>
                                </>
                            )}
                            {ep.response && (
                                <>
                                <h4 className="font-semibold text-sm mb-2 text-slate-600 dark:text-slate-300">Sample Response Body</h4>
                                <pre className="bg-slate-900 text-white p-4 rounded-lg overflow-x-auto text-sm border border-slate-700"><code>{ep.response.trim()}</code></pre>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {data.sections && data.sections.map((sec, i) => (
                <div key={i} className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-slate-700 dark:text-slate-200">{sec.name}</h2>
                    <div className="space-y-4">
                        {sec.vendors.map((vendor, vI) => (
                             <div key={vI} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                 <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{vendor.name}</h3>
                                 <p className="text-sm mt-2"><strong className="text-green-600 dark:text-green-400">Pros:</strong> <span className="text-slate-600 dark:text-slate-400">{vendor.pros}</span></p>
                                 <p className="text-sm mt-1"><strong className="text-red-600 dark:text-red-400">Cons:</strong> <span className="text-slate-600 dark:text-slate-400">{vendor.cons}</span></p>
                                 <p className="text-sm mt-1"><strong className="text-sky-600 dark:text-sky-400">Best Fit:</strong> <span className="text-slate-600 dark:text-slate-400">{vendor.fit}</span></p>
                             </div>
                        ))}
                    </div>
                </div>
            ))}

            {data.phases && data.phases.map((phase, i) => (
                <div key={i} className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-semibold text-sky-600 dark:text-sky-400">{phase.name} <span className="text-base text-slate-500 dark:text-slate-400 font-normal">- {phase.theme}</span></h2>
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-300">Features:</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                            {phase.features.map((feat, fI) => <li key={fI}>{feat}</li>)}
                        </ul>
                        <p className="mt-4 text-sm bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md border-l-4 border-slate-400 dark:border-slate-500 text-slate-700 dark:text-slate-300"><strong>Acceptance:</strong> {phase.acceptanceCriteria}</p>
                    </div>
                </div>
            ))}

        </div>
    );
};

export default SpecView;