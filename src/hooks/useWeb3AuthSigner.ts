import { web3authClientID } from "@/config/client";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { WalletClient, createWalletClient, custom } from "viem";
import { WalletClientSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import { useEffect, useState } from "react";

export const useWeb3AuthSigner = () => {
  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window === "undefined") {
        return { web3auth: null, signer: null };
      }

      const chainConfig = {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0xaa36a7",
        rpcTarget:
          "https://eth-sepolia.g.alchemy.com/v2/BdjUz_DXCVqlw7Xw2IxxxGFEER5qI87x",
        displayName: "Ethereum Sepolia",
        blockExplorer: "https://sepolia.etherscan.io",
        ticker: "ETH",
        tickerName: "Ethereum",
      };

      const web3auth = new Web3AuthNoModal({
        clientId: web3authClientID, // Get your Client ID from the Web3Auth Dashboard
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
        chainConfig,
      });

      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig },
      });

      const openloginAdapter = new OpenloginAdapter({
        adapterSettings: {
          uxMode: "redirect",
          whiteLabel: {
            appName: "W3A Alchemy Kit Simple Demo",
            appUrl: "https://web3auth.io",
            logoLight: "https://web3auth.io/images/web3auth-logo.svg",
            logoDark: "https://web3auth.io/images/web3auth-logo---Dark.svg",
            defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
            mode: "auto", // whether to enable dark mode. defaultValue: false
            theme: {
              primary: "#768729",
            },
            useLogoLoader: true,
          },
          mfaSettings: {
            deviceShareFactor: {
              enable: true,
              priority: 1,
              mandatory: true,
            },
            backUpShareFactor: {
              enable: true,
              priority: 2,
              mandatory: false,
            },
            socialBackupFactor: {
              enable: true,
              priority: 3,
              mandatory: false,
            },
            passwordFactor: {
              enable: true,
              priority: 4,
              mandatory: false,
            },
          },
        },
        loginSettings: {
          mfaLevel: "default",
        },
        privateKeyProvider,
      });
      web3auth.configureAdapter(openloginAdapter);
      setWeb3auth(web3auth);

      await web3auth.init();
      setProvider(web3auth.provider);
    };
    init();
  }, []);

  if (!provider) {
    return { web3auth: null, signer: null };
  }

  const web3authClient: WalletClient = createWalletClient({
    transport: custom(provider as any),
  });

  const web3authSigner: SmartAccountSigner = new WalletClientSigner(
    web3authClient as any,
    "web3auth"
  );

  return { web3auth, signer: web3authSigner };
};
