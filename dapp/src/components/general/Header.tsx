import Link from "next/link";
import { ConnectWalletMenu } from "./ConnectWalletMenu";

export const Header = () => {
  return (
    <header className="p-2xs bg-background border-b text-foreground sticky top-0 z-40 flex items-center justify-between">
      <Link href="/gacha" className="text-xl font-semibold">
        SuiVenture
      </Link>
      <ConnectWalletMenu />
    </header>
  );
};
