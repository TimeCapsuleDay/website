import { Flex, Grid, Heading, Link } from "@chakra-ui/react";
import { decryptWithPrivateKey, cipher } from "eth-crypto";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";

const parseData = async (list: any) => {
  const result = {
    capsule: null,
    messages: [],
  };
  if (list && list[0] && list[0].value && list[0].value[0]) {
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
    ] = list[0].value[0];
    result.capsule = {
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
    };
  }
  if (list && list.length) {
    list.forEach(async (l: any, i: any) => {
      if (i === 0) return;
      if (!l || !l.value || !l.value[0]) return;
      if (l.value[0] === ethers.constants.AddressZero) return;
      const [user, paymentAmount, encryptedMessage, privateKey] = l.value;
      result.messages.push({
        text: user,
        value: Number(paymentAmount) ? Number(paymentAmount) * 125 : 125,
        user,
        paymentAmount,
        encryptedMessage,
        privateKey,
      });
    });
    if (
      result.capsule &&
      result.capsule.unpackedAt &&
      result.capsule.key &&
      ethers.BigNumber.from(Math.floor(Date.now() / 1000)) >
        result.capsule.unpackedAt &&
      result.capsule.key.length === 66
    ) {
      await Promise.all(
        result.messages.map(async (message) => {
          message.encryptedMessage = await decryptWithPrivateKey(
            result.capsule.key,
            cipher.parse(message.encryptedMessage)
          );
        })
      );
    }
  }
  return result;
};

export const Messages = ({ list }: { list: any }) => {
  const [result, setResult] = useState({
    capsule: null,
    messages: [],
  });

  const [client, setClient] = useState(0);

  useEffect(() => {
    console.log("list", list);
    const getResult = async () => {
      setResult(await parseData(list));
    };
    getResult();
  }, [list]);

  useEffect(() => {
    if (window) {
      setClient(1);
    }
  }, []);

  return (
    <div>
      {result.capsule && <div>{JSON.stringify(result.capsule, null, 4)}</div>}
      <div style={{ width: "500px" }}></div>
      <ul>
        {result.messages &&
          result.messages.map((message, i) => {
            return (
              <li key={i}>
                <Link href={message.user}>{message.user}</Link> -{" "}
                {message.encryptedMessage} - {Number(message.paymentAmount)}
              </li>
            );
          })}
      </ul>
    </div>
  );
};

Messages.defaultProps = {
  list: [],
};
