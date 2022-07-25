import { BigNumber } from "ethers";

export interface Message {
  user: string;
  paymentAmount: BigNumber;
  encryptedMessage: string;
  privateKey: string;
}
