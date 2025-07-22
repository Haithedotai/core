import { useParams } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Badge } from "@/src/lib/components/ui/badge";
import { Textarea } from "@/src/lib/components/ui/textarea";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { useApi } from "@/src/lib/hooks/use-api";
import { mockModels } from "@/src/lib/data/mockModels";

interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
}

export default function ChatbotPage() {
    const { id } = useParams({
        from: '/model/$id/chat'
    });

    // Find the model by ID
    const model = useMemo(() => {
        return mockModels.find(m => m.id === id);
    }, [id]);

    // Chatbot state and functionality
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { generateStream, streamResponse } = useApi();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
        }
    };

    const handleSendMessage = () => {
        if (inputValue.trim() === "") return;

        const newMessage: Message = {
            id: Date.now().toString(),
            content: inputValue,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newMessage]);
        const currentPrompt = inputValue;
        setInputValue("");
        setIsTyping(true);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        // Create initial empty bot message for streaming
        const botMessageId = `bot-${Date.now()}`;
        const initialBotMessage: Message = {
            id: botMessageId,
            content: "",
            isUser: false,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, initialBotMessage]);

        // Call the actual AI stream API
        generateStream.mutate(currentPrompt, {
            onSuccess: () => {
                setIsTyping(false);
            },
            onError: () => {
                setIsTyping(false);
                // Update the bot message with error content
                setMessages(prev => prev.map(msg =>
                    msg.id === botMessageId
                        ? { ...msg, content: "Sorry, I encountered an error while processing your request. Please try again." }
                        : msg
                ));
            }
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        adjustTextareaHeight();
    };

    // Effect to handle streaming response
    useEffect(() => {
        if (streamResponse) {
            setMessages(prev => {
                // Find the last bot message and update it with streaming content
                const updatedMessages = [...prev];
                for (let i = updatedMessages.length - 1; i >= 0; i--) {
                    if (!updatedMessages[i].isUser && updatedMessages[i].content !== streamResponse) {
                        updatedMessages[i] = { ...updatedMessages[i], content: streamResponse };
                        break;
                    }
                }
                return updatedMessages;
            });
        }
    }, [streamResponse]);

    // If model not found, show error state
    if (!model) {
        return (
            <div className="min-h-full bg-background">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="text-center">
                        <Icon name="Brain" className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">Model Not Found</h1>
                        <p className="text-muted-foreground mb-6">
                            The model with ID "{id}" could not be found.
                        </p>
                        <Link to="/">
                            <Button>
                                <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
                                Back to Browse Models
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-background flex flex-col">
            <div className="flex-shrink-0 max-w-7xl mx-auto px-6 py-4 w-full">
                <div className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Link to="/">
                                <Button variant="outline" className="w-full @sm/main:w-auto">
                                    <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <Link to="/" className="hover:text-primary transition-colors">
                                Browse Models
                            </Link>
                            <Icon name="ChevronRight" className="h-4 w-4" />
                            <span className="text-foreground truncate">{model.name}</span>
                        </div>
                        <div className="flex gap-2">
                            {model.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto bg-background overflow-hidden px-6">
                {/* Chat Messages */}
                <div className="flex-1 p-6 overflow-y-auto bg-background min-h-0">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                                <Icon name="MessageSquare" className="w-8 h-8 text-accent-foreground" />
                            </div>
                            <h4 className="text-xl font-semibold text-foreground mb-2">Start chatting with {model.name}</h4>
                            <p className="text-muted-foreground max-w-md">Ask questions, get insights, and explore what this {model.type.toLowerCase()} model can do for you.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((message, index) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`flex gap-3 max-w-[80%] ${message.isUser ? "flex-row-reverse" : "flex-row"}`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${message.isUser
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-secondary-foreground"
                                            }`}>
                                            {message.isUser ? "You" : "AI"}
                                        </div>

                                        {/* Message bubble */}
                                        <div className={`px-4 py-3 rounded-lg shadow-sm border ${message.isUser
                                            ? "bg-primary text-primary-foreground border-border rounded-br-sm"
                                            : "bg-card text-card-foreground border-border rounded-bl-sm"
                                            }`}>
                                            {/* Show typing indicator if this is an empty bot message and typing is active */}
                                            {!message.isUser && message.content === "" && isTyping ? (
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                                    <p className={`text-xs mt-2 ${message.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                                                        }`}>
                                                        {message.timestamp.toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t border-border bg-card p-4">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <Textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress}
                                placeholder="Type your message..."
                                rows={1}
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                                Press Enter to send
                            </div>
                        </div>
                        <Button
                            onClick={handleSendMessage}
                            disabled={inputValue.trim() === ""}
                            className="px-6 py-4 rounded-md transition-all duration-200"
                            variant="default"
                        >
                            <Icon name="SendHorizontal" className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}