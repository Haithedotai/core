import { useMutation, useQuery } from "@tanstack/react-query";
import client from "../utils/api-client";
import { toast } from "sonner";
import { useState } from "react";

export function useApi() {
    const [streamResponse, setStreamResponse] = useState("");
    return {
        streamResponse,
        welcome: useMutation({
            mutationFn: async (name: string) => {
                const result = await client.context.index.$get({
                    query: {
                        name,
                    },
                })

                const parsed = await result.json();

                if (!parsed.success) {
                    throw new Error(parsed.error);
                }

                return parsed.data;
            },
            onSuccess: (res) => {
                toast.success(`Success: ${res.name}`);
            },
            onError: (err) => {
                console.error(err);
            }
        }),
        generateText: useMutation({
            mutationFn: async (prompt: string) => {
                const result = await client.context.gemini.$post({
                    json: {
                        prompt,
                    },
                })

                const parsed = await result.json();

                if (!parsed.success) {
                    throw new Error(parsed.error);
                }
            },
            onSuccess: async () => {
                console.log("Successfully called /gemini");
            },
            onError: (err) => {
                console.error(err);
            }
        }),
        generateStream: useMutation({
            mutationFn: async (prompt: string) => {
                const result = await fetch("/api/v1/context/gemini/stream", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        prompt,
                    }),
                })

                if (!result.ok) {
                    throw new Error(`HTTP error! status: ${result.status}`);
                }

                // Reset stream response before starting
                setStreamResponse("");
                
                const reader = result.body?.pipeThrough(new TextDecoderStream()).getReader();

                if (reader) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        setStreamResponse(prev => prev + value);
                    }
                }

                return "Stream completed";
            },
            onSuccess: async () => {
                console.log("Successfully called /gemini/stream");
            },
            onError: (err) => {
                console.error('Stream error:', err);
            }
        }),

        uploadFile: useMutation({
            mutationFn: async (file: File) => {
                const result = await client.upload.index.$post({
                    form: { file },
                })

                const parsed = await result.json();

                if (!parsed.success) {
                    throw new Error(parsed.error);
                }

                return parsed.data;
            },
            onSuccess: (res) => {
                console.log("Successfully uploaded file!", res);
            },
            onError: (err) => {
                console.error(err);
            }
        }),

        // Docs API methods
        getDocsMetadata: useQuery({
            queryKey: ["docs", "metadata"],
            queryFn: async () => {
                const result = await client.docs.metadata.$get();

                const parsed = await result.json();

                if (!parsed.success) {
                    throw new Error(parsed.error);
                }

                return parsed.data;
            }
        }),

        getDocSections: (docId: string, options?: any) => useQuery({
            queryKey: ["docs", "sections", docId],
            queryFn: async () => {
                const result = await client.docs.sections[":docId"].$get({
                    param: { docId }
                });

                const parsed = await result.json();

                if (!parsed.success) {
                    throw new Error(parsed.error);
                }

                return parsed.data;
            },
            ...options
        }),

        getSectionContent: ({ docId, sectionId }: { docId: string; sectionId: string }, options?: any) => useQuery({
            queryKey: ["docs", "content", docId, sectionId],
            queryFn: async () => {
                const result = await client.docs.content[":docId"][":sectionId"].$get({
                    param: { docId, sectionId }
                });

                const parsed = await result.json();

                if (!parsed.success) {
                    throw new Error(parsed.error);
                }

                return parsed.data;
            },
            ...options
        }),
    }
}