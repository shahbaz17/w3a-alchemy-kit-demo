import { clientEnv } from "@/env/client.mjs";
import { sepolia } from "viem/chains";

export const chain = sepolia;
export const isDev = clientEnv.NEXT_PUBLIC_ENV === "development";
export const web3authClientID = clientEnv.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;
export const gasManagerPolicyId =
  clientEnv.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID!;
