import { useRouter } from "next/router";
import { Container, Box, Tabs } from "@interchain-ui/react";
import { useState, useEffect } from "react";
import { Proposal, Sandbox, MySpace, WeightedVoting, ProposalType } from "@/components";
import { fetchDelegations, fetchProposal, fetchValidators } from "@/hooks";
import Link from "next/link";

export interface Validator {
    validator_id: number;
    name: string;
    info: string;
    website: string;
    commission: number;
    operator_addr: string;
    stake: number;
    vote_direction: string;
  }

  export interface Delegation {
    user_id: number;
    vote_direction: string;
    weight: number;
    validator_id: number;
    delegated_amount: number;
    operator_addr: string;
  }

export default function GovInfo() {
    const router = useRouter();
    const chainName = (router.query.chain ?? 'juno') as string;
    const proposal_id = router.query.proposal;
    const [component, setComponent] = useState(0);
    const [proposal, setProposal] = useState<ProposalType>(() => ({} as ProposalType));
    const [validators, setValidators] = useState<Validator[]>([]);
    const [delegations, setDelegations] = useState<Delegation[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const fetchedProposal = await fetchProposal(chainName, proposal_id);
                const fetchedValidators = await fetchValidators(proposal_id);
                const fetchedDelegations = await fetchDelegations(proposal_id);
                fetchedValidators.sort((a: Validator, b: Validator) => b.stake - a.stake);
                setValidators(fetchedValidators);
                setProposal(fetchedProposal[0]);
                setDelegations(fetchedDelegations);
                setIsLoadingData(false);
            } catch (error) {
              console.error('Error fetching data:', error);
              setProposal(() => ({} as ProposalType));
              setIsLoadingData(false);
            }
          }
      
          fetchData();
    });

    const handleChange = (selectedOption: any) => {
        setComponent(selectedOption);
    }
    
    const contentChoser = (component_id: number) => {
        switch (component_id) {
            case 0:
                return (
                    <Proposal
                        proposal={proposal}
                        chainName={chainName}
                        validators={validators}
                        delegations={delegations}
                     />
                );
            case 1:
                return (<MySpace />);
            case 2: 
                return (<WeightedVoting />);
            case 3:
                return (<Sandbox />);
            default:
                return
        }
    }

    const content = contentChoser(component);

    return (
        <Container maxWidth="64rem" attributes={{ py: '$14' }}>
            <Box width="64rem" height="6rem">
                <Tabs
                    onActiveTabChange={handleChange}
                    defaultActiveTab={0}
                    tabs={[
                        {
                        content: <h1>Overview</h1>,
                        label: 'Overview'
                        },
                        {
                        content: <h1>Wallet Info</h1>,
                        label: 'Wallet'
                        },
                        {
                        content: <h1>Weighted Voting</h1>,
                        label: 'Weighted'
                        },
                        {
                        content: <h1>SandBox</h1>,
                        label: 'Sandbox'
                        },
                        {
                            content: <Link href='/'><h1>Home</h1></Link>,
                            label: 'Home'
                        },
                    ]}
                />
            </Box>
            <Box>
                {content}
            </Box>
        </Container>  
    )
} 