import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="pokedex">
        <Icon sf="list.bullet" />
        <Label>Pokédex</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.TabBar iconColor="#FFD700" labelStyle={{ color: "#FFD700" }} />
        <Icon sf="star.fill" />
        <Label>Favorites</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
