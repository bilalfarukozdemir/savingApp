import { Pressable, Text, Platform } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';

type Props = { href: string; children: React.ReactNode };

export function ExternalLink({ href, children }: Props) {
  return (
    <Pressable
      onPress={async () => {
        if (Platform.OS !== 'web') {
          await openBrowserAsync(href);
        } else {
          window.open(href, '_blank');
        }
      }}>
      <Text style={{ color: '#2196F3' }}>{children}</Text>
    </Pressable>
  );
}
