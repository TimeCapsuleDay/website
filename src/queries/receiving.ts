import { Contract, utils } from "ethers";
import { TIMECAPSULE_CONTRACT } from "../constants";
import { TimeCapsule } from "../abi";

const contract = new Contract(
  TIMECAPSULE_CONTRACT,
  new utils.Interface(TimeCapsule)
);

const capsules = (first: number = 1, skip: number = 0) => {
  const calls = [];

  calls.push({
    contract,
    method: "getNumberOfCapsules",
    args: [],
  });

  let i = skip <= 0 ? 1 : skip;
  for (; i <= first + skip; i++) {
    calls.push({
      contract,
      method: "getCapsuleByIdDesc",
      args: [i.toString()],
    });
  }

  return calls;
};

const messages = (slug: string, first: number = 1, skip: number = 0) => {
  const calls = [];

  calls.push({
    contract,
    method: "getCapsuleBySlug",
    args: [slug],
  });

  let i = skip <= 0 ? 1 : skip;
  for (; i <= first + skip; i++) {
    calls.push({
      contract,
      method: "messages",
      args: [slug, i.toString()],
    });
  }

  return calls;
};

export { capsules, messages };
