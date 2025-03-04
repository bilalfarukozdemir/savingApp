import { PropsWithChildren } from 'react';
import { View, Text } from 'react-native';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}

