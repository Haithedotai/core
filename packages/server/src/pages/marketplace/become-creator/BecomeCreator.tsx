import { useState } from "react";
import { Button } from "../../../lib/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../lib/components/ui/card";
import { Input } from "../../../lib/components/ui/input";
import { Textarea } from "../../../lib/components/ui/textarea";
import Upload from "../../../lib/components/custom/Upload";
import { Label } from "../../../lib/components/ui/label";
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../../../lib/components/ui/avatar";
import { useApi } from "@/src/lib/hooks/use-api";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { toast } from "sonner";

// Step 1: Form (Name, Description, Profile Photo)
function CreatorFormStep({ name, setName, desc, setDesc, photo, setPhoto, onNext }: {
    name: string;
    setName: (v: string) => void;
    desc: string;
    setDesc: (v: string) => void;
    photo: File | null;
    setPhoto: (f: File | null) => void;
    onNext: () => void;
}) {
    const isValid = name.trim() && desc.trim() && photo;

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Become a Creator</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <div>
                    <Label htmlFor="creator-name">Display Name</Label>
                    <Input
                        id="creator-name"
                        placeholder="Enter your creator name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="mt-2"
                    />
                </div>
                <div>
                    <Label htmlFor="creator-desc">About You</Label>
                    <Textarea
                        id="creator-desc"
                        placeholder="Tell us about yourself as a creator"
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        className="mt-2 min-h-24"
                    />
                </div>
                <div>
                    <Label>Profile Photo</Label>
                    <Upload setImage={setPhoto} />
                </div>
            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={onNext} disabled={!isValid}>Review</Button>
            </CardFooter>
        </Card>
    );
}

// Step 2: Review & Submit
function ReviewStep({ name, desc, photo, onBack, onSubmit }: { name: string; desc: string; photo: File | null; onBack: () => void; onSubmit: () => void }) {
    const [preview, setPreview] = useState<string | null>(null);
    // Show preview if photo is present
    React.useEffect(() => {
        if (photo) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(photo);
        } else {
            setPreview(null);
        }
    }, [photo]);

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-4">
                    <Avatar className="size-52">
                        {preview ? <AvatarImage src={preview} alt="Profile preview" /> : <AvatarFallback>?</AvatarFallback>}
                    </Avatar>
                    <div className="w-full">
                        <Label>Name</Label>
                        <div className="font-medium mt-1 mb-2">{name}</div>
                        <Label>Description</Label>
                        <div className="text-muted-foreground mt-1 whitespace-pre-line">{desc}</div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-between">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={onSubmit}>Submit</Button>
            </CardFooter>
        </Card>
    );
}

export default function BecomeCreatorPage() {
    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const { uploadFile } = useApi();
    const { registerAsCreator } = useHaitheApi();

    async function handleSubmit() {
        try {
            console.log("Submitting creator profile", { name, desc, photo });
            // filename
            const filename = `${name}-${Date.now()}.json`;

            let imageURL: string | null = null;
            if (photo) {
                const file = new File([photo], filename, { type: photo.type });
                const { cid } = await uploadFile.mutateAsync(file);
                imageURL = `https://${process.env.BUN_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${cid}`;
                console.log("Image URL", imageURL);
            }

            const profile = {
                name: name,
                description: desc,
                image: imageURL,
                "attributes": [
                    {
                        "trait_type": "location",
                        "value": "India"
                    }
                ]
            }

            const profileFile = new File([JSON.stringify(profile)], filename, { type: "application/json" });
            const { cid } = await uploadFile.mutateAsync(profileFile);
            const profileURL = `https://${process.env.BUN_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${cid}`;
            console.log("Profile URL", profileURL);
            await registerAsCreator.mutateAsync({ uri: profileURL });
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit creator profile');
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4">
            {step === 0 && (
                <CreatorFormStep
                    name={name}
                    setName={setName}
                    desc={desc}
                    setDesc={setDesc}
                    photo={photo}
                    setPhoto={setPhoto}
                    onNext={() => setStep(1)}
                />
            )}
            {step === 1 && (
                <ReviewStep
                    name={name}
                    desc={desc}
                    photo={photo}
                    onBack={() => setStep(0)}
                    onSubmit={handleSubmit}
                />
            )}
            <div className="mt-4 text-muted-foreground text-sm">Step {step + 1} of 2</div>
        </div>
    );
}