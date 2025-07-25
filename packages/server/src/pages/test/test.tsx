import { Button } from "@/src/lib/components/ui/button";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import React, { useState } from "react";

export default function Test() {
  const api = useHaitheApi();
  const client = api.client;
  const isLoggedIn = client?.auth.isLoggedIn() || false;

  console.log(isLoggedIn);

  // --- State for each function's result ---
  const [results, setResults] = useState<{ [key: string]: any }>({});

  // --- Helper to update result ---
  const setResult = (key: string, value: any) => setResults(r => ({ ...r, [key]: value }));

  // --- HaitheClient methods ---
  const isWeb3Ready = () => {
    try {
      const ready = client?.isWeb3Ready() || false;
      setResult('isWeb3Ready', ready);
    } catch (error) {
      setResult('isWeb3Ready', error?.toString());
    }
  }

  const getAuthToken = () => {
    try {
      const token = client?.getAuthToken();
      setResult('getAuthToken', token);
    } catch (error) {
      setResult('getAuthToken', error?.toString());
    }
  }

  const profile = async () => {
    try {
      const prof = await client?.profile();
      setResult('profile', JSON.stringify(prof, null, 2));
    } catch (error) {
      setResult('profile', error?.toString());
    }
  }

  const generateApiKey = async () => {
    try {
      const apiKey = await client?.generateApiKey();
      setResult('generateApiKey', JSON.stringify(apiKey, null, 2));
    } catch (error) {
      setResult('generateApiKey', error?.toString());
    }
  }

  const disableApiKey = async () => {
    try {
      await client?.disableApiKey();
      setResult('disableApiKey', 'Success');
    } catch (error) {
      setResult('disableApiKey', error?.toString());
    }
  }

  const login = async () => {
    try {
      const token = await client?.auth.login();
      setResult('login', token);
    } catch (error) {
      setResult('login', error?.toString());
    }
  }

  const logout = async () => {
    try {
      await client?.auth.logout();
      setResult('logout', 'Success');
    } catch (error) {
      setResult('logout', error?.toString());
    }
  }

  const createOrganization = async () => {
    try {
      const organization = await client?.createOrganization("Test");
      setResult('createOrganization', JSON.stringify(organization, null, 2));
    } catch (error) {
      setResult('createOrganization', error?.toString());
    }
  }

  const getUserOrganizations = async () => {
    try {
      const organizations = await client?.getUserOrganizations();
      setResult('getUserOrganizations', JSON.stringify(organizations, null, 2));
    } catch (error) {
      setResult('getUserOrganizations', error?.toString());
    }
  }

  const getOrganization = async () => {
    try {
      const org = await client?.getOrganization(1); // placeholder id
      setResult('getOrganization', JSON.stringify(org, null, 2));
    } catch (error) {
      setResult('getOrganization', error?.toString());
    }
  }

  const updateOrganization = async () => {
    try {
      const org = await client?.updateOrganization(1, 'Updated Name'); // placeholder id/name
      setResult('updateOrganization', JSON.stringify(org, null, 2));
    } catch (error) {
      setResult('updateOrganization', error?.toString());
    }
  }

  const deleteOrganization = async () => {
    try {
      const org = await client?.deleteOrganization(1); // placeholder id
      setResult('deleteOrganization', JSON.stringify(org, null, 2));
    } catch (error) {
      setResult('deleteOrganization', error?.toString());
    }
  }

  const getOrganizationMembers = async () => {
    try {
      const members = await client?.getOrganizationMembers(1); // placeholder orgId
      setResult('getOrganizationMembers', JSON.stringify(members, null, 2));
    } catch (error) {
      setResult('getOrganizationMembers', error?.toString());
    }
  }

  const addOrganizationMember = async () => {
    try {
      const member = await client?.addOrganizationMember(1, '0x5071437be4b13e62522D2b48E9514FF36f68641d', 'member'); // placeholder orgId/address/role
      setResult('addOrganizationMember', JSON.stringify(member, null, 2));
    } catch (error) {
      setResult('addOrganizationMember', error?.toString());
    }
  }

  const updateOrganizationMemberRole = async () => {
    try {
      const member = await client?.updateOrganizationMemberRole(1, '0x5071437be4b13e62522D2b48E9514FF36f68641d', 'member'); // placeholder orgId/address/role
      setResult('updateOrganizationMemberRole', JSON.stringify(member, null, 2));
    } catch (error) {
      setResult('updateOrganizationMemberRole', error?.toString());
    }
  }

  const removeOrganizationMember = async () => {
    try {
      const member = await client?.removeOrganizationMember(1, '0xAA1bfB4D4eCDbc78A6f929D829fded3710D070D0'); // placeholder orgId/address
      setResult('removeOrganizationMember', JSON.stringify(member, null, 2));
    } catch (error) {
      setResult('removeOrganizationMember', error?.toString());
    }
  }

  const createProject = async () => {
    try {
      const project = await client?.createProject(1, 'Test 3'); // placeholder orgId/name
      setResult('createProject', JSON.stringify(project, null, 2));
    } catch (error) {
      setResult('createProject', error?.toString());
    }
  }

  const getProject = async () => {
    try {
      const project = await client?.getProject(1); // placeholder id
      setResult('getProject', JSON.stringify(project, null, 2));
    } catch (error) {
      setResult('getProject', error?.toString());
    }
  }

  const updateProject = async () => {
    try {
      const project = await client?.updateProject(1, 'Updated Project'); // placeholder id/name
      setResult('updateProject', JSON.stringify(project, null, 2));
    } catch (error) {
      setResult('updateProject', error?.toString());
    }
  }

  const deleteProject = async () => {
    try {
      const project = await client?.deleteProject(1); // placeholder id
      setResult('deleteProject', JSON.stringify(project, null, 2));
    } catch (error) {
      setResult('deleteProject', error?.toString());
    }
  }

  const getProjectMembers = async () => {
    try {
      const members = await client?.getProjectMembers(1); // placeholder projectId
      setResult('getProjectMembers', JSON.stringify(members, null, 2));
    } catch (error) {
      setResult('getProjectMembers', error?.toString());
    }
  }

  const addProjectMember = async () => {
    try {
      const member = await client?.addProjectMember(1, '0x123', 'developer'); // placeholder projectId/address/role
      setResult('addProjectMember', JSON.stringify(member, null, 2));
    } catch (error) {
      setResult('addProjectMember', error?.toString());
    }
  }

  const updateProjectMemberRole = async () => {
    try {
      const member = await client?.updateProjectMemberRole(1, '0x123', 'admin'); // placeholder projectId/address/role
      setResult('updateProjectMemberRole', JSON.stringify(member, null, 2));
    } catch (error) {
      setResult('updateProjectMemberRole', error?.toString());
    }
  }

  const removeProjectMember = async () => {
    try {
      const member = await client?.removeProjectMember(1, '0x123'); // placeholder projectId/address
      setResult('removeProjectMember', JSON.stringify(member, null, 2));
    } catch (error) {
      setResult('removeProjectMember', error?.toString());
    }
  }

  // Helper component for test sections
  const TestSection = ({ title, children, variant = "default" }: {
    title: string,
    children: React.ReactNode,
    variant?: "default" | "primary" | "secondary"
  }) => {
    const getBorderColor = () => {
      switch (variant) {
        case "primary": return "border-primary/20";
        case "secondary": return "border-secondary/30";
        default: return "border-border";
      }
    };

    const getHeaderColor = () => {
      switch (variant) {
        case "primary": return "text-primary";
        case "secondary": return "text-muted-foreground";
        default: return "text-foreground";
      }
    };

    return (
      <div className={`bg-card border ${getBorderColor()} rounded-lg p-6 space-y-4`}>
        <h3 className={`text-lg font-semibold ${getHeaderColor()}`}>{title}</h3>
        <div className="space-y-3">
          {children}
        </div>
      </div>
    );
  };

  // Helper component for test items
  const TestItem = ({ label, onClick, result, variant = "default" }: {
    label: string,
    onClick: () => void,
    result: any,
    variant?: "default" | "destructive"
  }) => (
    <div className="space-y-2">
      <Button
        onClick={onClick}
        variant={variant === "destructive" ? "destructive" : "outline"}
        className="w-full justify-start text-left"
      >
        {label}
      </Button>
      {result !== undefined && (
        <div className="bg-muted/50 border border-border/50 rounded-md p-3">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all font-mono">
            {String(result)}
          </pre>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">HaitheClient Test Suite</h1>
          <p className="text-muted-foreground">
            Test and debug your HaitheClient integration
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
            <div className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-red-500'}`} />
            {isLoggedIn ? 'Logged In' : 'Not Logged In'}
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* Client Status & Auth */}
          <TestSection title="Client Status & Authentication" variant="primary">
            <TestItem label="Check Web3 Ready" onClick={isWeb3Ready} result={results.isWeb3Ready} />
            <TestItem label="Get Auth Token" onClick={getAuthToken} result={results.getAuthToken} />
            <TestItem label="Login" onClick={login} result={results.login} />
            <TestItem label="Logout" onClick={logout} result={results.logout} variant="destructive" />
          </TestSection>

          {/* Profile & API Keys */}
          <TestSection title="Profile & API Management" variant="secondary">
            <TestItem label="Get Profile" onClick={profile} result={results.profile} />
            <TestItem label="Generate API Key" onClick={generateApiKey} result={results.generateApiKey} />
            <TestItem label="Disable API Key" onClick={disableApiKey} result={results.disableApiKey} variant="destructive" />
          </TestSection>

          {/* Organizations */}
          <TestSection title="Organization Management">
            <TestItem label="Get User Organizations" onClick={getUserOrganizations} result={results.getUserOrganizations} />
            <TestItem label="Create Organization" onClick={createOrganization} result={results.createOrganization} />
            <TestItem label="Get Organization" onClick={getOrganization} result={results.getOrganization} />
            <TestItem label="Update Organization" onClick={updateOrganization} result={results.updateOrganization} />
            <TestItem label="Delete Organization" onClick={deleteOrganization} result={results.deleteOrganization} variant="destructive" />
          </TestSection>

          {/* Organization Members */}
          <TestSection title="Organization Members">
            <TestItem label="Get Members" onClick={getOrganizationMembers} result={results.getOrganizationMembers} />
            <TestItem label="Add Member" onClick={addOrganizationMember} result={results.addOrganizationMember} />
            <TestItem label="Update Member Role" onClick={updateOrganizationMemberRole} result={results.updateOrganizationMemberRole} />
            <TestItem label="Remove Member" onClick={removeOrganizationMember} result={results.removeOrganizationMember} variant="destructive" />
          </TestSection>

          {/* Projects */}
          <TestSection title="Project Management">
            <TestItem label="Create Project" onClick={createProject} result={results.createProject} />
            <TestItem label="Get Project" onClick={getProject} result={results.getProject} />
            <TestItem label="Update Project" onClick={updateProject} result={results.updateProject} />
            <TestItem label="Delete Project" onClick={deleteProject} result={results.deleteProject} variant="destructive" />
          </TestSection>

          {/* Project Members */}
          <TestSection title="Project Members">
            <TestItem label="Get Members" onClick={getProjectMembers} result={results.getProjectMembers} />
            <TestItem label="Add Member" onClick={addProjectMember} result={results.addProjectMember} />
            <TestItem label="Update Member Role" onClick={updateProjectMemberRole} result={results.updateProjectMemberRole} />
            <TestItem label="Remove Member" onClick={removeProjectMember} result={results.removeProjectMember} variant="destructive" />
          </TestSection>

        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t border-border pt-6">
          <p>All tests use placeholder data for demonstration purposes</p>
        </div>
      </div>
    </div>
  )
}
