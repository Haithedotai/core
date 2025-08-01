import { useParams } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Badge } from "@/src/lib/components/ui/badge";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { Card, CardContent, CardDescription } from "@/src/lib/components/ui/card";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useStore } from "@/src/lib/hooks/use-store";
import DashboardHeader from "../../Header";
import { Separator } from "@/src/lib/components/ui/separator";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatWithAgent() {
  const { id } = useParams({
    from: '/dashboard/agents/$id/chat'
  });

  const api = useHaitheApi();
  const orgId = useStore((s) => s.selectedOrganizationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get agent data
  const agentsQuery = api.getProjects(orgId);
  const agent = agentsQuery.data?.find((a: any) => a.id.toString() === id);

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
      // TODO: Implement actual AI agent chat when API is available
      // For now, we'll add a placeholder response

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Hello! I'm ${agent?.name || 'your AI agent'}. I'm here to help you with your tasks. Once we integrate with the AI agent APIs, I'll be able to provide real responses and assist you with your specific use cases.`,
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

  // Loading state
  if (agentsQuery.isPending) {
    return (
      <div className="min-h-full bg-background p-4 sm:p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md w-full">
          <Icon name="Bot" className="size-16 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Agent Not Found</h3>
            <p className="text-muted-foreground">
              The agent you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/agents">Back to Agents</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background flex flex-col w-full">
      {/* Header */}
      <div className="w-full flex items-center justify-between max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <DashboardHeader
          title={`Chat with ${agent.name}`}
          subtitle={`Interact with your AI agent through natural conversation.`}
          iconName="BotMessageSquare"
        />

        <Link to="/dashboard/agents/$id" params={{ id: agent.id.toString() }}>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Icon name="ArrowLeft" className="size-4" />
            Back to Agent
          </Button>
          <Button variant="outline" size="icon" className="sm:hidden">
            <Icon name="ArrowLeft" className="size-4" />
          </Button>
        </Link>
      </div>

      <Separator className="bg-border/50" />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 mt-4">
        {/* Messages */}
        <div className="flex-1 py-4 sm:py-6 space-y-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12 sm:py-20 space-y-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="BotMessageSquare" className="size-6 sm:size-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-medium">Start a conversation</h3>
                <p className="text-muted-foreground max-w-md mx-auto px-4">
                  Type a message below to begin chatting with {agent.name}.
                </p>
              </div>

              {/* Suggested prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mt-6 sm:mt-8 px-4">
                <Card className="p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow border-border/50"
                  onClick={() => setInputValue("Hello! Can you help me understand what you can do?")}>
                  <CardDescription className="text-center text-sm">
                    Ask about capabilities
                  </CardDescription>
                </Card>
                <Card className="p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow border-border/50"
                  onClick={() => setInputValue("What kind of tasks are you best at?")}>
                  <CardDescription className="text-center text-sm">
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
                  className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${message.isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground border border-border/50'
                    }`}
                >
                  <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
                  <p className={`text-xs mt-1 opacity-70`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2 sm:px-4 sm:py-3 max-w-[85%] sm:max-w-[80%] border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="Bot" className="size-3 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 mt-1 mx-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 pt-4 sm:pt-6 pb-4 sm:pb-6">
          <div className="flex gap-2 sm:gap-3">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Type your message to ${agent.name}...`}
              className="flex-1 min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none text-sm sm:text-base"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="lg"
              className="self-end px-3 sm:px-4"
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