import { useState, useEffect } from "react";
import mockData from "@/src/lib/data/mockData.json";

export interface Organization {
  id: string;
  name: string;
  description: string;
  slug: string;
  owner_id: string;
  avatar_url: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  slug: string;
  organization_id: string;
  creator_id: string;
  status: "active" | "development" | "paused" | "archived";
  privacy: "public" | "private" | "organization";
  model_type: "conversational" | "analysis" | "generation" | "classification";
  settings: {
    model_config: {
      temperature: number;
      max_tokens: number;
      context_window: number;
    };
    features: {
      memory_enabled: boolean;
      analytics_enabled: boolean;
      api_access: boolean;
    };
  };
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationData {
  name: string;
  description?: string;
  website?: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  model_type: Project["model_type"];
  privacy: Project["privacy"];
  tags?: string[];
}

// Mock API functions - replace with actual API calls later
export const useOrganizations = (userId?: string) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock API call
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter organizations where user is a member
        const userOrgs = mockData.organizations.filter(org => 
          mockData.organization_members.some(member => 
            member.organization_id === org.id && 
            member.user_id === userId || "user_1" // Default for testing
          )
        ) as Organization[];
        
        setOrganizations(userOrgs);
      } catch (err) {
        setError("Failed to fetch organizations");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [userId]);

  const createOrganization = async (data: CreateOrganizationData): Promise<Organization> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newOrg: Organization = {
        id: `org_${Date.now()}`,
        name: data.name,
        description: data.description || "",
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        owner_id: userId || "user_1",
        avatar_url: null,
        website: data.website || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setOrganizations(prev => [...prev, newOrg]);
      return newOrg;
    } catch (err) {
      setError("Failed to create organization");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    organizations,
    loading,
    error,
    createOrganization,
  };
};

export const useProjects = (organizationId?: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    
    const fetchProjects = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const orgProjects = mockData.projects.filter(project => 
          project.organization_id === organizationId
        ) as Project[];
        
        setProjects(orgProjects);
      } catch (err) {
        setError("Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [organizationId]);

  const createProject = async (data: CreateProjectData, userId?: string): Promise<Project> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newProject: Project = {
        id: `project_${Date.now()}`,
        name: data.name,
        description: data.description || "",
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        organization_id: organizationId!,
        creator_id: userId || "user_1",
        status: "development",
        privacy: data.privacy,
        model_type: data.model_type,
        settings: {
          model_config: {
            temperature: 0.7,
            max_tokens: 2048,
            context_window: 8192,
          },
          features: {
            memory_enabled: true,
            analytics_enabled: true,
            api_access: false,
          },
        },
        tags: data.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError("Failed to create project");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
  };
};

// Helper function to check if user has completed onboarding
export const useOnboardingStatus = (userId?: string) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check if user has any organizations
        const userHasOrg = mockData.organization_members.some(member => 
          member.user_id === userId || "user_1"
        );
        
        setHasCompletedOnboarding(userHasOrg);
      } catch (err) {
        setHasCompletedOnboarding(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [userId]);

  const markOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
  };

  return {
    hasCompletedOnboarding,
    loading,
    markOnboardingComplete,
  };
}; 