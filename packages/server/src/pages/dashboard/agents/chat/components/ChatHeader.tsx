import { Button } from "@/src/lib/components/ui/button";
import { Badge } from "@/src/lib/components/ui/badge";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import ChatHistory from "./ChatHistory";
import ModelSelector from "./ModelSelector";
import { formatEther } from "viem";

interface ChatHeaderProps {
  agent: {
    id: string;
    name: string;
    description?: string;
    status?: 'online' | 'offline' | 'busy';
  };
  conversations: any[];
  currentConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  balance?: { balance: number };
}

export default function ChatHeader({ 
  agent, 
  conversations, 
  currentConversationId, 
  onSelectConversation, 
  onNewConversation,
  balance
}: ChatHeaderProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="border-b border-border/50 px-4 py-3 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Bot" className="size-4 text-primary" />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(agent.status)}`} />
          </div>
          <div>
            <h2 className="font-semibold text-sm">{agent.name}</h2>
            <div className="flex items-center gap-2">
              {agent.description && (
                <span className="text-xs text-muted-foreground truncate max-w-32">
                  {agent.description}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ModelSelector />
        
        {/* Organization Balance */}
        {balance && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md">
            <Icon name="Wallet" className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              ${formatEther(BigInt(balance.balance))}
            </span>
          </div>
        )}
        
        <ChatHistory
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={onSelectConversation}
          onNewConversation={onNewConversation}
        />
        
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/agents/$id" params={{ id: agent.id }}>
            <Icon name="Settings" className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
} 