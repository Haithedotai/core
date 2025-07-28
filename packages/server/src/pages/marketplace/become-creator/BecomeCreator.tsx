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
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import Loader from "@/src/lib/components/app/Loader";
import Icon from "@/src/lib/components/custom/Icon";

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
    const isValid = name.trim();

    return (
        <Card className="w-full max-w-md mx-auto ">
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
function ReviewStep({ name, desc, photo, onBack, onSubmit, isSubmitting }: { name: string; desc: string; photo: File | null; onBack: () => void; onSubmit: () => void; isSubmitting: boolean }) {
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
        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02]">
            <CardHeader>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-4">
                    <Avatar className="size-52">
                        {preview ? <AvatarImage src={preview} alt="Profile preview" /> : <AvatarFallback>
                            <Icon name="User" className="size-12" />
                        </AvatarFallback>}
                    </Avatar>
                    <div className="w-full">
                        <Label className="text-muted-foreground">Name</Label>
                        <div className="font-medium text-xl mt-1 mb-2">{name}</div>
                        <Label className="text-muted-foreground">Description</Label>
                        <div className="text-sm mt-1 whitespace-pre-line">{desc || "No description"}</div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-between">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={onSubmit} disabled={isSubmitting}>{isSubmitting ? <Loader /> : "Submit"}</Button>
            </CardFooter>
        </Card>
    );
}

// Step 3: Success
function SuccessStep({ name }: { name: string }) {
    return (
        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02]">
            <CardHeader>
                <CardTitle className="flex justify-center">
                    <CheckCircle className="h-12 w-12 text-primary" />
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                <div>
                    <p className="text-center text-2xl font-bold">Welcome, {name}!</p>
                    <p className="text-center text-muted-foreground">
                        Congratulations! You're now a creator.
                    </p>
                </div>
                <div className="flex flex-col space-y-2 w-full">
                    <Link to="/marketplace/create" className="w-full">
                        <Button className="w-full">Start Creating</Button>
                    </Link>
                    <Link to="/marketplace" className="w-full">
                        <Button variant="outline" className="w-full">
                            Explore Marketplace
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function BecomeCreatorPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const { uploadFile } = useApi();
    const { becomeCreator, isCreator } = useHaitheApi();
    const { data: isCreatorData, isFetching: isCreatorLoading } = isCreator();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit() {
        try {
            setIsSubmitting(true);
            if (isCreatorData) {
                toast.error('You are already a creator');
                return;
            }

            const filename = `${name}-${Date.now()}.json`;

            let imageURL: string | null = null;
            if (photo) {
                const file = new File([photo], filename, { type: photo.type });
                const { cid } = await uploadFile.mutateAsync(file);
                imageURL = `https://${process.env.BUN_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${cid}`;
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
            await becomeCreator.mutateAsync({ uri: profileURL });

            setIsSuccess(true);
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit creator profile');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isCreatorLoading) {
        return <Loader />;
    }

    if (isCreatorData) {
        navigate({ to: "/marketplace/profile/$id", params: { id: "1" } });
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4">
            {step === 0 && !isSuccess && (
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
            {step === 1 && !isSuccess && (
                <ReviewStep
                    name={name}
                    desc={desc}
                    photo={photo}
                    onBack={() => setStep(0)}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
            {isSuccess && (
                <SuccessStep name={name} />
            )}
            {!isSuccess && (
                <Link to="/marketplace" className="mt-6 underline underline-offset-2 text-muted-foreground text-sm">Go Back</Link>
            )}
        </div>
    );
}