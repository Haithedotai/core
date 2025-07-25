import { useMutation } from "@tanstack/react-query";
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
                toast.error("Failed to fetch data");
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
                toast.error("Failed to generate text");
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
                toast.error("Failed to generate stream");
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
    }
}