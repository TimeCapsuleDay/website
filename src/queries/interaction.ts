import { useContractFunction } from "@usedapp/core";
import { Contract, utils } from "ethers";
import { TIMECAPSULE_CONTRACT } from "../constants";
import { TimeCapsule } from "../abi";

export default (functionName: string) => {
  const contract = new Contract(
    TIMECAPSULE_CONTRACT,
    new utils.Interface(TimeCapsule)
  ) as any;

  return useContractFunction(contract, functionName, {
    gasLimitBufferPercentage: 10,
  });
};
