import {
  ArrowForwardIcon,
  AtSignIcon,
  CheckCircleIcon,
  EditIcon,
  EmailIcon,
  InfoOutlineIcon,
  LockIcon,
  MoonIcon,
  PlusSquareIcon,
  SunIcon,
  UnlockIcon,
  ViewIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Grid,
  Text,
  Image,
  VStack,
  Container,
  Center,
  Heading,
  GridItem,
  HStack,
  Stack,
  InputGroup,
  Input,
  InputLeftElement,
  Textarea,
  Badge,
  Stat,
  StatHelpText,
  useDisclosure,
  ModalOverlay,
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  ButtonGroup,
  IconButton,
  Box,
  Spacer,
  Tag,
  Avatar,
  TagLabel,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Spinner,
  useColorMode,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import EthCrypto from "eth-crypto";
import { Contract, ethers } from "ethers";
import {
  useCalls,
  useContractFunction,
  useEthers,
  useTokenAllowance,
} from "@usedapp/core";

import { interaction, messages } from "../queries";
import { ERC20 } from "../abi";
import { TIMECAPSULE_CONTRACT } from "../constants";
import { useRouter } from "next/router";

import {
  MdTitle,
  MdDescription,
  MdImage,
  MdGeneratingTokens,
  MdOutlineAccountBalanceWallet,
  MdDateRange,
} from "react-icons/md";
import { BitTorrentChain } from "../utils/chains";
import Head from "next/head";

const parseData = async (list: any) => {
  const result = {
    capsule: null,
    messages: [],
  };
  if (list && list[0] && list[0].value && list[0].value[0]) {
    let [
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
    createdAt = Number(createdAt);
    packedAt = Number(packedAt);
    unpackedAt = Number(unpackedAt);
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
    list
      .filter(
        (l: any) =>
          l &&
          l.value &&
          l.value.user &&
          l.value.user !== ethers.constants.AddressZero
      )
      .forEach(async (l: any) => {
        const [user, paymentAmount, encryptedMessage, privateKey] = l.value;
        result.messages.push({
          message: user,
          user,
          paymentAmount,
          encryptedMessage,
          privateKey,
        });
      });
    if (
      result.capsule &&
      result.capsule.key &&
      result.capsule.key.length === 66
    ) {
      await Promise.all(
        result.messages.map(async (message, i) => {
          const m = await EthCrypto.decryptWithPrivateKey(
            result.capsule.key,
            EthCrypto.cipher.parse(message.encryptedMessage)
          );
          result.messages[i].message = m;
        })
      );
    }
  }
  return result;
};

const Messages = ({ value }) => (
  <VStack spacing={1}>
    {value.map((m, i) => {
      return (
        <Badge mt="10" key={i} fontSize={m.paymentAmount * 25 || 25}>
          <AtSignIcon /> {m.message}
        </Badge>
      );
    })}
  </VStack>
);

const StatusBody = ({ status }) => {
  if (status === "PendingSignature") {
    return (
      <HStack py="10">
        <Spacer />
        <Spinner size="xl" thickness="5px" textColor="gray.400" />
        <Spacer />
        <Text fontSize="sm">Pending Signature ...</Text>
        <Spacer />
      </HStack>
    );
  } else if (status === "Mining") {
    return (
      <HStack py="10">
        <Spacer />
        <Spinner size="xl" thickness="4px" textColor="green.400" />
        <Spacer />
        <Text fontSize="sm">Mining ...</Text>
        <Spacer />
      </HStack>
    );
  } else if (status === "Success") {
    return (
      <HStack py="10">
        <Spacer />
        <CheckCircleIcon fontSize="5xl" textColor="green.400" />
        <Spacer />
        <Text fontSize="sm">Success ...</Text>
        <Spacer />
      </HStack>
    );
  } else if (status === "Fail") {
    return (
      <HStack py="10">
        <Spacer />
        <WarningIcon fontSize="5xl" textColor="red.400" />
        <Spacer />
        <Text fontSize="sm">Fail ...</Text>
        <Spacer />
      </HStack>
    );
  } else if (status === "Exception") {
    return (
      <HStack py="10">
        <Spacer />
        <InfoOutlineIcon fontSize="5xl" textColor="yellow.400" />
        <Spacer />
        <Text fontSize="sm">Exception ...</Text>
        <Spacer />
      </HStack>
    );
  }
};

const Index = () => {
  const router = useRouter();
  const { slug, create } = router.query;
  const [name, setName] = useState("");

  const { account, activateBrowserWallet, switchNetwork, chainId } =
    useEthers();

  const [result, setResult] = useState({
    capsule: null,
    messages: [],
  });

  const [slugInput, setSlugInput] = useState(
    typeof slug === "object" ? slug[0] : slug
  );
  useEffect(() => {
    const firstSlug = typeof slug === "object" ? slug[0] : slug;
    if (name !== firstSlug) {
      setName(firstSlug);
    } else if (name !== slugInput) {
      setName(slugInput);
    }
  }, [slug, slugInput]);

  let [query, setQuery] = useState([]);
  useEffect(() => {
    if (name) setQuery(messages(slugInput, 10));
    if (name) router.push(`/${name}`, undefined, { shallow: true });
  }, [name]);

  const rawMessages = useCalls(query) ?? [];
  useEffect(() => {
    const getResult = async (rawMessages) => {
      setResult(await parseData(rawMessages));
    };
    getResult(rawMessages);
  }, [rawMessages]);

  let [admin, setAdmin] = useState("");
  let [title, setTitle] = useState("");
  let [description, setDescription] = useState("");
  let [logo, setLogo] = useState("");
  let [walletAddress, setWalletAddress] = useState("");
  let [encryptedMessage, setEncryptedMessage] = useState("");
  let [decryptedMessage, setDecryptedMessage] = useState("");
  let [paymentAmount, setPaymentAmount] = useState("");
  let [privateKey, setPrivateKey] = useState("");
  let [opened, setOpened] = useState(false);
  let [packed, setPacked] = useState(false);
  let [unpacked, setUnpacked] = useState(false);
  let [token, setToken] = useState("");
  let [erc20, setErc20] = useState<Contract>();

  let [paymentToken, setPaymentToken] = useState("");
  let [paymentMin, setPaymentMin] = useState("");
  let [packedAt, setPackedAt] = useState("");
  let [unpackedAt, setUnpackedAt] = useState("");
  let [key, setKey] = useState("");

  useEffect(() => {
    if (
      result.capsule &&
      result.capsule.admin &&
      result.capsule.admin !== ethers.constants.AddressZero
    ) {
      setAdmin(result.capsule.admin);
      setTitle(result.capsule.title);
      setDescription(result.capsule.description);
      setLogo(result.capsule.logo.replace("ipfs://", "https://ipfs.io/ipfs/"));
      setPaymentAmount(
        result.capsule.paymentMin > ethers.BigNumber.from(0)
          ? result.capsule.paymentMin.toString()
          : ""
      );
      setOpened(
        Number(result.capsule.packedAt) > Math.floor(Date.now() / 1000)
      );
      setPacked(
        Number(result.capsule.packedAt) < Math.floor(Date.now() / 1000) &&
          Number(result.capsule.unpackedAt) > Math.floor(Date.now() / 1000)
      );
      setUnpacked(
        Number(result.capsule.unpackedAt) < Math.floor(Date.now() / 1000)
      );
      setToken(
        result.capsule.paymentToken !== ethers.constants.AddressZero
          ? result.capsule.paymentToken
          : ""
      );
      setErc20(
        new Contract(
          result.capsule.paymentToken,
          new ethers.utils.Interface(ERC20)
        ) as any
      );
    }
  }, [result]);

  const { send: _approve, state: _stateApprove } = useContractFunction(
    erc20,
    "approve",
    {}
  );
  const { send: _create, state: _stateCreate } = interaction("create");
  const { send: _insert, state: _stateInsert } = interaction("insert");
  const { send: _update, state: _stateUpdate } = interaction("update");
  const { send: _encrypt, state: _stateEncrypt } = interaction("encrypt");
  const { send: _decrypt, state: _stateDecrypt } = interaction("decrypt");

  const allowance = useTokenAllowance(token, account, TIMECAPSULE_CONTRACT);
  const approveRequest = () => {
    preSend();
    if (
      !result.capsule ||
      !paymentAmount ||
      allowance < ethers.BigNumber.from(paymentAmount)
    )
      return;
    void _approve(TIMECAPSULE_CONTRACT, paymentAmount);
  };

  const {
    isOpen: isInsertOpen,
    onOpen: onInsertOpen,
    onClose: onInsertClose,
  } = useDisclosure();
  const insertRequest = async () => {
    preSend();
    if (!result.capsule || !result.capsule.key) return;
    void _insert(name, encryptedMessage, paymentAmount || "0");
  };

  const {
    isOpen: isUpdateOpen,
    onOpen: onUpdateOpen,
    onClose: onUpdateClose,
  } = useDisclosure();
  const updateRequest = () => {
    preSend();
    void _update(name, title, description, logo);
  };

  const {
    isOpen: isEncryptOpen,
    onOpen: onEncryptOpen,
    onClose: onEncryptClose,
  } = useDisclosure();
  const encryptRequest = () => {
    preSend();
    void _encrypt(name, "", walletAddress);
  };

  const {
    isOpen: isDecryptOpen,
    onOpen: onDecryptOpen,
    onClose: onDecryptClose,
  } = useDisclosure();
  const decryptRequest = () => {
    preSend();
    void _decrypt(name, privateKey.trim());
  };

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const createCapsule = () => {
    preSend();
    void _create(name, [
      account,
      title,
      description,
      logo,
      ethers.constants.AddressZero,
      0,
      paymentToken || ethers.constants.AddressZero,
      paymentMin || 0,
      0,
      packedAt,
      unpackedAt,
      key,
    ]);
  };

  useEffect(() => {
    if (typeof create !== "undefined") {
      void onCreateOpen();
    }
  }, [create]);

  useEffect(() => {
    if (isCreateOpen) {
      const i = EthCrypto.createIdentity();
      setKey(i.publicKey);
      setPrivateKey(i.privateKey);
      setPackedAt(Math.round(Date.now() / 1000 + 2629746 * 12) + "");
      setUnpackedAt(Math.round(Date.now() / 1000 + 2629746 * 24) + "");
    }
  }, [isCreateOpen]);

  // const {
  //   getInputProps: propsAmount,
  //   getIncrementButtonProps: incAmount,
  //   getDecrementButtonProps: decAmount,
  // } = useNumberInput({
  //   step: 1,
  //   defaultValue: paymentAmount || 0,
  //   precision: 2,
  //   min: 0,
  // });
  // const input = propsAmount();
  // const inc = incAmount();
  // const dec = decAmount();

  // const {
  //   getInputProps: propsMin,
  //   getIncrementButtonProps: incMin,
  //   getDecrementButtonProps: decMin,
  // } = useNumberInput({
  //   step: 1,
  //   defaultValue: paymentMin || 0,
  //   precision: 2,
  //   min: 0,
  // });
  // const pm = propsMin();
  // const im = incMin();
  // const dm = decMin();

  let handleMessageChange = async (e) => {
    if (!result.capsule || !result.capsule.key) return;
    let inputValue = e.target.value;
    setDecryptedMessage(inputValue);
    setEncryptedMessage(
      inputValue
        ? EthCrypto.cipher.stringify(
            await EthCrypto.encryptWithPublicKey(result.capsule.key, inputValue)
          )
        : ""
    );
  };

  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  useEffect(() => {
    if (!isDark) {
      toggleColorMode();
    }
  }, []);

  const preSend = async () => {
    if (!account) {
      activateBrowserWallet();
    }
    if (chainId !== BitTorrentChain.chainId) {
      await switchNetwork(BitTorrentChain.chainId);
    }
  };

  return (
    <Container maxW="full" p="0">
      <Head>
        <title>{name ? name + " - " : ""}TimeCapsule</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Grid
        templateAreas={`"nav header"
                  "nav main"
                  "footer footer"`}
        gridTemplateRows={"50px 1fr 30px"}
        gridTemplateColumns={"250px 1fr"}
        h="100vh"
        color="white.700"
        fontWeight="bold"
      >
        <GridItem
          pl="2"
          noOfLines={1}
          textAlign="center"
          bg="gray.900"
          area={"header"}
        >
          <Flex maxW="full" alignItems="center" gap="2">
            <Box p="2">
              <Flex
                justifyContent="center"
                alignItems="center"
                bgGradient="linear(to-l, heroGradientStart, heroGradientEnd)"
                bgClip="text"
              >
                <Heading fontSize="3xl">{title || "TimeCapsule"}</Heading>
              </Flex>
            </Box>
            <Spacer />
            <ButtonGroup gap="2" mr="4" my="1.5">
              {account ? (
                chainId !== BitTorrentChain.chainId ? (
                  <Button colorScheme="yellow" my="1" onClick={preSend}>
                    Switch Network
                  </Button>
                ) : (
                  <Tag size="lg" colorScheme="green" borderRadius="full">
                    <Avatar size="xs" name="O" ml={-1} mr={2} />
                    <TagLabel>{`${account.slice(0, 6)}...${account.slice(
                      -4
                    )}`}</TagLabel>
                  </Tag>
                )
              ) : (
                <Button
                  colorScheme="green"
                  my="1"
                  onClick={activateBrowserWallet}
                >
                  Connect
                </Button>
              )}
              {/* <IconButton
                icon={isDark ? <SunIcon /> : <MoonIcon />}
                aria-label="Toggle Theme"
                colorScheme="gray"
                onClick={toggleColorMode}
              /> */}
            </ButtonGroup>
          </Flex>
        </GridItem>
        <GridItem p="5" bg="gray.900" area={"nav"} textAlign="center">
          {logo ? (
            <Flex textAlign="center">
              <Image
                borderRadius="full"
                boxSize="100%"
                src={logo}
                alt={title}
              />
            </Flex>
          ) : (
            <Flex
              justifyContent="center"
              alignItems="center"
              bgGradient="linear(to-l, heroGradientStart, heroGradientEnd)"
              bgClip="text"
            >
              <Heading fontSize="7xl">⌛💊</Heading>
            </Flex>
          )}
          {result.capsule &&
          result.capsule.packedAt &&
          result.capsule.unpackedAt ? (
            <Stat pt="5">
              <Text textAlign="center">
                {opened && <EmailIcon />} {packed && <LockIcon />}{" "}
                {unpacked && <ViewIcon />}{" "}
                {result.capsule && <>{opened ? <>OPENED</> : <>ENCRYPTED</>}</>}
              </Text>

              <StatHelpText mt="2" textAlign="center">
                {new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                }).format(Number(result.capsule.packedAt) * 1000)}{" "}
                -{" "}
                {new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                }).format(Number(result.capsule.unpackedAt) * 1000)}
              </StatHelpText>
            </Stat>
          ) : (
            ""
          )}
          {opened && (
            <Flex my="2">
              <Button
                onClick={onInsertOpen}
                colorScheme="teal"
                size="lg"
                variant="outline"
                w="100%"
              >
                Send Message
                <ArrowForwardIcon />
              </Button>
            </Flex>
          )}
          {description ? (
            <Text
              fontSize="sm"
              bgColor="gray.700"
              p="2"
              borderRadius="xl"
              textAlign="center"
              my="2"
            >
              {description}
            </Text>
          ) : (
            <>
              <Text fontWeight="normal" fontSize="sm">
                On-chain time capsules on the BitTorrent blockchain.{" "}
              </Text>
              <List
                spacing={2}
                my={3}
                color="text"
                fontWeight="normal"
                textAlign="left"
                fontSize="xs"
              >
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="icon" />
                  Create your own date-locked time capsule.
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="icon" />
                  Pay for each message with your own token.
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="icon" />
                  Withdraw tokens when the capsule is unpacked.
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="icon" />
                  Each message is encrypted and stored on-chain forever.
                </ListItem>
              </List>
            </>
          )}
          {admin === account && (
            <>
              {result.capsule &&
                result.capsule.key &&
                result.capsule.key.length !== 66 && (
                  <ButtonGroup variant="outline" spacing="6" w="100%">
                    <IconButton
                      aria-label="Edit"
                      w="100%"
                      icon={<EditIcon />}
                      onClick={onUpdateOpen}
                    />
                    {packed && paymentAmount && (
                      <Button
                        w="100%"
                        leftIcon={<LockIcon />}
                        onClick={onEncryptOpen}
                      >
                        Encrypt
                      </Button>
                    )}
                    {unpacked &&
                      result.capsule &&
                      result.capsule.key &&
                      result.capsule.key.length !== 66 && (
                        <Button
                          w="100%"
                          leftIcon={<UnlockIcon />}
                          onClick={onDecryptOpen}
                        >
                          Decrypt
                        </Button>
                      )}
                  </ButtonGroup>
                )}
            </>
          )}
        </GridItem>
        <GridItem
          bg="gray.900"
          area={"main"}
          backgroundImage="url('https://i.imgur.com/Gy0e9of.jpeg')"
          backgroundPosition="center"
          backgroundSize="cover"
          backgroundRepeat="no-repeat"
        >
          {result.capsule && result.capsule.title ? (
            <Center
              h="100%"
              w="100%"
              backgroundColor="rgba(23, 25, 35, 0.8)"
              m="0"
              p="0"
            >
              {result.messages && result.messages.length > 0 && (
                <Messages value={result.messages}></Messages>
              )}
              {result.messages && !result.messages.length && (
                <Center h="100%" color="white">
                  <Button
                    rightIcon={<PlusSquareIcon />}
                    colorScheme="green"
                    variant="outline"
                    onClick={onInsertOpen}
                  >
                    Send First Message
                  </Button>
                </Center>
              )}
            </Center>
          ) : (
            <Center
              h="100%"
              w="100%"
              backgroundColor="rgba(23, 25, 35, 0.8)"
              m="0"
              p="0"
              color="white"
            >
              <Button
                rightIcon={<PlusSquareIcon />}
                colorScheme="blue"
                variant="outline"
                size="lg"
                onClick={onCreateOpen}
              >
                Create TimeCapsule
              </Button>
            </Center>
          )}
        </GridItem>
        <GridItem pl="2" bg="gray.900" color="gray.600" area={"footer"}>
          <HStack width="100%">
            <Text px="2">2022 (c) DApp Tech</Text>
            <Spacer />
            <Text px="2">BitTorrent Blockchain Technology</Text>
          </HStack>
        </GridItem>
      </Grid>

      <Modal isOpen={isInsertOpen} onClose={onInsertClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          {_stateInsert &&
          _stateInsert.status &&
          _stateInsert.status !== "None" ? (
            <ModalBody>
              <StatusBody status={_stateInsert.status} />
            </ModalBody>
          ) : (
            <>
              <ModalBody>
                {paymentAmount && paymentAmount !== "0" && (
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<InfoOutlineIcon color="gray.300" />}
                    />
                    <Input
                      type="text"
                      placeholder="Payment Amount"
                      value={paymentAmount}
                      onChange={(e) => {
                        setPaymentAmount(e.target.value);
                      }}
                    />
                  </InputGroup>
                )}
                <Text mb="2">
                  {encryptedMessage ? (
                    <>
                      Encrypted Message:{" "}
                      <Text
                        as="span"
                        color="gray.500"
                      >{`${encryptedMessage.slice(
                        0,
                        5
                      )}...${encryptedMessage.slice(-5)}`}</Text>
                    </>
                  ) : (
                    <>Message: </>
                  )}
                </Text>
                <Textarea
                  value={decryptedMessage}
                  onChange={handleMessageChange}
                  placeholder="The message will be stored on blockchain forever."
                  size="md"
                  borderRadius="lg"
                />
              </ModalBody>

              <ModalFooter>
                <Flex width="100%">
                  <Button
                    colorScheme="gray"
                    variant="ghost"
                    onClick={onInsertClose}
                  >
                    Close
                  </Button>
                  <Spacer />
                  {paymentAmount &&
                  allowance &&
                  allowance < ethers.BigNumber.from(paymentAmount) ? (
                    <Button
                      colorScheme="green"
                      variant="outline"
                      onClick={approveRequest}
                    >
                      {_stateApprove &&
                      _stateApprove.status &&
                      _stateApprove.status !== "None"
                        ? `${_stateApprove.status}...`
                        : `Approve ${paymentAmount}`}
                    </Button>
                  ) : (
                    <Button
                      colorScheme="green"
                      variant="outline"
                      onClick={insertRequest}
                    >
                      Send Message
                    </Button>
                  )}
                </Flex>
              </ModalFooter>

              <Spacer />
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isUpdateOpen} onClose={onUpdateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          {_stateUpdate &&
          _stateUpdate.status &&
          _stateUpdate.status !== "None" ? (
            <ModalBody>
              <StatusBody status={_stateUpdate.status} />
            </ModalBody>
          ) : (
            <>
              <ModalBody>
                <Stack spacing={4} my="2">
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<InfoOutlineIcon color="gray.300" />}
                    />
                    <Input
                      type="text"
                      placeholder="Title"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                      }}
                    />
                  </InputGroup>

                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<InfoOutlineIcon color="gray.300" />}
                    />
                    <Input
                      type="text"
                      placeholder="Description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                      }}
                    />
                  </InputGroup>

                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<InfoOutlineIcon color="gray.300" />}
                    />
                    <Input
                      type="text"
                      placeholder="Logo"
                      value={logo}
                      onChange={(e) => {
                        setLogo(e.target.value);
                      }}
                    />
                  </InputGroup>
                </Stack>
              </ModalBody>

              <ModalFooter>
                <Flex width="100%">
                  <Button
                    colorScheme="gray"
                    variant="ghost"
                    onClick={onUpdateClose}
                  >
                    Close
                  </Button>
                  <Spacer />
                  <Button
                    colorScheme="green"
                    variant="outline"
                    onClick={updateRequest}
                  >
                    Update TimeCapsule
                  </Button>
                </Flex>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isEncryptOpen} onClose={onEncryptClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          {_stateEncrypt &&
          _stateEncrypt.status &&
          _stateEncrypt.status !== "None" ? (
            <ModalBody>
              <StatusBody status={_stateEncrypt.status} />
            </ModalBody>
          ) : (
            <>
              <ModalBody>
                <Stack spacing={4} my="2">
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<InfoOutlineIcon color="gray.300" />}
                    />
                    <Input
                      type="text"
                      placeholder="Wallet Address"
                      value={walletAddress}
                      onChange={(e) => {
                        setWalletAddress(e.target.value);
                      }}
                    />
                  </InputGroup>
                  <Text fontSize="xs" m="0" p="0" color="gray.500">
                    Address for receiving tokens from the time capsule wallet.
                    15% goes to maintaining the protocol. 50% you get when you
                    encrypt the time capsule. 50% you get when you decrypt the
                    time capsule.
                  </Text>
                </Stack>
              </ModalBody>

              <ModalFooter>
                <Flex width="100%">
                  <Button
                    colorScheme="gray"
                    variant="ghost"
                    onClick={onEncryptClose}
                  >
                    Close
                  </Button>
                  <Spacer />
                  <Button
                    colorScheme="green"
                    variant="outline"
                    onClick={encryptRequest}
                  >
                    Encrypt TimeCapsule
                  </Button>
                </Flex>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isDecryptOpen} onClose={onDecryptClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          {_stateDecrypt &&
          _stateDecrypt.status &&
          _stateDecrypt.status !== "None" ? (
            <ModalBody>
              <StatusBody status={_stateDecrypt.status} />
            </ModalBody>
          ) : (
            <>
              <ModalBody>
                <Stack spacing={4} my="2">
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<InfoOutlineIcon color="gray.300" />}
                    />
                    <Input
                      type="text"
                      placeholder="Private Key"
                      value={privateKey}
                      onChange={(e) => {
                        setPrivateKey(e.target.value);
                      }}
                    />
                  </InputGroup>
                  <Text fontSize="xs" m="0" p="0" color="gray.500">
                    The private key that will decrypt all messages in the time
                    capsule. If there are tokens on the time capsule wallet, you
                    will receive them on your wallet.
                  </Text>
                </Stack>
              </ModalBody>

              <ModalFooter>
                <Flex width="100%">
                  <Button
                    colorScheme="gray"
                    variant="ghost"
                    onClick={onDecryptClose}
                  >
                    Close
                  </Button>
                  <Spacer />
                  <Button
                    colorScheme="green"
                    variant="outline"
                    onClick={decryptRequest}
                  >
                    Decrypt TimeCapsule
                  </Button>
                </Flex>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          {_stateCreate &&
          _stateCreate.status &&
          _stateCreate.status !== "None" ? (
            <ModalBody>
              <StatusBody status={_stateCreate.status} />
            </ModalBody>
          ) : (
            <>
              <ModalBody>
                <Stack spacing={4} my="2">
                  <InputGroup>
                    <InputLeftElement
                      width="150px"
                      pointerEvents="none"
                      children={
                        <Text
                          textColor={`${
                            result.capsule && result.capsule.title
                              ? "red.400"
                              : "green.400"
                          }`}
                        >
                          TimeCapsile.Day/
                        </Text>
                      }
                    />
                    <Input
                      type="text"
                      placeholder="slug"
                      pl="140px"
                      color={`${
                        result.capsule && result.capsule.title
                          ? "red.400"
                          : "green.400"
                      }`}
                      fontWeight="bold"
                      value={slugInput}
                      onChange={(e) => {
                        setSlugInput(e.target.value.toLowerCase());
                      }}
                    />
                  </InputGroup>

                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<MdTitle color="gray.300" />}
                    />
                    <Input
                      type="text"
                      placeholder="Title"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                      }}
                    />
                  </InputGroup>

                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<MdDescription color="gray.300" />}
                    />
                    <Input
                      type="text"
                      placeholder="Description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                      }}
                    />
                  </InputGroup>

                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<MdImage color="gray.300" />}
                    />
                    <Input
                      type="text"
                      placeholder="Logo"
                      value={logo}
                      onChange={(e) => {
                        setLogo(e.target.value);
                      }}
                    />
                  </InputGroup>

                  <HStack>
                    <InputGroup>
                      <InputLeftElement
                        pointerEvents="none"
                        children={<MdGeneratingTokens color="gray.300" />}
                      />
                      <Input
                        type="text"
                        placeholder="Payment Token Address"
                        value={paymentToken}
                        onChange={(e) => {
                          setPaymentToken(e.target.value);
                        }}
                      />
                    </InputGroup>

                    <InputGroup>
                      <InputLeftElement
                        pointerEvents="none"
                        children={
                          <MdOutlineAccountBalanceWallet color="gray.300" />
                        }
                      />
                      <Input
                        type="text"
                        placeholder="Payment Min Amount"
                        value={paymentMin}
                        onChange={(e) => {
                          setPaymentMin(e.target.value);
                        }}
                      />
                    </InputGroup>
                  </HStack>

                  <RangeSlider
                    aria-label={["min", "max"]}
                    colorScheme="green"
                    defaultValue={[
                      Date.now() / 1000 + 2629746 * 12,
                      Date.now() / 1000 + 2629746 * 24,
                    ]}
                    min={Date.now() / 1000}
                    max={Date.now() / 1000 + 2629746 * 12 * 10}
                    step={60}
                    onChange={(val) => {
                      setPackedAt(Math.round(val[0]) + "");
                      setUnpackedAt(Math.round(val[1]) + "");
                    }}
                  >
                    <RangeSliderTrack>
                      <RangeSliderFilledTrack />
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0} />
                    <RangeSliderThumb index={1} />
                  </RangeSlider>

                  <HStack>
                    <InputGroup>
                      <InputLeftElement
                        pointerEvents="none"
                        children={<MdDateRange color="gray.300" />}
                      />
                      <Input
                        type="text"
                        placeholder="Packed At"
                        value={new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "numeric",
                          minute: "numeric",
                        }).format(
                          packedAt && Number(packedAt)
                            ? Number(packedAt) * 1000
                            : (Date.now() / 1000 + 2629746) * 1000
                        )}
                        disabled
                      />
                    </InputGroup>

                    <InputGroup>
                      <InputLeftElement
                        pointerEvents="none"
                        children={<MdDateRange color="gray.300" />}
                      />
                      <Input
                        type="text"
                        placeholder="Unpacked At"
                        value={new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "numeric",
                          minute: "numeric",
                        }).format(
                          unpackedAt && Number(unpackedAt)
                            ? Number(unpackedAt) * 1000
                            : (Date.now() / 1000 + 2629746 * 12) * 1000
                        )}
                        disabled
                      />
                    </InputGroup>
                  </HStack>

                  <VStack>
                    <Text fontSize="sm" color="green.300">
                      Save this Private Key for decrypt all messages:
                    </Text>
                    <Text
                      fontSize="xs"
                      borderRadius="lg"
                      border="1px"
                      borderColor="green.600"
                      p="3"
                      width="100%"
                      color="gray.400"
                    >
                      {privateKey}
                    </Text>
                  </VStack>
                </Stack>
              </ModalBody>

              <ModalFooter>
                <Flex width="100%">
                  <Button
                    colorScheme="gray"
                    variant="ghost"
                    onClick={onCreateClose}
                  >
                    Close
                  </Button>
                  <Spacer />
                  <Button
                    colorScheme="green"
                    variant="outline"
                    onClick={createCapsule}
                  >
                    Create TimeCapsule
                  </Button>
                </Flex>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Index;
