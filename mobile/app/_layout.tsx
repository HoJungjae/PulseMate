// mobile/app/_layout.tsx
import { ApolloProvider } from '@apollo/client';
import { Stack } from 'expo-router';
import client from '../apollo';

export default function Layout() {
  return (
    <ApolloProvider client={client}>
      <Stack />
    </ApolloProvider>
  );
}
