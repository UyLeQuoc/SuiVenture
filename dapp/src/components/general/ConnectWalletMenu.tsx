"use client";

import {
  ConnectButton,
  useAccounts,
  useCurrentAccount,
  useDisconnectWallet,
  useSwitchAccount,
} from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui/utils";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ConnectWalletMenu = () => {
  const currentAccount = useCurrentAccount();
  const accounts = useAccounts();
  const { mutate: switchAccount } = useSwitchAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();

  if (currentAccount) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex flex-row items-center gap-x-4xs">
          <span>{formatAddress(currentAccount.address)}</span>
          <ChevronDown size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {accounts
            .filter((account) => account.address !== currentAccount.address)
            .map((account) => (
              <DropdownMenuItem
                key={account.address}
                onSelect={() => switchAccount({ account })}
              >
                {formatAddress(account.address)}
              </DropdownMenuItem>
            ))}
          <DropdownMenuItem onSelect={() => disconnectWallet()}>
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return <ConnectButton />;
};
