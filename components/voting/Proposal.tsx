import {
  Box,
  Button,
  GovernanceResultCard,
  GovernanceVoteBreakdown,
  Text,
} from "@interchain-ui/react";
import { ProposalType } from "./Voting";
import {
  exponentiate,
  getCoin,
  getExponent,
  percent,
} from "../../utils";
import Markdown from "react-markdown";
import React, { useState } from "react";
import { Validator, Delegation } from "../../pages/[chain]/[proposal]";

interface FilteredUser {
  userId: number;
  delegatedAmount: number;
}

export type ProposalProps = {
  proposal: ProposalType;
  chainName: string;
  validators: Validator[];
  delegations: Delegation[];
};

export function Proposal({
  proposal,
  chainName,
  validators,
  delegations
}: ProposalProps) {
  
  const [showMore, setShowMore] = useState(false);
  const coin = getCoin(chainName);
  const exponent = getExponent(chainName);
  const toggleShowMore = () => setShowMore((v) => !v);

  const isPassed = proposal.status === 'PROPOSAL_STATUS_PASSED';
  const isRejected =
    proposal.status === 'PROPOSAL_STATUS_REJECTED';

  const total = proposal.yes_votes + proposal.abstain_votes + proposal.no_votes + proposal.no_with_veto_votes;
  const totalSelfStake = sumDelegatedAmounts(delegations);
  const totalVotes = filterDelegations(delegations).length;
  const filteredUsers = filterUsersByDelegatedAmount(delegations, 1, exponent);
  const totalDustVotes = filteredUsers.length
  const totalDustStake = sumDelegatedAmountsByUsers(filteredUsers);
  const yesVotes = filterDelegations(delegations, "VOTE_OPTION_YES").length;
  const noVotes = filterDelegations(delegations, "VOTE_OPTION_NO").length;
  const abstainVotes = filterDelegations(delegations, "VOTE_OPTION_ABSTAIN").length;
  const noWithVetoVotes = filterDelegations(delegations, "VOTE_OPTION_NO_WITH_VETO").length;
  const dustYesVotes = filterUsersByDelegatedAmount(delegations, 1, exponent, "VOTE_OPTION_YES").length;
  const dustNoVotes = filterUsersByDelegatedAmount(delegations, 1, exponent, "VOTE_OPTION_NO").length;
  const dustAbstainVotes = filterUsersByDelegatedAmount(delegations, 1, exponent, "VOTE_OPTION_ABSTAIN").length;
  const dustNoWithVetoVotes = filterUsersByDelegatedAmount(delegations, 1, exponent, "VOTE_OPTION_NO_WITH_VETO").length;
  const turnout = total / proposal.bonded_tokens;

  /* function calculateTotalStake(validators: Validator[]): number {
    return validators.reduce((totalStake, validator) => totalStake + validator.stake, 0);
}

  const stake1 = proposal.bonded_tokens
  const stake2= calculateTotalStake(validators); */

  function filterDelegations(delegations: Delegation[], voteDirection?: string): Delegation[] {
      let uniqueUserIds: Set<number> = new Set();

        // Filter delegations based on vote direction and add unique user IDs to the set
        delegations.forEach(delegation => {
            if (!voteDirection || delegation.vote_direction === voteDirection) {
                uniqueUserIds.add(delegation.user_id);
            }
        });

        // Filter delegations based on unique user IDs
        let filteredDelegations: Delegation[] = [];
        delegations.forEach(delegation => {
            if (uniqueUserIds.has(delegation.user_id)) {
                filteredDelegations.push(delegation);
                uniqueUserIds.delete(delegation.user_id); // Remove user ID from set to ensure uniqueness
            }
        });

        return filteredDelegations;
    }

    function filterAndSumDelegations(delegations: Delegation[], exponent: number, voteDirection?: string): Map<number, number> {
      let uniqueUserDelegations: Map<number, number> = new Map();
      
      // Filter delegations based on vote direction and sum delegated amounts for each unique user ID
      delegations.forEach(delegation => {
          if (!voteDirection || delegation.vote_direction === voteDirection) {
              let summedDelegatedAmount = uniqueUserDelegations.get(delegation.user_id) || 0;
              summedDelegatedAmount += delegation.delegated_amount / (10 ** exponent); // Adjust delegated amount based on exponent
              uniqueUserDelegations.set(delegation.user_id, summedDelegatedAmount);
    }
  });

  return uniqueUserDelegations;
  }

// Function to filter users based on their total delegated amount
function filterUsersByDelegatedAmount(delegations: Delegation[], amount: number, exponent: number, voteDirection?: string): FilteredUser[] {
    let userDelegations = filterAndSumDelegations(delegations, exponent, voteDirection);
    let filteredUsers: FilteredUser[] = [];

    userDelegations.forEach((delegatedAmount, userId) => {
        if (delegatedAmount <= amount) {
            filteredUsers.push({userId, delegatedAmount});
        }
    });

    return filteredUsers;
}

function sumDelegatedAmountsByUsers(filteredUsers: FilteredUser[]): number {
  return filteredUsers.reduce((sum, user) => sum + user.delegatedAmount, 0);
}

  function sumDelegatedAmounts(delegations: Delegation[]): number {
      let totalDelegatedAmount = 0;

      delegations.forEach(delegation => {
          totalDelegatedAmount += delegation.delegated_amount;
      });

      return totalDelegatedAmount;
  }
  
  // @ts-ignore
  const description = proposal.info || "";
  const renderedDescription = description.length > 200
    ? showMore ? description : `${description.slice(0, 200)}...`
    : description || "";

  return (
    <Box py="$12" minWidth="40rem" maxWidth="64rem">
      <Box>
        <Text
          color="$textPrimary"
          fontSize="$lg"
          fontWeight="$bold"
          attributes={{
            marginBottom: "$10",
          }}
        >
          Proposal {proposal.proposal_id}: {proposal.title}
        </Text>
      </Box>
      {/* Description */}
      <Box mb="3rem">
        <Text
          color="$textSecondary"
          fontSize="$lg"
          fontWeight="$semibold"
          attributes={{
            marginBottom: "$8",
          }}
        >
          Description
        </Text>

        <Text fontSize="$sm" fontWeight="$normal" color="$textSecondary">
          {showMore ? <Markdown>{description}</Markdown> : renderedDescription}
        </Text>

        <Box mt="$8" width="100%" display="flex" justifyContent="center">
          <Button intent="secondary" variant="ghost" onClick={toggleShowMore}>
            {showMore ? "Show less" : "Show more"}
          </Button>
        </Box>
      </Box>
      <Box>
        <Text
            color="$textSecondary"
            fontSize="$lg"
            fontWeight="$semibold"
            attributes={{
              marginBottom: "$8",
            }}
          >
            Distribution by Stake
        </Text>
      </Box>
      <Box display="flex" gap="$17" marginBottom="$12">
        <Box display="flex" flex="1" flexDirection="column" gap="$4">
          <GovernanceVoteBreakdown
            voteType="yes"
            title="Yes"
            votePercentage={percent(proposal.yes_votes, total)}
            description={`${
              exponentiate(
                proposal.yes_votes,
                -exponent,
              ).toFixed(2)
            } ${coin.symbol}`}
          />
          <GovernanceVoteBreakdown
            voteType="abstain"
            title="Abstain"
            votePercentage={percent(proposal.abstain_votes, total)}
            description={`${
              exponentiate(
                proposal.abstain_votes,
                -exponent,
              ).toFixed(2)
            } ${coin.symbol}`}
          />
          <GovernanceVoteBreakdown
            voteType="no"
            title="No"
            votePercentage={percent(proposal.no_votes, total)}
            description={`${
              exponentiate(
                proposal.no_votes,
                -exponent,
              ).toFixed(2)
            } ${coin.symbol}`}
          />
          <GovernanceVoteBreakdown
            voteType="noWithVeto"
            title="No with veto"
            votePercentage={percent(
              proposal.no_with_veto_votes,
              total,
            )}
            description={`${
              exponentiate(
                proposal.no_with_veto_votes,
                -exponent,
              ).toFixed(2)
            } ${coin.symbol}`}
          />
        </Box>
        <Box display="flex" flexDirection="column" gap="$12">
          {isPassed
            ? (
              <GovernanceResultCard
                resultType="passed"
                label="Passed"
                votePercentage={percent(proposal.yes_votes, total - proposal.abstain_votes)}
              />
            )
            : null}
          {isRejected
            ? (
              <GovernanceResultCard
                resultType="rejected"
                label="Rejected"
                votePercentage={+(percent(
                  proposal.no_with_veto_votes,
                  total - proposal.abstain_votes,
                ) +
                  percent(proposal.no_votes, total - proposal.abstain_votes))
                  .toFixed(2)}
              />
            )
            : null}
          <GovernanceResultCard
            resultType="info"
            label="Turnout"
            votePercentage={+(turnout * 100).toFixed(2)}
          />
        </Box>
      </Box>
      <Box>
        <Text
            color="$textSecondary"
            fontSize="$lg"
            fontWeight="$semibold"
            attributes={{
              marginBottom: "$8",
            }}
          >
            Distribution by Votes
        </Text>
      </Box>
      <Box display="flex" gap="$17" marginBottom="$12">
        <Box display="flex" flex="1" flexDirection="column" gap="$4">
          <GovernanceVoteBreakdown
            voteType="yes"
            title="Yes"
            votePercentage={percent(yesVotes, totalVotes)}
            description={`${
              exponentiate(
                yesVotes,
                -0 
              )
            } Votes`}
          />
          <GovernanceVoteBreakdown
            voteType="abstain"
            title="Abstain"
            votePercentage={percent(abstainVotes, totalVotes)}
            description={`${
              exponentiate(
                abstainVotes,
                -0,
              )
            } Votes`}
          />
          <GovernanceVoteBreakdown
            voteType="no"
            title="No"
            votePercentage={percent(noVotes, totalVotes)}
            description={`${
              exponentiate(
                noVotes,
                -0,
              )
            } Votes`}
          />
          <GovernanceVoteBreakdown
            voteType="noWithVeto"
            title="No with veto"
            votePercentage={percent(
              noWithVetoVotes,
              totalVotes,
            )}
            description={`${
              exponentiate(
                noWithVetoVotes,
                -0,
              )
            } Votes`}
          />
        </Box>
        <Box display="flex" flexDirection="column" gap="$12">
          <GovernanceResultCard
            resultType="info"
            label="Total Votes"
            votePercentage={totalVotes}
          />
          <GovernanceResultCard
            resultType="info"
            label="Delegator Votes"
            votePercentage={+(totalSelfStake / total * 100).toFixed(2)}
          />
        </Box>
      </Box>
      <Box>
        <Text
            color="$textSecondary"
            fontSize="$lg"
            fontWeight="$semibold"
            attributes={{
              marginBottom: "$8",
            }}
          >
            Distribution dust wallets
        </Text>
      </Box>
      <Box display="flex" gap="$17" marginBottom="$12">
        <Box display="flex" flex="1" flexDirection="column" gap="$4">
          <GovernanceVoteBreakdown
            voteType="yes"
            title="Yes"
            votePercentage={percent(dustYesVotes, totalDustVotes)}
            description={`${
              exponentiate(
                dustYesVotes,
                -0 
              )
            } Votes`}
          />
          <GovernanceVoteBreakdown
            voteType="abstain"
            title="Abstain"
            votePercentage={percent(dustAbstainVotes, totalDustVotes)}
            description={`${
              exponentiate(
                dustAbstainVotes,
                -0,
              )
            } Votes`}
          />
          <GovernanceVoteBreakdown
            voteType="no"
            title="No"
            votePercentage={percent(dustNoVotes, totalDustVotes)}
            description={`${
              exponentiate(
                dustNoVotes,
                -0,
              )
            } Votes`}
          />
          <GovernanceVoteBreakdown
            voteType="noWithVeto"
            title="No with veto"
            votePercentage={percent(
              dustNoWithVetoVotes,
              totalDustVotes,
            )}
            description={`${
              exponentiate(
                dustNoWithVetoVotes,
                -0,
              )
            } Votes`}
          />
        </Box>
        <Box display="flex" flexDirection="column" gap="$12">
          <GovernanceResultCard
            resultType="info"
            label="Dust Wallets"
            votePercentage={+(totalDustVotes / totalVotes * 100).toFixed(2)}
          />
          <GovernanceResultCard
            resultType="info"
            label="Amount of Stake"
            votePercentage={+(totalDustStake / total * 100).toFixed(6)}
          />
        </Box>
      </Box>      
      {/*<ValidatorList
      data={validators}
      columns={[
        {
          id: 'validator',
          label: 'Validator',
          width: '196px',
          align: 'left',
          render: (validator: Validator) => (
            <ValidatorNameCell
              validatorName={validator.validatorName}
              validatorImg={validator.validatorImg}
            />
          ),
        },
        {
          id: 'stakedAmount',
          label: 'Amount Staked',
          width: '196px',
          align: 'right',
          render: (validator: Validator) => (
            <ValidatorTokenAmountCell
              amount={validator.stakedAmount}
              symbol={validator.symbol}
              formatOptions={{
                maximumFractionDigits: 4,
              }}
            />
          ),
        },
        {
          id: 'claimableRewards',
          label: 'Claimable Rewards',
          width: '196px',
          align: 'right',
          render: (validator: Validator) => (
            <ValidatorTokenAmountCell
              amount={validator.rewardsAmount}
              symbol={validator.symbol}
              formatOptions={{
                maximumFractionDigits: 4,
              }}
            />
          ),
        },
        {
          id: 'action',
          width: '196px',
          align: 'right',
          render: () => (
            <Box width='100%' display='flex' justifyContent='flex-end' alignItems='center'>
              <Button variant='solid' intent='tertiary' size='sm'>
                Manage
              </Button>
            </Box>
          ),
        },
      ]}
      tableProps={{
        minWidth: '720px',
      }}
    />*/}
    </Box>
  );
}
