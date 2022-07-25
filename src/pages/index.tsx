import {
  Link as ChakraLink,
  Text,
  List,
  ListIcon,
  ListItem,
  Button,
  useColorMode,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";

import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { Footer } from "../components/Footer";
import words from "../utils/words.json";
import { useEffect, useState } from "react";

const Index = () => {
  const [word, setWord] = useState("");

  useEffect(() => {
    setWord(words[Math.floor(Math.random() * words.length)]);
  }, []);

  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  useEffect(() => {
    if (!isDark) {
      toggleColorMode();
    }
  }, []);

  return (
    <Container height="100vh">
      <Hero />
      <Main>
        <Text color="subtitle" mt="50">
          On-chain time capsules on the BitTorrent blockchain.
        </Text>

        <List spacing={2} my={0} color="text">
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
      </Main>

      {/* <DarkModeSwitch /> */}
      <Footer>
        <Button
          as={ChakraLink}
          href={`/${word}?create`}
          variant="outline"
          colorScheme="green"
          rounded="button"
          flexGrow={1}
          mx={2}
          width="full"
        >
          Create ⌛ TimeCapsule 💊
        </Button>
      </Footer>
    </Container>
  );
};

export default Index;
