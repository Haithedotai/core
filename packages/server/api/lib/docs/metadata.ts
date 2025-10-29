export interface DocSection {
  id: string;
  title: string;
  description: string;
  contentFile: string;
  order: number;
  subsections?: DocSection[];
}

export interface DocMetadata {
  id: string;
  title: string;
  description: string;
  icon: string;
  sections: DocSection[];
}

// Sample documentation structure with subsections
export const docsMetadata: DocMetadata[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Welcome to Haithe platform',
    icon: 'BookOpen',
    sections: [
      {
        id: 'welcome',
        title: 'Welcome',
        description: 'Introduction to Haithe',
        contentFile: 'getting-started/welcome.md',
        order: 1,
        subsections: [
          {
            id: 'what-is-haithe',
            title: 'What is Haithe?',
            description: 'Platform overview',
            contentFile: 'getting-started/welcome.md',
            order: 1
          },
          {
            id: 'key-features',
            title: 'Key Features',
            description: 'Main capabilities',
            contentFile: 'getting-started/welcome.md',
            order: 2
          }
        ]
      },
      {
        id: 'first-steps',
        title: 'First Steps',
        description: 'Getting started guide',
        contentFile: 'getting-started/first-steps.md',
        order: 2,
        subsections: [
          {
            id: 'connect-wallet',
            title: 'Connect Wallet',
            description: 'Set up Web3 wallet',
            contentFile: 'getting-started/first-steps.md',
            order: 1
          },
          {
            id: 'create-org',
            title: 'Create Organization',
            description: 'Set up team workspace',
            contentFile: 'getting-started/first-steps.md',
            order: 2
          }
        ]
      }
    ]
  }
];

// Helper functions
export function getAllSections(docId: string): DocSection[] {
  const doc = docsMetadata.find(d => d.id === docId);
  if (!doc) return [];

  return doc.sections.sort((a, b) => a.order - b.order);
}

export function getNextSection(docId: string, currentSectionId: string): DocSection | null {
  const sections = getAllSections(docId);
  const currentIndex = sections.findIndex(s => s.id === currentSectionId);
  return currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;
}

export function getPreviousSection(docId: string, currentSectionId: string): DocSection | null {
  const sections = getAllSections(docId);
  const currentIndex = sections.findIndex(s => s.id === currentSectionId);
  return currentIndex > 0 ? sections[currentIndex - 1] : null;
}
