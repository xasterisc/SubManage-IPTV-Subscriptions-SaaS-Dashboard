
export interface PrioritizedFeatures {
    title: string;
    categories: {
        name: string;
        features: { name: string; rationale: string; priority: string; complexity: string; }[];
    }[];
}

export interface MVPDefinition {
    title: string;
    content: string;
    acceptanceCriteria: string[];
    userStories: { story: string; complexity: string; }[];
}

export interface DataModel {
    title: string;
    schema: string;
}

export interface APISpecification {
    title: string;
    intro?: string;
    endpoints: {
        method: string;
        path: string;
        description: string;
        queryParams?: { param: string; desc: string; }[];
        request?: string;
        response?: string;
    }[];
}

export interface Integrations {
    title: string;
    sections: {
        name: string;
        vendors: {
            name: string;
            pros: string;
            cons: string;
            fit: string;
        }[];
    }[];
}

export interface SecurityAndCompliance {
    title: string;
    content: string;
}

export interface Roadmap {
    title: string;
    phases: {
        name: string;
        theme: string;
        features: string[];
        acceptanceCriteria: string;
    }[];
}
