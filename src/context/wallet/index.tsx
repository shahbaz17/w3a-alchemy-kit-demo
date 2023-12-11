"use client";
import { useAlchemyProvider } from "@/hooks/useAlchemyProvider";
import { useWeb3AuthSigner } from "@/hooks/useWeb3AuthSigner";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { Address } from "@alchemy/aa-core";
import { WALLET_ADAPTERS } from "@web3auth/base";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type WalletContextProps = {
  // Functions
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  // Properties
  provider: AlchemyProvider;
  ownerAddress?: Address;
  scaAddress?: Address;
  username?: string;
  isLoggedIn: boolean;
};

const defaultUnset: any = null;
const WalletContext = createContext<WalletContextProps>({
  // Default Values
  provider: defaultUnset,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  isLoggedIn: defaultUnset,
});

export const useWalletContext = () => useContext(WalletContext);

export const WalletContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [ownerAddress, setOwnerAddress] = useState<Address>();
  const [scaAddress, setScaAddress] = useState<Address>();
  const [username, setUsername] = useState<string>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const { web3auth, signer } = useWeb3AuthSigner();
  const { provider, connectProviderToAccount, disconnectProviderFromAccount } =
    useAlchemyProvider();

  const login = useCallback(
    async (email: string) => {
      if (!web3auth || !signer) {
        throw new Error("Web3Auth not initialized");
      }

      await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
        loginProvider: "email_passwordless",
        extraLoginOptions: {
          login_hint: email,
        },
      });

      const userData = await web3auth.getUserInfo();
      if (!web3auth.connected || !userData.email) {
        throw new Error("Web3Auth login failed");
      }

      setIsLoggedIn(true);
      connectProviderToAccount(signer);
      setUsername(userData.email);
      setOwnerAddress(await provider.getAddress());
      setScaAddress(await provider.getAddress());
    },
    [web3auth, signer, connectProviderToAccount, provider]
  );

  const logout = useCallback(async () => {
    if (!web3auth) {
      throw new Error("Web3Auth not initialized");
    }
    await web3auth.logout();

    setIsLoggedIn(false);
    disconnectProviderFromAccount();
    setUsername(undefined);
    setOwnerAddress(undefined);
    setScaAddress(undefined);
  }, [web3auth, disconnectProviderFromAccount]);

  useEffect(() => {
    async function fetchData() {
      const isLoggedIn = web3auth?.connected;

      if (!isLoggedIn) {
        return;
      }

      const metadata = await web3auth.getUserInfo();
      if (!metadata.email) {
        throw new Error("Web3Auth login failed");
      }

      setIsLoggedIn(isLoggedIn);
      connectProviderToAccount(signer!);
      setUsername(metadata.email);
      setOwnerAddress(await provider.getAddress());
      setScaAddress(await provider.getAddress());
    }
    fetchData();
  }, [connectProviderToAccount, provider, web3auth, signer]);

  return (
    <WalletContext.Provider
      value={{
        login,
        logout,
        isLoggedIn,
        provider,
        ownerAddress,
        scaAddress,
        username,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
