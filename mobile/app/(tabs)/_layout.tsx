import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Vitals' }} />
      <Tabs.Screen name="add" options={{ title: 'Add Vital' }} />
    </Tabs>
  );
}
