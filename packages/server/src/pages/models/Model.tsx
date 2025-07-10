import { useParams } from "@tanstack/react-router";
import Chatbot from "../models/Chatbot";

export default function ModelPage() {
    const { id } = useParams({ 
        from: '/model/$id'
    });

    return (
        <div
            className="h-full p-16 flex flex-col items-center justify-center"
        >
            <div className="mb-4">
                <h1 className="text-xl font-bold">Model ID: {id}</h1>
            </div>
            <Chatbot />
        </div>
    )
}