"use client";

import {
  useCurrentAccount,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { ConnectWalletMenu } from "./ConnectWalletMenu";
import { ExternalLink } from "lucide-react";

function formatSui(mist: string | bigint | undefined): string {
  if (mist == null) return "0.0";
  const val = BigInt(mist);
  const sui = Number(val) / 1e9;
  return sui.toFixed(1);
}

export const Header = () => {
  const currentAccount = useCurrentAccount();
  const { data: balance } = useSuiClientQuery(
    "getBalance",
    { owner: currentAccount?.address ?? "" },
    { enabled: Boolean(currentAccount?.address) }
  );

  const suiBalance = formatSui(balance?.totalBalance);

  return (
    <header className="relative bg-[#191921] text-white sticky top-0 z-40 flex items-center justify-between">
      {/* Frame on the left */}
      <div className="flex items-center justify-between w-full pr-4">
        <div className="left-0 top-0 bottom-0 h-full min-h-14 flex items-center pointer-events-none relative p-1">
          <img
            src="/frame.png"
            alt=""
            width={100}
            height={80}
            className="h-full w-auto max-h-20 object-contain object-left"
            aria-hidden
          />
          <div className="absolute top-1 left-1 border-black border-[1.5px] border-white rounded-sm overflow-hidden">
            <img
             src={`https://api.dicebear.com/9.x/notionists/svg?seed=${currentAccount?.address}&backgroundType=gradientLinear&backgroundColor=6B4A4C,90606A`}
             alt="Avatar"
             width={48}
             height={48}
             className=" object-cover object-center"
             aria-hidden
             />
          </div>
        </div>
        {/* top text */}
        <div className="absolute top-2 left-15 text-sm">
          SuiVenture
        </div>
        {/* middle text */}
        <button type="button" className="absolute top-8 left-15 flex gap-0.5 items-center text-sm" onClick={() => window.open("https://testnet.suivision.xyz/address/" + currentAccount?.address, "_blank")}>
          Explorer <ExternalLink size={15} />
        </button>
        {/* bottom text */}
        <div className="absolute top-14 left-5 z-50 text-sm">
          <ConnectWalletMenu />
        </div>
        <div className="relative w-20 h-10">
          <img
            src="/currency.png"
            alt="Currency Background"
            width={24}
            height={24}
            className="object-cover object-center absolute top-1 left-1 w-full"
            aria-hidden
          />
          <img
            src="/sui.png"
            alt="SUI"
            width={10}
            height={10}
            className="object-cover object-center absolute top-1 -left-2 w-8"
            aria-hidden
          />
          <span className="absolute top-1 right-1 text-white text-xs pt-2">{suiBalance} SUI</span>
        </div>
        {/* <nav className="flex items-center gap-3 z-10">
          <ConnectWalletMenu />
        </nav> */}
      </div>

      {/* Ribbon at the bottom */}
      <div className="absolute left-0 right-0 bottom-0 w-full pointer-events-none">
        <img
          src="/ribbon.png"
          alt=""
          width={400}
          height={24}
          className="w-full h-auto object-cover object-bottom"
          aria-hidden
        />
      </div>
    </header>
  );
};
