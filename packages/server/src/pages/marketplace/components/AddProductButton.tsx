import { toast } from "sonner";
import { Button } from "../../../lib/components/ui/button";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import Icon from "../../../lib/components/custom/Icon";

interface AddProductButtonProps {
    productAddress: string;
    orgAddress: string;
}

export default function AddProductButton({ productAddress, orgAddress }: AddProductButtonProps) {
    const haithe = useHaitheApi();
    const enableProduct = haithe.enableProduct;
    const disableProduct = haithe.disableProduct;
    const { data: enabledProductAddresses, isLoading: isLoadingEnabledProducts, refetch: refetchEnabledProducts } = haithe.getEnabledProducts(orgAddress);
    const isProductAlreadyEnabled = enabledProductAddresses?.some((address) => address.toLowerCase() === productAddress.toLowerCase());

    return (
        <Button
            className="w-full"
            size="lg"
            disabled={isLoadingEnabledProducts}
            onClick={async () => {
                try {
                    if (isProductAlreadyEnabled) {
                        await disableProduct.mutateAsync({
                            product_address: productAddress,
                            org_address: orgAddress
                        })

                        refetchEnabledProducts();
                        return;
                    }

                    await enableProduct.mutateAsync({
                        product_address: productAddress,
                        org_address: orgAddress
                    })

                    refetchEnabledProducts();
                } catch (error) {
                    toast.error('Failed to add product to organization');
                    console.error(error);
                }
            }}
        >
            {isLoadingEnabledProducts ? <Icon name="LoaderCircle" className="size-4 animate-spin" /> : (enableProduct.isPending || disableProduct.isPending) ? <Icon name="LoaderCircle" className="size-4 animate-spin" /> : isProductAlreadyEnabled ? 'Disable' : 'Add to current organization'}
        </Button>
    )
}