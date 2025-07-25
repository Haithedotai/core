import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";

export default function CreatePage() {
    const { createProject } = useHaitheApi();

    return (
        <div>
            <h1>Create</h1>
        </div>
    )
}