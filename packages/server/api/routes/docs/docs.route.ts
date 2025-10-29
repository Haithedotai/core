import { Hono } from "hono";
import { readFileSync } from "fs";
import { join } from "path";
import { respond } from "@/api/lib/utils/respond";
import { docsMetadata } from "../../lib/docs/metadata";
import type { DocSection } from "../../lib/docs/metadata";

const docs = new Hono().get("/metadata", async (ctx) => {
  try {
    // Return only the structure, not the actual content
    const metadata = docsMetadata.map(doc => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      icon: doc.icon,
      sections: doc.sections.map(section => ({
        id: section.id,
        title: section.title,
        description: section.description,
        order: section.order,
        // Include subsections if they exist
        subsections: section.subsections?.map(sub => ({
          id: sub.id,
          title: sub.title,
          description: sub.description,
          order: sub.order
        }))
      }))
    }));

    return respond.ok(ctx, { docs: metadata }, "Successfully fetched docs metadata", 200);
  } catch (error) {
    console.error('Error fetching docs metadata:', error);
    return respond.err(ctx, "Failed to fetch docs metadata", 500);
  }
})

// Get specific section content
.get("/content/:docId/:sectionId", async (ctx) => {
  try {
    const { docId, sectionId } = ctx.req.param();

    // Find the document
    const doc = docsMetadata.find(d => d.id === docId);
    if (!doc) {
      return respond.err(ctx, "Document not found", 404);
    }

    // Find the section (including subsections)
    const findSection = (sections: DocSection[]): DocSection | null => {
      for (const section of sections) {
        if (section.id === sectionId) {
          return section;
        }
        if (section.subsections) {
          const found = findSection(section.subsections);
          if (found) return found;
        }
      }
      return null;
    };

    const section = findSection(doc.sections);
    if (!section) {
      return respond.err(ctx, "Section not found", 404);
    }

    // Read the content file
    const docsPath = join(process.cwd(), "api/lib/docs/content");
    const contentPath = join(docsPath, section.contentFile);

    try {
      const content = readFileSync(contentPath, 'utf-8');
      return respond.ok(ctx, {
        content,
        section: {
          id: section.id,
          title: section.title,
          description: section.description
        }
      }, "Successfully fetched section content", 200);
    } catch (fileError) {
      console.error(`Error reading file ${contentPath}:`, fileError);
      return respond.err(ctx, "Content file not found", 404);
    }

  } catch (error) {
    console.error('Error fetching section content:', error);
    return respond.err(ctx, "Failed to fetch section content", 500);
  }
})

// Get all sections for a document (for navigation)
.get("/sections/:docId", async (ctx) => {
  try {
    const { docId } = ctx.req.param();

    const doc = docsMetadata.find(d => d.id === docId);
    if (!doc) {
      return respond.err(ctx, "Document not found", 404);
    }

    // Flatten all sections including subsections
    const allSections: Array<{
      id: string;
      title: string;
      description: string;
      order: number;
      level: number;
    }> = [];

    const flattenSections = (sections: DocSection[], level = 1) => {
      sections.forEach(section => {
        allSections.push({
          id: section.id,
          title: section.title,
          description: section.description,
          order: section.order,
          level
        });
        if (section.subsections) {
          flattenSections(section.subsections, level + 1);
        }
      });
    };

    flattenSections(doc.sections);

    return respond.ok(ctx, {
      docId,
      sections: allSections.sort((a, b) => a.order - b.order)
    }, "Successfully fetched sections", 200);

  } catch (error) {
    console.error('Error fetching sections:', error);
    return respond.err(ctx, "Failed to fetch sections", 500);
  }
})

export default docs;
export type DocsType = typeof docs;
