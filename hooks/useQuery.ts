const api = process.env.NEXT_PUBLIC_API_KEY;

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