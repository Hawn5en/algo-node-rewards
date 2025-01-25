import React from "react";
import { ChakraProvider, Container } from "@chakra-ui/react";
import AlgorandRewardsTracker from "./components/AlgorandRewardsTracker";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <Container maxW="xl" centerContent>
        <QueryClientProvider client={queryClient}>
          <AlgorandRewardsTracker />
        </QueryClientProvider>
      </Container>
    </ChakraProvider>
  );
};

export default App;
