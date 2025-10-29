import { useState, useEffect } from 'react';
import MarkdownRenderer from '@/src/lib/components/custom/MarkdownRenderer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/lib/components/ui/card';
import { Button } from '@/src/lib/components/ui/button';
import { Badge } from '@/src/lib/components/ui/badge';
import { Skeleton } from '@/src/lib/components/ui/skeleton';
import Icon from '@/src/lib/components/custom/Icon';
import { Separator } from '@/src/lib/components/ui/separator';
import DashboardHeader from '../dashboard/Header';
import Navbar from '../dashboard/Navbar';
import ThemeSwitch from '@/src/lib/components/custom/ThemeSwitch';
import { useApi } from '@/src/lib/hooks/use-api';

// Types for API responses
interface ApiDocMetadata {
  id: string;
  title: string;
  description: string;
  icon: string;
  sections: ApiDocSection[];
}

interface ApiDocSection {
  id: string;
  title: string;
  description: string;
  order: number;
  subsections?: ApiDocSection[];
}

interface ApiSectionInfo {
  id: string;
  title: string;
  description: string;
  order: number;
  level: number;
}

export default function Docs() {
  const api = useApi();

  const [docs, setDocs] = useState<ApiDocMetadata[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ApiDocMetadata | null>(null);
  const [allSections, setAllSections] = useState<ApiSectionInfo[]>([]);
  const [selectedSection, setSelectedSection] = useState<ApiSectionInfo | null>(null);
  const [sectionContent, setSectionContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load docs metadata on mount
  useEffect(() => {
    const loadDocsMetadata = async () => {
      try {
        const data = await api.getDocsMetadata.mutateAsync();
        if (data.docs) {
          setDocs(data.docs);
          if (data.docs.length > 0) {
            setSelectedDoc(data.docs[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load docs metadata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocsMetadata();
  }, []);

  // Load sections when document changes
  useEffect(() => {
    const loadSections = async () => {
      if (!selectedDoc) return;

      try {
        const data = await api.getDocSections.mutateAsync(selectedDoc.id);
        if (data.sections) {
          setAllSections(data.sections);
          if (data.sections.length > 0) {
            setSelectedSection(data.sections[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load sections:', error);
      }
    };

    if (selectedDoc) {
      loadSections();
    }
  }, [selectedDoc]);

  // Load section content when section changes
  useEffect(() => {
    const loadSectionContent = async () => {
      if (!selectedDoc || !selectedSection) return;

      try {
        const data = await api.getSectionContent.mutateAsync({
          docId: selectedDoc.id,
          sectionId: selectedSection.id
        });
        if (data.content) {
          setSectionContent(data.content);
        } else {
          setSectionContent('# Error\n\nFailed to load section content.');
        }
      } catch (error) {
        console.error('Error loading section content:', error);
        setSectionContent('# Error\n\nFailed to load section content.');
      }
    };

    if (selectedDoc && selectedSection) {
      loadSectionContent();
    }
  }, [selectedDoc, selectedSection]);

  // Navigation functions
  const navigateToSection = (section: ApiSectionInfo) => {
    setSelectedSection(section);
  };

  const navigateToNext = () => {
    if (!allSections.length || !selectedSection) return;
    const currentIndex = allSections.findIndex(s => s.id === selectedSection.id);
    if (currentIndex < allSections.length - 1) {
      setSelectedSection(allSections[currentIndex + 1]);
    }
  };

  const navigateToPrevious = () => {
    if (!allSections.length || !selectedSection) return;
    const currentIndex = allSections.findIndex(s => s.id === selectedSection.id);
    if (currentIndex > 0) {
      setSelectedSection(allSections[currentIndex - 1]);
    }
  };

  // Handle document selection
  const handleDocSelect = (doc: ApiDocMetadata) => {
    setSelectedDoc(doc);
    // Sections will be loaded automatically via useEffect
  };

  return (
    <div className="bg-background [--navbar-height:5rem]">
      {/* Navbar */}
      <div className="h-[var(--navbar-height)]">
        <Navbar />
      </div>

      <div className="h-[calc(100dvh-var(--navbar-height))]">
        {loading ? (
          <div className="bg-background">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
              <div className="flex items-center gap-4">
                <Skeleton className="size-16 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-96" />
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
                <div className="lg:col-span-3">
                  <Skeleton className="h-[600px] w-full" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-background">
            {/* Header */}
            <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
              <DashboardHeader
                title="Documentation"
                subtitle="Comprehensive guides and technical documentation for the Haithe platform"
                iconName="BookOpen"
              />
            </div>

            <Separator className="bg-border/50" />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-6">
                  <Card className="shadow-lg border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
                    <CardHeader className="relative">
                      <div className="flex items-center gap-3">
                        <div className="p-2">
                          <Icon name="List" className="size-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Documentation</CardTitle>
                          <CardDescription className="text-sm">
                            Choose a guide to get started
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative space-y-2">
                      {docs.map((doc) => (
                        <Button
                          key={doc.id}
                          variant={selectedDoc?.id === doc.id ? "secondary" : "ghost"}
                          className="w-full justify-start h-auto p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-border/30 bg-gradient-to-r from-background to-background/50 backdrop-blur-sm"
                          onClick={() => handleDocSelect(doc)}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 flex-shrink-0">
                              <Icon name={doc.icon as any} className="size-4 text-primary" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <div className="font-semibold text-sm text-foreground">{doc.title}</div>
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {doc.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Sections Navigation */}
                  <Card className="shadow-lg border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
                    <CardHeader className="relative">
                      <div className="flex items-center gap-3">
                        <div className="p-2">
                          <Icon name="FileText" className="size-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Sections</CardTitle>
                          <CardDescription className="text-sm">
                            Navigate through topics
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-1 max-h-96 overflow-y-auto">
                        {allSections.map((section, index) => (
                          <Button
                            key={section.id}
                            variant={selectedSection?.id === section.id ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start text-left h-auto py-2 px-3"
                            onClick={() => navigateToSection(section)}
                            style={{ paddingLeft: `${(section.level - 1) * 12 + 12}px` }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-sm truncate">{section.title}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                  {selectedDoc ? (
                    <Card className="shadow-lg border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm h-fit">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-secondary/[0.01] rounded-lg" />
                      <CardHeader className="relative">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                            <Icon name={selectedDoc.icon as any} className="size-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{selectedDoc.title}</CardTitle>
                            <CardDescription className="text-base mt-1">
                              {selectedDoc.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="relative">
                        {/* Section Navigation */}
                        <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={navigateToPrevious}
                            disabled={!allSections.length || !selectedSection || allSections.findIndex(s => s.id === selectedSection.id) === 0}
                            className="flex items-center gap-2"
                          >
                            <Icon name="ChevronLeft" className="size-4" />
                            Previous
                          </Button>

                          <div className="text-center">
                            <div className="text-sm font-medium text-foreground">
                              {selectedSection?.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Section {allSections.length && selectedSection ? allSections.findIndex(s => s.id === selectedSection.id) + 1 : 0} of {allSections.length}
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={navigateToNext}
                            disabled={!allSections.length || !selectedSection || allSections.findIndex(s => s.id === selectedSection.id) === allSections.length - 1}
                            className="flex items-center gap-2"
                          >
                            Next
                            <Icon name="ChevronRight" className="size-4" />
                          </Button>
                        </div>

                        {/* Section Content */}
                        <div className="prose prose-sm sm:prose-base max-w-none">
                          <MarkdownRenderer content={sectionContent} />
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="shadow-lg border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
                      <CardContent className="relative py-16">
                        <div className="text-center space-y-6">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto border border-border/50">
                            <Icon name="BookOpen" className="size-8 text-muted-foreground" />
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">Select Documentation</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                              Choose a guide from the sidebar to view its content.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Theme Switch */}
      <div className="fixed right-4 bottom-4">
        <ThemeSwitch />
      </div>
    </div>
  );
}