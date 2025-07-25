import { PinataSDK } from "pinata";
import { env } from "@/env";

export async function uploadFile(file: File) {
    const pinata = new PinataSDK({
        pinataJwt: env.PINATA_JWT,
        pinataGateway: env.BUN_PUBLIC_PINATA_GATEWAY_URL
    })

    return await pinata.upload.public.file(file)
}