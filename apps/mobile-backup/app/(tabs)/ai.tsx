import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const FAQ_ITEMS = [
  {
    q: 'How do I add a new transaction?',
    a: 'Tap the "Transaction" button in the Quick Actions section on the Dashboard, or go to the Transactions tab and tap the + button.',
  },
  {
    q: 'How does the 50/30/20 budget work?',
    a: '50% of your income goes to Needs (rent, groceries), 30% to Wants (entertainment, dining out), and 20% to Savings. Set your budget from the Dashboard.',
  },
  {
    q: 'How do I change my password?',
    a: 'Go to Profile → Security → Change Password. Enter your new password and confirm it.',
  },
  {
    q: 'Can I have multiple accounts?',
    a: 'Yes! Tap "Accounts" in Quick Actions to add bank accounts, e-wallets, cash accounts, and more.',
  },
  {
    q: 'What is net worth?',
    a: 'Net worth is the total balance across all accounts that have "Include in Net Worth" enabled. You can toggle this per account.',
  },
  {
    q: 'How do I track debt?',
    a: 'Use the "My Debts" quick action to add and track money you owe or money owed to you.',
  },
];

type SupportLinkProps = {
  icon: IconName;
  color: string;
  bg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

function SupportLink({ icon, color, bg, title, subtitle, onPress }: SupportLinkProps) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center gap-4 bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm mb-3">
      <View className="w-12 h-12 rounded-[14px] items-center justify-center" style={{ backgroundColor: bg }}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View className="flex-1">
        <Text className="font-bold text-[15px] text-gray-900">{title}</Text>
        <Text className="text-[13px] text-gray-500 mt-0.5">{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export default function HelpSupportScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-6 pt-4 pb-4 bg-white border-b border-gray-100">
        <Text className="text-[26px] font-extrabold text-[#0f172a] tracking-tight">Help & Support</Text>
        <Text className="text-[14px] text-gray-500 mt-1">How can we help you today?</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>

        {/* Contact Channels */}
        <Text className="font-bold text-[16px] text-gray-800 mb-3">Contact Us</Text>
        <SupportLink
          icon="email-outline"
          color="#2563EB"
          bg="#EFF6FF"
          title="Email Support"
          subtitle="Get a reply within 24 hours"
          onPress={() => Linking.openURL('mailto:support@motrac.app')}
        />
        <SupportLink
          icon="whatsapp"
          color="#16A34A"
          bg="#F0FDF4"
          title="WhatsApp Chat"
          subtitle="Chat with us directly on WhatsApp"
          onPress={() => Linking.openURL('https://wa.me/6281234567890')}
        />
        <SupportLink
          icon="robot-outline"
          color="#7C3AED"
          bg="#F5F3FF"
          title="AI Financial Advisor"
          subtitle="Ask our AI about your finances"
          onPress={() => router.push('/(tabs)/ai')}
        />

        {/* FAQ */}
        <Text className="font-bold text-[16px] text-gray-800 mt-6 mb-3">Frequently Asked Questions</Text>
        <View className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
          {FAQ_ITEMS.map((item, idx) => (
            <View key={idx} className={`p-5 ${idx !== FAQ_ITEMS.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <View className="flex-row items-start gap-3 mb-2">
                <View className="w-5 h-5 rounded-full bg-blue-100 items-center justify-center mt-0.5 shrink-0">
                  <Text className="text-[10px] font-bold text-blue-700">Q</Text>
                </View>
                <Text className="font-bold text-[14px] text-gray-900 flex-1">{item.q}</Text>
              </View>
              <View className="flex-row items-start gap-3">
                <View className="w-5 h-5 rounded-full bg-green-100 items-center justify-center mt-0.5 shrink-0">
                  <Text className="text-[10px] font-bold text-green-700">A</Text>
                </View>
                <Text className="text-[13px] text-gray-600 leading-5 flex-1">{item.a}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* App Info */}
        <View className="mt-6 items-center">
          <Text className="text-[12px] text-gray-400 font-medium">Motrac v1.0.0</Text>
          <Text className="text-[12px] text-gray-400 mt-1">Made with ❤️ for smarter finances</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
