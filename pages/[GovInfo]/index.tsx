import { Layout } from "@/components";
import { Proposal } from "@/components/voting/Voting";
import { useRouter } from "next/router";
import { Box } from "@interchain-ui/react";

export default function GovInfo() {
    const router = useRouter();
    const { json } = router.query;
    let proposal;

    if (json) {
        const jsonString = Array.isArray(json) ? json[0] : json; // Take the first value if it's an array
        proposal = JSON.parse(jsonString);
      }
    return (
        <Box>
            <p>Proposal</p>
            <p>{proposal}</p>
        </Box>  
    )
} 