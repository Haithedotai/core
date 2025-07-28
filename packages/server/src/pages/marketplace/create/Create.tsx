import { useState, useRef } from "react";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Label } from "@/src/lib/components/ui/label";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { X, Plus, Upload, FileText, Link, Code, Database } from "lucide-react";
import { toast } from "sonner";
import { parseEther } from "viem";
import { useNavigate } from "@tanstack/react-router";
import { useApi } from "@/src/lib/hooks/use-api";

// Define the category types
const CATEGORIES = [
    { value: "knowledge:text", label: "Text Knowledge", icon: FileText, disabled: false },
    { value: "knowledge:html", label: "HTML Knowledge", icon: Code, disabled: false },
    { value: "knowledge:pdf", label: "PDF Knowledge", icon: FileText, disabled: false },
    { value: "knowledge:csv", label: "CSV Knowledge", icon: Database, disabled: false },
    { value: "knowledge:url", label: "URL Knowledge", icon: Link, disabled: false },
    { value: "promptset", label: "Prompt Set", icon: Code, disabled: false },
    { value: "mcp", label: "MCP (Coming Soon)", icon: Code, disabled: true },
    { value: "tool:rs", label: "Rust Tool (Coming Soon)", icon: Code, disabled: true },
    { value: "tool:js", label: "JavaScript Tool (Coming Soon)", icon: Code, disabled: true },
    { value: "tool:py", label: "Python Tool (Coming Soon)", icon: Code, disabled: true },
    { value: "tool:rpc", label: "RPC Tool", icon: Code, disabled: false },
] as const;

type CategoryType = typeof CATEGORIES[number]['value'];

// RPC Tool interface
interface RpcTool {
    name: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    parameterStyle: 'query' | 'json' | 'form' | 'path';
    headers?: Record<string, string>;
    parameters: {
        [name: string]: {
            type: 'string' | 'number' | 'boolean' | 'object' | 'array';
            description: string;
            required?: boolean;
        };
    };
}

export default function CreatePage() {
    const { uploadToMarketplaceAndGetReward } = useHaitheApi();
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadFile } = useApi();
    const navigate = useNavigate();

    // Form state
    const [name, setName] = useState("");
    const [category, setCategory] = useState<CategoryType>("knowledge:text");
    const [pricePerCall, setPricePerCall] = useState("");
    const [description, setDescription] = useState("");

    // Category-specific state
    const [textContent, setTextContent] = useState("");
    const [url, setUrl] = useState("");
    const [prompts, setPrompts] = useState<string[]>([""]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // RPC Tool specific state
    const [rpcTool, setRpcTool] = useState<RpcTool>({
        name: "",
        description: "",
        method: "GET",
        url: "",
        parameterStyle: "query",
        headers: {},
        parameters: {}
    });
    const [newParameter, setNewParameter] = useState<{
        name: string;
        type: 'string' | 'number' | 'boolean' | 'object' | 'array';
        description: string;
        required: boolean;
    }>({ name: "", type: "string", description: "", required: false });
    const [newHeader, setNewHeader] = useState({ key: "", value: "" });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const addPrompt = () => {
        setPrompts([...prompts, ""]);
    };

    const removePrompt = (index: number) => {
        setPrompts(prompts.filter((_, i) => i !== index));
    };

    const updatePrompt = (index: number, value: string) => {
        const newPrompts = [...prompts];
        newPrompts[index] = value;
        setPrompts(newPrompts);
    };

    const addParameter = () => {
        if (newParameter.name && newParameter.description) {
            setRpcTool(prev => ({
                ...prev,
                parameters: {
                    ...prev.parameters,
                    [newParameter.name]: {
                        type: newParameter.type,
                        description: newParameter.description,
                        required: newParameter.required
                    }
                }
            }));
            setNewParameter({ name: "", type: "string", description: "", required: false });
        }
    };

    const removeParameter = (paramName: string) => {
        setRpcTool(prev => {
            const newParameters = { ...prev.parameters };
            delete newParameters[paramName];
            return { ...prev, parameters: newParameters };
        });
    };

    const addHeader = () => {
        if (newHeader.key && newHeader.value) {
            setRpcTool(prev => ({
                ...prev,
                headers: {
                    ...prev.headers,
                    [newHeader.key]: newHeader.value
                }
            }));
            setNewHeader({ key: "", value: "" });
        }
    };

    const removeHeader = (key: string) => {
        setRpcTool(prev => {
            const newHeaders = { ...prev.headers };
            delete newHeaders[key];
            return { ...prev, headers: newHeaders };
        });
    };

    const createFileFromContent = (content: string, filename: string): File => {
        const blob = new Blob([content], { type: 'text/plain' });
        return new File([blob], filename, { type: 'text/plain' });
    };

    const uploadToIPFS = async (data: File): Promise<string> => {
        const { cid } = await uploadFile.mutateAsync(data);
        return `${process.env.BUN_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${cid}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let file: File;
            let uploadData: any = {};

            switch (category) {
                case "knowledge:text":
                    if (!textContent.trim()) {
                        toast.error("Please enter text content");
                        return;
                    }
                    file = createFileFromContent(textContent, `${name}.txt`);
                    break;

                case "knowledge:html":
                    if (!selectedFile) {
                        toast.error("Please select an HTML file");
                        return;
                    }
                    // Convert HTML to text
                    const htmlText = await selectedFile.text();
                    file = createFileFromContent(htmlText, `${name}.html`);
                    break;

                case "knowledge:pdf":
                    if (!selectedFile) {
                        toast.error("Please select a PDF file");
                        return;
                    }
                    file = selectedFile;
                    break;

                case "knowledge:csv":
                    if (!textContent.trim()) {
                        toast.error("Please enter CSV content");
                        return;
                    }
                    file = createFileFromContent(textContent, `${name}.csv`);
                    break;

                case "knowledge:url":
                    if (!url.trim()) {
                        toast.error("Please enter a URL");
                        return;
                    }
                    file = createFileFromContent(url, `${name}.url`);
                    break;

                case "promptset":
                    if (prompts.length === 0 || prompts.every(p => !p.trim())) {
                        toast.error("Please add at least one prompt");
                        return;
                    }
                    const promptData = prompts.filter(p => p.trim());
                    file = createFileFromContent(JSON.stringify(promptData), `${name}.json`);
                    break;

                case "tool:rpc":
                    if (!rpcTool.name || !rpcTool.description || !rpcTool.url) {
                        toast.error("Please fill in all required RPC tool fields");
                        return;
                    }
                    file = createFileFromContent(JSON.stringify(rpcTool), `${name}.json`);
                    break;

                default:
                    toast.error("Unsupported category");
                    return;
            }

            // Convert USDT to wei using viem
            const priceInWei = parseEther(pricePerCall || "0");

            await uploadToMarketplaceAndGetReward.mutateAsync({
                name,
                file,
                category: category,
                pricePerCall: priceInWei,
                upload_fn: uploadToIPFS
            });

            toast.success("Item created successfully!");

            // Reset form
            setName("");
            setCategory("knowledge:text");
            setPricePerCall("");
            setDescription("");
            setTextContent("");
            setUrl("");
            setPrompts([""]);
            setSelectedFile(null);
            setRpcTool({
                name: "",
                description: "",
                method: "GET",
                url: "",
                parameterStyle: "query",
                headers: {},
                parameters: {}
            });

            navigate({ to: "/marketplace/profile/$id", params: { id: "1" } });

        } catch (error) {
            console.error("Error creating item:", error);
            toast.error("Failed to create item. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderCategorySpecificFields = () => {
        switch (category) {
            case "knowledge:text":
            case "knowledge:csv":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                placeholder={category === "knowledge:text" ? "Enter your text content..." : "Enter CSV content..."}
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                rows={10}
                                className="font-mono text-sm mt-2"
                            />
                        </div>
                    </div>
                );

            case "knowledge:html":
            case "knowledge:pdf":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="file">File Upload</Label>
                            <div className="mt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {selectedFile ? selectedFile.name : `Select ${category.split(':')[1].toUpperCase()} file`}
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={category === "knowledge:html" ? ".html,.htm" : ".pdf"}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                            {selectedFile && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                </p>
                            )}
                        </div>
                    </div>
                );

            case "knowledge:url":
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="url">URL</Label>
                            <Input
                                id="url"
                                type="url"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="mt-2"
                            />
                        </div>
                    </div>
                );

            case "promptset":
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Prompts</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addPrompt}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Prompt
                            </Button>
                        </div>
                        {prompts.map((prompt, index) => (
                            <div key={index} className="flex gap-2">
                                <Textarea
                                    placeholder={`Prompt ${index + 1}...`}
                                    value={prompt}
                                    onChange={(e) => updatePrompt(index, e.target.value)}
                                    rows={3}
                                    className="flex-1 mt-2"
                                />
                                {prompts.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removePrompt(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                );

            case "tool:rpc":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="rpc-name">Tool Name</Label>
                                <Input
                                    id="rpc-name"
                                    value={rpcTool.name}
                                    onChange={(e) => setRpcTool(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="My API Tool"
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="rpc-method">HTTP Method</Label>
                                <Select
                                    value={rpcTool.method}
                                    onValueChange={(value: 'GET' | 'POST' | 'PUT' | 'DELETE') =>
                                        setRpcTool(prev => ({ ...prev, method: value }))
                                    }
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GET">GET</SelectItem>
                                        <SelectItem value="POST">POST</SelectItem>
                                        <SelectItem value="PUT">PUT</SelectItem>
                                        <SelectItem value="DELETE">DELETE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="rpc-url">API Endpoint URL</Label>
                            <Input
                                id="rpc-url"
                                value={rpcTool.url}
                                onChange={(e) => setRpcTool(prev => ({ ...prev, url: e.target.value }))}
                                placeholder="https://api.example.com/users/:id"
                                className="mt-2"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                You can include path parameters like /user/:id. Query parameters should be hardcoded in the URL.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="rpc-description">Tool Description</Label>
                            <Textarea
                                id="rpc-description"
                                value={rpcTool.description}
                                onChange={(e) => setRpcTool(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe what this tool does..."
                                rows={3}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="rpc-parameter-style">Parameter Style</Label>
                            <Select
                                value={rpcTool.parameterStyle}
                                onValueChange={(value: 'query' | 'json' | 'form' | 'path') =>
                                    setRpcTool(prev => ({ ...prev, parameterStyle: value }))
                                }
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="query">Query Parameters</SelectItem>
                                    <SelectItem value="json">JSON Body</SelectItem>
                                    <SelectItem value="form">Form Data</SelectItem>
                                    <SelectItem value="path">Path Parameters</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Headers Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Headers (Optional)</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addHeader}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Header
                                </Button>
                            </div>
                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                <p className="font-semibold mb-2">🔒 Secure API Key Storage</p>
                                <p>You can safely include API keys and sensitive headers here. They are encrypted and stored securely in our Trusted Execution Environment (TEE).</p>
                            </div>
                            {Object.entries(rpcTool.headers || {}).map(([key, value]) => (
                                <div key={key} className="flex gap-2 items-center">
                                    <Input
                                        value={key}
                                        disabled
                                        className="flex-1 mt-2"
                                    />
                                    <Input
                                        value={value}
                                        disabled
                                        className="flex-1 mt-2"
                                        type="password"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeHeader(key)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Header name (e.g., Authorization)"
                                    value={newHeader.key}
                                    onChange={(e) => setNewHeader(prev => ({ ...prev, key: e.target.value }))}
                                    className="mt-2"
                                />
                                <Input
                                    placeholder="Header value (e.g., Bearer token)"
                                    value={newHeader.value}
                                    onChange={(e) => setNewHeader(prev => ({ ...prev, value: e.target.value }))}
                                    type="password"
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        {/* Parameters Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Parameters</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addParameter}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Parameter
                                </Button>
                            </div>
                            {Object.entries(rpcTool.parameters).map(([name, param]) => (
                                <div key={name} className="border rounded-md p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="secondary">{name}</Badge>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeParameter(name)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{param.description}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="outline">{param.type}</Badge>
                                        {param.required && <Badge variant="destructive">Required</Badge>}
                                    </div>
                                </div>
                            ))}
                            <div className="border rounded-md p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        placeholder="Parameter name"
                                        value={newParameter.name}
                                        onChange={(e) => setNewParameter(prev => ({ ...prev, name: e.target.value }))}
                                        className="mt-2"
                                    />
                                    <Select
                                        value={newParameter.type}
                                        onValueChange={(value: 'string' | 'number' | 'boolean' | 'object' | 'array') =>
                                            setNewParameter(prev => ({ ...prev, type: value }))
                                        }
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="string">String</SelectItem>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="boolean">Boolean</SelectItem>
                                            <SelectItem value="object">Object</SelectItem>
                                            <SelectItem value="array">Array</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Textarea
                                    placeholder="Parameter description"
                                    value={newParameter.description}
                                    onChange={(e) => setNewParameter(prev => ({ ...prev, description: e.target.value }))}
                                    rows={2}
                                    className="mt-2"
                                />
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="required"
                                        checked={newParameter.required}
                                        onChange={(e) => setNewParameter(prev => ({ ...prev, required: e.target.checked }))}
                                    />
                                    <Label htmlFor="required">Required parameter</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>This category is coming soon!</p>
                    </div>
                );
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Create Marketplace Item</h1>
                <p className="text-muted-foreground mt-2">
                    Upload your knowledge, prompts, or tools to the marketplace
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Provide the basic details for your marketplace item
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Item Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter a descriptive name for your item"
                                required
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={(value: CategoryType) => setCategory(value)}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => {
                                        const Icon = cat.icon;
                                        return (
                                            <SelectItem
                                                key={cat.value}
                                                value={cat.value}
                                                disabled={cat.disabled}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    {cat.label}
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your item..."
                                rows={3}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="price">Price per Call (in USDT)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={pricePerCall}
                                onChange={(e) => setPricePerCall(e.target.value)}
                                placeholder="0.001"
                                min="0"
                                step="0.000001"
                                required
                                className="mt-2"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                Set the price users will pay to access this item (will be converted to wei)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Content</CardTitle>
                        <CardDescription>
                            {category === "knowledge:text" && "Enter your text content"}
                            {category === "knowledge:html" && "Upload an HTML file (will be converted to text)"}
                            {category === "knowledge:pdf" && "Upload a PDF file"}
                            {category === "knowledge:csv" && "Enter your CSV content"}
                            {category === "knowledge:url" && "Enter the URL"}
                            {category === "promptset" && "Add multiple prompts"}
                            {category === "tool:rpc" && "Configure your RPC tool"}
                            {category.startsWith("tool:") && category !== "tool:rpc" && "Tools coming soon"}
                            {category === "mcp" && "MCP tools coming soon"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderCategorySpecificFields()}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading || uploadToMarketplaceAndGetReward.isPending}>
                        {isLoading || uploadToMarketplaceAndGetReward.isPending ? "Creating..." : "Create Item"}
                    </Button>
                </div>
            </form>
        </div>
    );
}