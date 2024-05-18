const api = process.env./*NEXT_PUBLIC_*/API_KEY;

export async function fetchProposals(chainName: string) {
    const apiUrl = api + `/chains/${chainName}/proposals`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch proposals: ${response.statusText}`);
        }
        
        const proposals = await response.json();
        return proposals;
    } catch (error) {
        console.error('Error fetching proposals:', error);
        throw error;
    }
}

export async function fetchProposal(chainName: string | string[] | undefined, proposalId: string | string[] | undefined) {
    const apiUrl = api + `/chains/${chainName}/proposals/${proposalId}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch proposal ${proposalId}: ${response.statusText}`);
        }
        
        const proposal = await response.json();
        return proposal;
    } catch (error) {
        console.error('Error fetching proposal:', error);
        throw error;
    }
}

export async function fetchUserVotes(address: string | undefined) {
    const apiUrl = api + `/user/${address}/userVotes`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch userVotes: ${response.statusText}`);
        }
        
        const userVotes = await response.json();
        return userVotes;
    } catch (error) {
        console.error('Error fetching userVotes:', error);
        throw error;
    }
}

export async function fetchValidators(proposalId: string | string[] | undefined) {
    const apiUrl = api + `/validators/${proposalId}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch Validators: ${response.statusText}`);
        }
        
        const validators = await response.json();
        return validators;
    } catch (error) {
        console.error('Error fetching Validators:', error);
        throw error;
    }
}

export async function fetchDelegations(proposalId: string | string[] | undefined) {
    const apiUrl = api + `/delegations/${proposalId}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch Delegations: ${response.statusText}`);
        }
        
        const delegations = await response.json();
        return delegations;
    } catch (error) {
        console.error('Error fetching Validators:', error);
        throw error;
    }
}