import NoSSR from "react-no-ssr";
import { useState } from "react";
import { CHAIN_NAME, Layout, Voting, Wallet } from "@/components";
import NoSsr from "@/components/NoSsr";


export default function Home() {
  const [chainName, setChainName] = useState(CHAIN_NAME);

  function onChainChange(chainName?: string) {
    setChainName(chainName!);
  }

  return (
    <Layout>
      <NoSsr>
        <Wallet chainName={chainName} onChainChange={onChainChange} />
        <Voting chainName={chainName} />
      </NoSsr>
    </Layout>
  );
}
