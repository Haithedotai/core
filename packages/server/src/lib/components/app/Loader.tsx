import { Skeleton } from "../ui/skeleton";

export default function Loader() {
    return (
        <div className="min-h-screen w-screen bg-background flex items-center justify-center">
            <div className="text-center w-screen space-y-4">
                <div className="flex justify-center relative">
                    <video
                        src="/static/haitheAI.mp4"
                        autoPlay
                        loop
                        muted
                        className="size-28 overflow-hidden rounded-sm object-cover"
                    />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-5 rounded-sm w-28 mx-auto" />
                    <Skeleton className="h-4 rounded-sm w-16 mx-auto" />
                </div>
            </div>
        </div>
    );
}