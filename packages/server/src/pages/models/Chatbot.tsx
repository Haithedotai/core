import { useState, useRef, useEffect } from "react";
import { Button } from "@/src/lib/components/ui/button";
import Icon from "@/src/lib/components/custom/Icon";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { useApi } from "@/src/lib/hooks/use-api";

interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
}

interface ChatbotProps {
    className?: string;
}

export default function Chatbot({ className = "" }: ChatbotProps) {
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

    return (
        <div className={`flex h-full flex-col w-full max-w-4xl mx-auto bg-card border border-border rounded-lg shadow-lg overflow-hidden ${className}`}>
            {/* Header */}
            <div className="bg-muted border-b border-border p-4">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-chart-2 rounded-full animate-pulse"></div>
                    <h3 className="font-semibold text-card-foreground text-lg">Context AI</h3>
                </div>
            </div>

            {/* Chat Box */}
            <div className="flex-1 p-6 h-[500px] overflow-y-auto bg-background">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                            <Icon name="MessageSquare" className="w-8 h-8 text-accent-foreground" />
                        </div>
                        <h4 className="text-xl font-semibold text-foreground mb-2">Welcome to AI Chat</h4>
                        <p className="text-muted-foreground max-w-md">Start a conversation by typing a message below. I'm here to help!</p>
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
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                        message.isUser 
                                            ? "bg-primary text-primary-foreground" 
                                            : "bg-secondary text-secondary-foreground"
                                    }`}>
                                        {message.isUser ? "You" : "AI"}
                                    </div>
                                    
                                    {/* Message bubble */}
                                    <div className={`px-4 py-3 rounded-lg shadow-sm border ${
                                        message.isUser
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
                                                <p className={`text-xs mt-2 ${
                                                    message.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
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
                        className="px-6 py-4 rounded-md  transition-all duration-200"
                        variant="default"
                    >
                        <Icon name="SendHorizontal" className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
