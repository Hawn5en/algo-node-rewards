import { useState } from "react";
import {
  Input,
  Button,
  Box,
  Text,
  VStack,
  Container,
  Heading,
} from "@chakra-ui/react";
import algosdk from "algosdk";
import { useQuery } from "@tanstack/react-query";
import ms from "ms";

const ALGOD_INDEXER_ADDRESS = "https://mainnet-idx.algonode.cloud";
const MIN_ROUND = 46512890;
const SPECIFIC_SENDER =
  "Y76M3MSY6DKBRHBL7C3NNDXGS5IIMQVQVUAB6MP4XEMMGVF2QWNPL226CA";

const indexerClient = new algosdk.Indexer("", ALGOD_INDEXER_ADDRESS, "");

const useAlgorandPrice = () => {
  return useQuery({
    queryKey: ["algorandPrice"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=usd"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch ALGO price from CoinGecko");
      }
      return response.json();
    },
    staleTime: ms("10m"),
  });
};

const fetchTransactions = async (walletAddress: string) => {
  let totalTxs = 0;
  let totalMicroAlgos = 0;
  let nextToken = null;
  let response: any;

  do {
    const response = await indexerClient
      .lookupAccountTransactions(walletAddress)
      .minRound(MIN_ROUND)
      .txType("pay")
      .do();

    response.transactions.forEach((tx) => {
      if (
        tx.sender === SPECIFIC_SENDER &&
        tx.paymentTransaction?.receiver === walletAddress
      ) {
        totalTxs++;
        totalMicroAlgos += Number(tx.paymentTransaction.amount);
      }
    });
    nextToken = response.nextToken;
  } while (nextToken && response?.transactions?.length > 0);

  return { totalTxs, totalAlgo: totalMicroAlgos / 1e6 };
};

const AlgorandRewardsTracker = () => {
  const [walletAddress, setWalletAddress] = useState("");
  interface Stats {
    totalTxs: number;
    totalAlgo: number;
  }

  const [stats, setStats] = useState<Stats | null>(null);
  const { data: priceData } = useAlgorandPrice();

  const handleFetch = async () => {
    if (!walletAddress) return;
    const result = await fetchTransactions(walletAddress);
    setStats(result);
  };

  return (
    <Container
      minW="100vw"
      minH="100vh"
      position="relative" // To position the ColorModeToggle absolutely within this Box
      p={4}
      centerContent
      bg="#f8fafc"
      borderRadius="lg"
      boxShadow="xl"
      backgroundColor={"blackAlpha.700"}
    >
      <Heading size="lg" mb={5} color={"teal.500"}>
        Algorand Node Rewards
      </Heading>
      <VStack spacing={4} pr={20} pl={20} width="full" maxW={1000}>
        <Input
          placeholder="Address"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          borderColor="#008080"
          focusBorderColor="#00a896"
          backgroundColor={"blackAlpha.900"}
        />
        <Button onClick={handleFetch} backgroundColor={"teal.500"} width="full">
          Fetch Rewards
        </Button>
        {stats && (
          <Box
            p={5}
            shadow="md"
            borderColor="#008080"
            borderWidth="1px"
            borderRadius="md"
            bg={"blackAlpha.900"}
            width="full"
          >
            <Text fontWeight="bold">Total Blocks: {stats.totalTxs}</Text>
            <Text fontWeight="bold">
              Total ALGO Received: {stats.totalAlgo}
            </Text>
            <Text fontWeight="bold">
              USD: ${stats.totalAlgo * (priceData?.algorand?.usd || 0)}
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default AlgorandRewardsTracker;
