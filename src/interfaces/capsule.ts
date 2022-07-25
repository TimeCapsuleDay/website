import { BigNumber } from "ethers";

export interface Capsule {
  slug: string;
  admin: string;
  title: string;
  description: string;
  logo: string;
  walletAddress: string;
  walletBalance: BigNumber;
  paymentToken: string;
  paymentMin: BigNumber;
  createdAt: BigNumber;
  packedAt: BigNumber;
  unpackedAt: BigNumber;
  key: string;
}
