import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import MarkdownRenderer from '@/src/lib/components/custom/MarkdownRenderer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/lib/components/ui/card';
import { Button } from '@/src/lib/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/lib/components/ui/select';
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
  const search = useSearch({ from: '/docs' });
  const navigate = useNavigate({ from: '/docs' });

  const [selectedDoc, setSelectedDoc] = useState<ApiDocMetadata | null>(null);
  const [allSections, setAllSections] = useState<ApiSectionInfo[]>([]);
  const [selectedSection, setSelectedSection] = useState<ApiSectionInfo | null>(null);
  const [sectionContent, setSectionContent] = useState<string>('');

  // Load docs metadata
  const { data: docsMetadata, isError: docsMetadataError } = api.getDocsMetadata;

  // Initialize selected doc when docs load
  useEffect(() => {
    if (docsMetadata?.docs && !selectedDoc) {
      const docFromUrl = search.doc;
      const selectedDocFromList = docFromUrl
        ? docsMetadata.docs.find(doc => doc.id === docFromUrl)
        : docsMetadata.docs[0];

      if (selectedDocFromList) {
        setSelectedDoc(selectedDocFromList);
      }
    }
  }, [docsMetadata, search.doc, selectedDoc]);

  // Load sections when document changes (always call but conditionally enable)
  const { data: sectionsData, isError: sectionsError } = api.getDocSections(selectedDoc?.id || '', {
    enabled: !!selectedDoc?.id,
  });

  // Set sections when they load
  useEffect(() => {
    if (sectionsData && typeof sectionsData === 'object' && 'sections' in sectionsData && sectionsData.sections) {
      const typedSectionsData = sectionsData as { sections: ApiSectionInfo[] };
      setAllSections(typedSectionsData.sections);

      // Initialize selected section from URL params or default to first section
      const sectionFromUrl = search.section;
      const selectedSectionFromList = sectionFromUrl
        ? typedSectionsData.sections.find(section => section.id === sectionFromUrl)
        : typedSectionsData.sections[0];

      if (selectedSectionFromList && !selectedSection) {
        setSelectedSection(selectedSectionFromList);
      }
    }
  }, [sectionsData, search.section, selectedSection]);

  // Load section content when section changes (always call but conditionally enable)
  const { data: contentData, isError: contentError } = api.getSectionContent(
    { docId: selectedDoc?.id || '', sectionId: selectedSection?.id || '' },
    {
      enabled: !!(selectedDoc?.id && selectedSection?.id),
    }
  );

  // Set content when it loads
  useEffect(() => {
    if (contentData && typeof contentData === 'object' && 'content' in contentData && contentData.content) {
      const typedContentData = contentData as { content: string };
      setSectionContent(typedContentData.content);
    } else if (contentData && typeof contentData === 'object' && 'content' in contentData && !contentData.content) {
      setSectionContent('# Content not available\n\nThis section appears to be empty.');
    }
  }, [contentData]);

  // Navigation functions
  const navigateToSection = (section: ApiSectionInfo) => {
    setSelectedSection(section);
    // Update URL with selected section
    navigate({
      search: {
        doc: selectedDoc?.id,
        section: section.id,
      },
      replace: true,
    });
  };

  const navigateToNext = () => {
    if (!allSections.length || !selectedSection) return;
    const currentIndex = allSections.findIndex(s => s.id === selectedSection.id);
    if (currentIndex < allSections.length - 1) {
      const nextSection = allSections[currentIndex + 1];
      setSelectedSection(nextSection);
      // Update URL with next section
      navigate({
        search: {
          doc: selectedDoc?.id,
          section: nextSection.id,
        },
        replace: true,
      });
    }
  };

  const navigateToPrevious = () => {
    if (!allSections.length || !selectedSection) return;
    const currentIndex = allSections.findIndex(s => s.id === selectedSection.id);
    if (currentIndex > 0) {
      const prevSection = allSections[currentIndex - 1];
      setSelectedSection(prevSection);
      // Update URL with previous section
      navigate({
        search: {
          doc: selectedDoc?.id,
          section: prevSection.id,
        },
        replace: true,
      });
    }
  };

  // Handle document selection
  const handleDocSelect = (doc: ApiDocMetadata) => {
    setSelectedDoc(doc);
    // Update URL with selected doc
    navigate({
      search: {
        doc: doc.id,
        section: undefined, // Reset section when changing docs
      },
      replace: true,
    });
    // Sections will be loaded automatically via useEffect
  };

  return (
    <div className="bg-background [--navbar-height:5rem]">
      {/* Navbar */}
      <div className="h-[var(--navbar-height)]">
        <Navbar />
      </div>

      <div className="h-[calc(100dvh-var(--navbar-height))]"> 
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
                <div className="space-y-6 sticky top-28 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {/* Documentation Navigation */}
                  <Card className="shadow-lg border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
                    <CardHeader className="relative">
                      <div className="flex items-center gap-3">
                        <div className="p-2">
                          <Icon name="BookOpen" className="size-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Documentation</CardTitle>
                          <CardDescription className="text-sm">
                            Select a guide to get started
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      {/* Guide Selector */}
                      <div className="space-y-2">
                        {docsMetadataError ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            <Icon name="TriangleAlert" className="size-8 mx-auto mb-2 text-destructive" />
                            <p>We couldn't load the documentation guides right now.</p>
                            <p className="text-xs mt-1">Please try refreshing the page.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-foreground px-1">Select Guide</div>
                            <Select value={selectedDoc?.id || ""} onValueChange={(value) => {
                              const doc = docsMetadata?.docs?.find(d => d.id === value);
                              if (doc) handleDocSelect(doc);
                            }}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose a guide...">
                                  {selectedDoc && (
                                    <div className="flex items-center gap-2">
                                      <Icon name={selectedDoc.icon as any} className="size-4 text-primary" />
                                      <span>{selectedDoc.title}</span>
                                    </div>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {docsMetadata?.docs?.map((doc) => (
                                  <SelectItem key={doc.id} value={doc.id}>
                                    <div className="flex items-center gap-2">
                                      <Icon name={doc.icon as any} className="size-4 text-primary" />
                                      <div className="flex flex-col items-start">
                                        <span className="font-medium">{doc.title}</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">{doc.description}</span>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {/* Separator */}
                      {selectedDoc && <Separator className="bg-border/50" />}

                      {/* Sections */}
                      {selectedDoc && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-foreground px-1">Sections</div>
                          <div className="space-y-1 max-h-80 overflow-y-auto">
                            <AnimatePresence mode="popLayout">
                              {sectionsError ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  <Icon name="TriangleAlert" className="size-6 mx-auto mb-2 text-destructive" />
                                  <p>Couldn't load sections for this guide.</p>
                                  <p className="text-xs mt-1">Try selecting a different guide.</p>
                                </div>
                              ) : (
                                allSections.map((section, index) => (
                              <motion.div
                                key={section.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15, delay: index * 0.02 }}
                                layout
                              >
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
                              </motion.div>
                                ))
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                  <AnimatePresence mode="wait">
                    {selectedDoc ? (
                    <motion.div
                      key={selectedDoc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
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
                        <motion.div
                          className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg border border-border/50"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                        >
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
                        </motion.div>

                        {/* Section Content */}
                        {contentError ? (
                          <div className="p-8 text-center space-y-4">
                            <Icon name="TriangleAlert" className="size-12 mx-auto text-destructive" />
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold text-foreground">Oops! Something went wrong</h3>
                              <p className="text-sm text-muted-foreground">
                                We couldn't load this section. Please try refreshing the page or contact support if the problem persists.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <motion.div
                            key={selectedSection?.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
                            className="prose prose-sm sm:prose-base max-w-none"
                          >
                            <MarkdownRenderer content={sectionContent} />
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-doc"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
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
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Theme Switch */}
      <div className="fixed right-4 bottom-4">
        <ThemeSwitch />
      </div>
    </div>
  );
}