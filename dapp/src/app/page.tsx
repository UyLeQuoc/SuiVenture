"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui/utils";

export default function Home() {
  const currentAccount = useCurrentAccount();
  return (
    <div className="text-xl">
      Hello,{" "}
      {currentAccount ? formatAddress(currentAccount.address) : "Sui Friend"}!
    </div>
  );
}
