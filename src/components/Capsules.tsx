import { Flex, Grid, Heading, Link } from "@chakra-ui/react";
import { ethers } from "ethers";

const parseData = (list: any) => {
  const result = {
    count: 0,
    capsules: [],
  };
  if (list && list[0] && list[0].value && list[0].value[0]) {
    result.count = Number(list[0].value[0]);
  }
  if (list && list[1] && list[1].value && list[1].value[0]) {
    list.forEach((l: any, i: any) => {
      if (i === 0) return;
      if (l.value[1][0] === ethers.constants.AddressZero) return;
      const [
        admin,
        title,
        description,
        logo,
        walletAddress,
        walletBalance,
        paymentToken,
        paymentMin,
        createdAt,
        packedAt,
        unpackedAt,
        key,
      ] = l.value[1];
      result.capsules.push({
        slug: l.value[0],
        admin,
        title,
        description,
        logo,
        walletAddress,
        walletBalance,
        paymentToken,
        paymentMin,
        createdAt,
        packedAt,
        unpackedAt,
        key,
      });
    });
  }
  return result;
};

export const Capsules = ({ list }: { list: any }) => {
  const result = parseData(list);
  if (!result.count) return <></>;
  return (
    <div>
      <div>Count: {result.count}</div>
      <ul>
        {result.capsules &&
          result.capsules.map((capsule, i) => {
            return (
              <li key={i}>
                <Link href={capsule.slug}>{capsule.slug}</Link> -{" "}
                {capsule.title} - {capsule.admin}
              </li>
            );
          })}
      </ul>
    </div>
  );
};

Capsules.defaultProps = {
  list: [],
};
