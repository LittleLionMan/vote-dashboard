import { Box, Text } from "@interchain-ui/react"
import { useChain } from "@cosmos-kit/react";
import { VotingProps } from "./Voting";
import { Wallet } from "../wallet";

export function MySpace({ chainName }: VotingProps) {
    const { address } = useChain(chainName);
    
    const wallet = (
        <Wallet chainName={chainName} />
    )
    const content = (
        <Box>
            Wallet is connected
        </Box>
    )

    return (
        <Box mb="$20" position="relative">
            {address ? content : wallet}
        </Box>
    )
}