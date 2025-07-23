import { useParams } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Badge } from "@/src/lib/components/ui/badge";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { useHaitheClient } from "@/src/lib/context/services-provider";

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
    
    const client = useHaitheClient();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Show wallet connection prompt if no client
    if (!client) {
        return (
            <div className="min-h-full bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Icon name="Wallet" className="size-16 text-muted-foreground mx-auto" />
                    <div className="space-y-2">
                        <h3 className="text-xl font-medium">Wallet Required</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Please connect your wallet to use the chatbot.
                        </p>
                    </div>
                    <Button asChild>
                        <Link to="/">Connect Wallet</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue.trim(),
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // TODO: Implement actual AI model chat when API is available
            // For now, we'll add a placeholder response
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                content: "I'm a placeholder response. Once we integrate with the AI model APIs, I'll be able to provide real responses using the selected model.",
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "Sorry, I encountered an error. Please try again.",
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="min-h-full bg-background flex flex-col">
            {/* Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/model/$id" params={{ id }}>
                                <Button variant="outline" size="sm">
                                    <Icon name="ArrowLeft" className="size-4 mr-2" />
                                    Back to Model
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Chat Interface</h1>
                                <p className="text-muted-foreground">Model ID: {id}</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Ready
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6">
                {/* Messages */}
                <div className="flex-1 py-6 space-y-4 overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="text-center py-20 space-y-6">
                            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                <Icon name="MessageSquare" className="size-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-medium">Start a conversation</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Type a message below to begin chatting with the AI model.
                                </p>
                            </div>
                            
                            {/* Suggested prompts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mt-8">
                                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                                      onClick={() => setInputValue("Hello! Can you help me understand what you can do?")}>
                                    <CardDescription className="text-center">
                                        Ask about capabilities
                                    </CardDescription>
                                </Card>
                                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                                      onClick={() => setInputValue("What kind of tasks are you best at?")}>
                                    <CardDescription className="text-center">
                                        Explore use cases
                                    </CardDescription>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                                        message.isUser
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                    <p className={`text-xs mt-1 opacity-70`}>
                                        {message.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-muted rounded-lg px-4 py-3 max-w-[80%] space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="py-4 border-t border-border">
                    <div className="flex gap-3">
                        <Textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message here..."
                            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            size="lg"
                            className="self-end"
                        >
                            {isLoading ? (
                                <Icon name="Loader" className="size-4 animate-spin" />
                            ) : (
                                <Icon name="Send" className="size-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}