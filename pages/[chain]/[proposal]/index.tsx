import { useRouter } from "next/router";
import { 
    Container, 
    Box, 
    Tabs, 
    Skeleton, 
    Icon,
    Text,
    Combobox,
} from "@interchain-ui/react";
import React, { useState, useEffect } from "react";
import { Proposal, Sandbox, MySpace, WeightedVoting, ProposalType } from "../../../components";
import { fetchDelegations, fetchProposal, fetchProposals, fetchValidators } from "../../../hooks";
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
    const [proposals, setProposals] = useState<ProposalType[]>([]);
    const [validators, setValidators] = useState<Validator[]>([]);
    const [delegations, setDelegations] = useState<Delegation[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [value, setValue] = useState<string>();
    const [input, setInput] = useState<string>(`${proposal_id}`);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoadingData(true); 
                const fetchedProposals = await fetchProposals(chainName);
                const fetchedProposal = await fetchProposal(chainName, proposal_id);
                const fetchedValidators = await fetchValidators(chainName, proposal_id);
                const fetchedDelegations = await fetchDelegations(chainName, proposal_id);
                fetchedValidators.sort((a: Validator, b: Validator) => b.stake - a.stake);
                setValidators(fetchedValidators);
                setProposal(fetchedProposal[0]);
                setProposals(fetchedProposals);
                setDelegations(fetchedDelegations);
            } catch (error) {
              console.error('Error fetching data:', error);
              setProposal(() => ({} as ProposalType));
            } finally {
                setIsLoadingData(false); 
            }
          }
      
          fetchData();
    }, [chainName, proposal_id]);

    function createLabel(id: number, title: string) {
        const word = cutStringAfterFirstWord(title)
        return `${id}: ${word}`
    }

    function cutStringAfterFirstWord(inputString: string) {
        const words = inputString.split(' ');
        return words[0];
      }

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
                return (
                    <MySpace
                        chainName={chainName}
                    />
                );
            case 2: 
                return (<WeightedVoting />);
            case 3:
                return (<Sandbox />);
            default:
                return
        }
    }

      const SkeletonE = (
        <Box
            display="flex"
            flexDirection="column"
            gap="$4"
            >
            <Skeleton
                borderRadius="$sm"
                height="$10"
                width="$26"
            />
            <Skeleton
                borderRadius="$sm"
                height="$10"
                width="$30"
            />
            <Skeleton
                borderRadius="$sm"
                height="$10"
                width="$20"
            />
        </Box>
      )

    const content = contentChoser(component);
    return (
        <Container maxWidth="64rem" attributes={{ py: '$14' }}>
            <Box display="flex" height="8rem">
                <Box width="3rem">
                    <Box mr="2rem">
                        <Link href="/">
                            <Icon name="arrowLeftSLine" />
                                <Text
                                attributes={{
                                    display: 'inline-Block',
                                    mt: '$2',
                                    fontSize: "ls"
                                }}
                                >
                                B
                            </Text>
                        </Link>
                    </Box>
                </Box>
                <Box width="51rem">
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
                            
                        ]}
                    />
                </Box>
                <Box 
                    width="8rem" 
                    ml="2rem"
                >
                    <Box display="flex" flexDirection="column" gap="$6" width="5rem">
                        <Combobox
                            selectedKey={value}
                            inputValue={input}
                            onInputChange={(input) => {
                                setInput(input);
                                if (!input) setValue('undefined');
                            }}
                            onSelectionChange={(value) => {
                                const name = value as string;
                                if (name) {
                                    setValue(name);
                                    console.log(name);
                                    setInput(name);
                                    router.push(`/${chainName}/${name}`);
                                }
                            }}
                            styleProps={{
                                width: {
                                mobile: "100%",
                                mdMobile: "10rem",
                                },
                            }}
                            >
                            {proposals.map((proposal) => (
                                <Combobox.Item key={proposal.proposal_id}>
                                    {createLabel(proposal.proposal_id, proposal.title)}
                                </Combobox.Item>
                            ))}
                        </Combobox>
                    </Box>
                </Box>
            </Box>
            <Box>
                {isLoadingData ? SkeletonE : content}
            </Box>
        </Container>  
    )
} 