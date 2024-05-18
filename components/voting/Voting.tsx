import { useState } from "react";
import { useChain } from "@cosmos-kit/react";
import {
  Box,
  GovernanceProposalItem,
  Spinner,
  Text,
  useColorModeValue,
} from "@interchain-ui/react";
import { useModal, fetchProposals, fetchUserVotes } from "@/hooks";
//import { Proposal } from "@/components";
import { formatDate } from "@/utils";
import { useEffect } from "react";
import Link from "next/link";

export interface ProposalType {
  proposal_id: number;
  chain_id: number;
  time: Date;
  status: string;
  yes_votes: number;
  no_votes: number;
  no_with_veto_votes: number;
  abstain_votes: number;
  info: string
  title: string;
  block_height: number;
  bonded_tokens: number;
  unbonded_tokens: number;
}

interface UserVote {
  vote_id: number;
  user_id: number;
  proposal_id: number;
  vote_direction: string;
  weight: number;
}

function status(s: string) {
  switch (s) {
    case "PROPOSAL_STATUS_UNSPECIFIED":
      return "pending";
    case "PROPOSAL_STATUS_DEPOSIT_PERIOD":
      return "pending";
    case "PROPOSAL_STATUS_VOTING_PERIOD":
      return "pending";
    case "PROPOSAL_STATUS_PASSED":
      return "passed";
    case "PROPOSAL_STATUS_REJECTED":
      return "rejected";
    case "PROPOSAL_STATUS_FAILED":
      return "rejected";
    default:
      return "pending";
  }
}

function votes(yes: number, no: number, abstain: number, noWithVeto: number) {
  return {
    yes: Number(yes) || 0,
    abstain: Number(abstain) || 0,
    no: Number(no) || 0,
    noWithVeto: Number(noWithVeto) || 0,
  };
}

export type VotingProps = {
  chainName: string;
};

export function Voting({ chainName }: VotingProps) {
  const { address } = useChain(chainName);
  const [proposals, setProposals] = useState<ProposalType[]>([]);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedProposals = await fetchProposals(chainName);
        setProposals(fetchedProposals.reverse());

        const fetchedVotes = await fetchUserVotes(address);
        setUserVotes(fetchedVotes);
        setIsLoadingData(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setProposals([]);
        setIsLoadingData(false);
      }
    }

    fetchData();
  }, [chainName, address]);

  function userVoteDirection(proposal: number) {
    const foundVote = userVotes.find(vote => vote.proposal_id === proposal);
    if (foundVote) {
      return foundVote.vote_direction;
    } else {
      return undefined;
    }
  }

  function voteLabelColor(vote: string | undefined) {
    switch (vote) {
      case "VOTE_OPTION_YES":
        return "$green400";
      case "VOTE_OPTION_NO":
        return "#C0C0C0"
      case "VOTE_OPTION_ABSTAIN":
        return "#FF0000"
      case "VOTE_OPTION_NO_WITH_VETO":
        return "#800080"
      default: 
        return "#FFFFFF"
    }
    
  }
  
  const content = (
    <Box mt="$12">
      {proposals.map((proposal, index) => (
        <Box
        key={proposal.proposal_id?.toString() || index}
        >
        
        <Box
          my="$8"
          key={proposal.proposal_id?.toString() || index}
          position="relative"
        >
          {userVoteDirection(proposal.proposal_id)
            ?
            (
              <Box
                position="absolute"
                px="$4"
                py="$2"
                top="$4"
                right="$6"
                borderRadius="$md"
                backgroundColor={voteLabelColor(userVoteDirection(proposal.proposal_id))}
              >
                <Text color="$white" fontSize="$xs" fontWeight="$bold">
                  Voted
                </Text>
              </Box>
            )
            : null}
          <GovernanceProposalItem
            id={`# ${proposal.proposal_id?.toString()}`}
            key={index}
            title={proposal.title || ""}
            status={status(proposal.status)}
            votes={votes(proposal.yes_votes, proposal.no_votes, proposal.abstain_votes, proposal.no_with_veto_votes)}
            endTime={formatDate(proposal.time)!}
          />
        </Box>
        <Link 
          href={`${chainName}/${proposal.proposal_id}`}
        >Details</Link>
        </Box>      
      ))}
    </Box>
  
  );
  const SpinnerE = (
    <Box>
    <Spinner
        size="$5xl"
        color={useColorModeValue("$blackAlpha800", "$whiteAlpha900")}
      />
      </Box>
  )

  const Error = (
      <Text fontWeight="200" fontSize="$xl">Failed to fetch data</Text>
  )

  const Loading = (
    <Box
      p="$8"
      borderRadius="$md"
      justifyContent="center"
      display={"flex"}
    >
      {isLoadingData ? SpinnerE : Error}
    </Box>
  );

  return (
    <Box mb="$20" position="relative">
      <Text fontWeight="600" fontSize="$2xl">Proposals</Text>

      {proposals.length == 0 ? Loading : content}
    </Box>
  );
}
